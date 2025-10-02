import datetime
import pydantic
from region import Pt, Region, RegionBase, RegionResult
import paperless
import asyncio
import pdfplumber
import pdfminer.psparser
import cache
import logging
import bisect
import io
from typing import AsyncIterable, AsyncIterator, Literal, cast, Hashable


logging.getLogger('pdfminer').setLevel(logging.WARN) # silence debug logging from pdfplumber/pdfminer
log = logging.getLogger(__name__)


class TextRun(RegionBase):
    text: str

    def __hash__(self):
        return hash((TextRun, self.text, hash(super())))


def split_runs_into_lines(runs: list[TextRun]) -> list[list[TextRun]]:
    if not runs:
        return []

    y_points: list[tuple[Pt, Literal['s', 'e'], TextRun]] = []
    for run in runs:
        # Adjust top y-coord down by 25% of text height to reduce considered height of text for this step.
        # This reduces failures to detect y-gaps due to page skew, etc.
        adjusted_y = cast(Pt, run.y + run.h * 0.25)
        y_points.append((adjusted_y, 's', run))
        y_points.append((run.y2, 'e', run))    

    y_points = sorted(y_points, key=lambda yp: yp[0])

    depth = 0
    lines: list[list[TextRun]] = []
    current_line: list[TextRun] = [] # This list is maintained in sorted-by-x order
    for _y, kind, run in y_points:

        if kind == 's':
            depth += 1
            bisect.insort(current_line, run, key=lambda tr: tr.x)

        if kind == 'e':
            depth -= 1

            if depth == 0:
                # gap starts
                lines.append(current_line)
                current_line = []

    if current_line:
        lines.append(current_line)

    return lines


class Page(pydantic.BaseModel):
    page_nr: int
    width: float
    height: float
    text_runs: list[TextRun]
    text_run_indexes_ordered_by_x: list[int]
    text_run_indexes_ordered_by_y: list[int]
    text_run_indexes_ordered_by_x2: list[int]
    text_run_indexes_ordered_by_y2: list[int]

    def get_region_text_lines(self, region: Region) -> list[list[str]]:
        def x_key(index: int) -> Pt:
            return self.text_runs[index].x
        
        def x2_key(index: int) -> Pt:
            return self.text_runs[index].x2
        
        def y_key(index: int) -> Pt:
            return self.text_runs[index].y

        def y2_key(index: int) -> Pt:
            return self.text_runs[index].y2

        x_index =  bisect.bisect(self.text_run_indexes_ordered_by_x,  region.x,  key=x_key)
        y_index =  bisect.bisect(self.text_run_indexes_ordered_by_y,  region.y,  key=y_key)
        x2_index = bisect.bisect(self.text_run_indexes_ordered_by_x2, region.x2, key=x2_key)
        y2_index = bisect.bisect(self.text_run_indexes_ordered_by_y2, region.y2, key=y2_key)
        
        result_indexes = set(self.text_run_indexes_ordered_by_x[x_index:]) & \
                         set(self.text_run_indexes_ordered_by_x2[:x2_index]) & \
                         set(self.text_run_indexes_ordered_by_y[y_index:]) & \
                         set(self.text_run_indexes_ordered_by_y2[:y2_index])
        
        runs_in_region = [self.text_runs[i] for i in result_indexes]

        text_lines = split_runs_into_lines(runs_in_region)
        return [[tr.text for tr in line] for line in text_lines]

    def get_region_text(self, region: Region) -> str:
        text_lines = self.get_region_text_lines(region)
        lines = [' '.join(word) for word in text_lines]
        text = '\n'.join(lines)
        return text

    def evaluate_region(self, region: Region) -> RegionResult:
        return region.evaluate_on_page(self)


class DocumentParseStatus(pydantic.BaseModel):
    datetime_parsed: pydantic.AwareDatetime
    error: str | None


class DocumentBase(pydantic.BaseModel):
    id: int
    title: str
    correspondent: str | None
    document_type: str | None
    paperless_url: pydantic.AnyHttpUrl
    datetime_added: pydantic.AwareDatetime
    date_created: datetime.date
    parse_status: DocumentParseStatus


class Document(DocumentBase):
    pages: list[Page]

    def evaluate_regions(self, regions: list[Region]) -> list[list[RegionResult]]: # 1 result per page
        region_page_res: list[list[RegionResult]] = []

        for region in regions:
            region_res: list[RegionResult] = []
            for page in self.pages:
                res = page.evaluate_region(region)
                region_res.append(res)
            region_page_res.append(region_res)
            
            selected_result = region.get_selected_result(region_res)
            if selected_result:
                selected_result.is_retained = True

        return region_page_res


async def get_pdf_data(paperless_id: int) -> AsyncIterator[bytes]:
    c = paperless.PaperlessClient()
    async with c.get_document_stream(paperless_id) as stream:
        while True:
            data, _ = await stream.readchunk()
            if not data:
                break
            yield data


async def async_iter_to_bytes(i: AsyncIterator[bytes]) -> io.BytesIO:
    res = io.BytesIO()
    async for chunk in i:
        res.write(chunk)
    return res


X_TOLERANCE: Pt = Pt(6)
Y_TOLERANCE: Pt = Pt(3)


async def get_parsed_document_extra_cache_key_func(paperless_id: int, client: paperless.PaperlessClient | None = None) -> tuple[Hashable, ...]:
    client = client or paperless.PaperlessClient()
    return (await client.get_document_modified_date(paperless_id),)


def get_pdf_pages(paperless_doc: paperless.PaperlessDocument, pdf_data: io.BytesIO) -> tuple[list[Page], str | None]:
    pages: list[Page] = []
    error: str | None = None

    try:
        with pdfplumber.open(pdf_data) as pdf:
            for index, page in enumerate(pdf.pages):
                runs: list[TextRun] = []
                pdfplumber_text_runs = page.extract_words(keep_blank_chars=False, x_tolerance=int(X_TOLERANCE), y_tolerance=int(Y_TOLERANCE), use_text_flow=False)
                for text_run in pdfplumber_text_runs:
                    runs.append(TextRun(text=text_run['text'].strip(), x=text_run['x0'], y=text_run['top'], x2=text_run['x1'], y2=text_run['bottom']))
                indexes_by_x = sorted(list(range(len(runs))), key=lambda i: runs[i].x)
                indexes_by_y = sorted(list(range(len(runs))), key=lambda i: runs[i].y)
                indexes_by_x2 = sorted(list(range(len(runs))), key=lambda i: runs[i].x2)
                indexes_by_y2 = sorted(list(range(len(runs))), key=lambda i: runs[i].y2)
                pages.append(Page(page_nr=index, text_runs=runs, width=page.width, height=page.height, text_run_indexes_ordered_by_x=indexes_by_x, text_run_indexes_ordered_by_y=indexes_by_y, text_run_indexes_ordered_by_x2=indexes_by_x2, text_run_indexes_ordered_by_y2=indexes_by_y2))
            log.info('Parsed "%s" (%i)', paperless_doc.title, paperless_doc.id)
    except pdfminer.psparser.PSException as e:
        error = str(e)
        log.error('Error parsing "%s" (%i): %s', paperless_doc.title, paperless_doc.id, error)

    return pages, error


@cache.pydantic_yaml_cache(Document, 'parsed_document', ignore_kwargs=['client'], extra_cache_key_func=get_parsed_document_extra_cache_key_func) # TODO cache should consider last_modified time from paperless document # type: ignore
async def get_parsed_document(paperless_id: int, *, client: paperless.PaperlessClient | None = None) -> Document:
    client = client or paperless.PaperlessClient()
    correspondents_by_id = await client.correspondents_by_id
    document_types_by_id = await client.document_types_by_id
    paperless_doc = await client.get_document_by_id(paperless_id)

    # Get pdf page data in thread because it might block the event loop
    pdf_data = await async_iter_to_bytes(get_pdf_data(paperless_id))
    pages, error = await asyncio.get_running_loop().run_in_executor(None, get_pdf_pages, paperless_doc, pdf_data)

    correspondent = correspondents_by_id[paperless_doc.correspondent].name if paperless_doc.correspondent else None
    document_type = document_types_by_id[paperless_doc.document_type].name if paperless_doc.document_type else None
    document = Document(
        id=paperless_id,
        title=paperless_doc.title,
        correspondent=correspondent,
        document_type=document_type,
        datetime_added=paperless_doc.added,
        date_created=paperless_doc.created,
        paperless_url=pydantic.TypeAdapter(pydantic.AnyHttpUrl).validate_strings(f'{paperless.PAPERLESS_URL}/documents/{paperless_id}/details'),
        pages=pages,
        parse_status=DocumentParseStatus(datetime_parsed=datetime.datetime.now().astimezone(), error=error)
    )
    return document


async def get_page_svg_document_modified_date(paperless_id: int, page_nr: int) -> tuple[Hashable, ...]:
    client = paperless.PaperlessClient()
    return (await client.get_document_modified_date(paperless_id), )


@cache.stream_cache('pdf_page_svg', extra_cache_key_func=get_page_svg_document_modified_date) # type: ignore
async def get_pdf_page_svg(paperless_id: int, page_nr: int) -> AsyncIterable[bytes]:
    proc = await asyncio.create_subprocess_exec('/usr/bin/pdftocairo', '-svg', '-f', str(page_nr + 1), '-l', str(page_nr + 1), '-', '-', stdin=asyncio.subprocess.PIPE, stdout=asyncio.subprocess.PIPE)
    assert proc.stdout is not None

    async def feed_input():
        assert proc.stdin is not None
        async for chunk in get_pdf_data(paperless_id):
            proc.stdin.write(chunk)
            await proc.stdin.drain()
        proc.stdin.close()
        await proc.stdin.wait_closed()

    # Start feeding in the background
    feeder = asyncio.create_task(feed_input())

    try:
        while True:
            chunk = await proc.stdout.read(65536)
            if not chunk:
                break
            yield chunk
    finally:
        await feeder
        await proc.wait()
