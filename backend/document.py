import datetime
import pydantic
from region import Pt, Region, RegionRegex, RegionResult
import paperless
import aiofiles
import asyncio
import subprocess
from contextlib import asynccontextmanager
import pathlib
import pdfplumber
import pdfminer.psparser
import cache
import re
import logging
from typing import AsyncIterator, Literal


logging.getLogger('pdfminer').setLevel(logging.WARN) # silence debug logging from pdfplumber/pdfminer
log = logging.getLogger(__name__)


class TextRun(Region):
    text: str

    def __hash__(self):
        return hash((TextRun, self.text, hash(super())))


def split_runs_into_lines(runs: list[TextRun]) -> list[list[TextRun]]:
    if not runs:
        return []

    y_points: list[tuple[Pt, Literal['start', 'end'], TextRun]] = []
    for run in runs:
        y_points.append((run.y, 'start', run))
        y_points.append((run.y2, 'end', run))
    
    y_points = sorted(y_points, key=lambda yp: yp[0])

    depth = 0
    lines: list[list[TextRun]] = []
    current_line: list[TextRun] = []
    for _y, kind, run in y_points:

        if kind == 'start':
            depth += 1
            current_line.append(run)

        if kind == 'end':
            depth -= 1

            if depth == 0:
                # gap starts
                lines.append(sorted(current_line, key=lambda tr: tr.x))
                current_line = []

    if current_line:
        lines.append(sorted(current_line, key=lambda tr: tr.x))

    return lines


class Page(pydantic.BaseModel):
    width: float
    height: float
    text_runs: list[TextRun]

    def get_region_text_lines(self, region: Region) -> list[list[str]]:
        # TODO optimize filtering (bisect?)
        runs_in_region = list(filter(lambda t: region.encloses(t), self.text_runs))
        text_lines = split_runs_into_lines(runs_in_region)
        return [[tr.text for tr in line] for line in text_lines]

    def get_region_text(self, region: Region) -> str:
        text_lines = self.get_region_text_lines(region)        
        lines = [' '.join(word) for word in text_lines]
        text = '\n'.join(lines)
        return text

    def evaluate_region(self, region: RegionRegex) -> RegionResult:
        text = self.get_region_text(region)
        group_values = {}

        error = None
        try:
            if match := re.search(region.regex, text, re.DOTALL | re.MULTILINE):
                group_values = match.groupdict()
        except re.error as e:
            error = e.msg

        return RegionResult(text=text, group_values=group_values, error=error)


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


@asynccontextmanager
async def get_temporary_pdf_download(paperless_id: int) -> AsyncIterator[pathlib.Path]:
    c = paperless.PaperlessClient()
    async with c.get_document_stream(paperless_id) as stream:
        async with aiofiles.tempfile.NamedTemporaryFile('wb', prefix=f'paperless-{paperless_id}', suffix='.pdf') as f:
            while True:
                data, _ = await stream.readchunk()
                if not data:
                    break
                await f.write(data)
            yield pathlib.Path(str(f.name))


X_TOLERANCE: Pt = Pt(6)
Y_TOLERANCE: Pt = Pt(3)

@cache.pydantic_yaml_cache(Document, 'parsed_document', ignore_kwargs=['client']) # TODO cache should consider last_modified time from paperless document # type: ignore
async def get_parsed_document(paperless_id: int, client: paperless.PaperlessClient | None = None) -> Document:
    client = client or paperless.PaperlessClient()
    correspondents_by_id = await client.correspondents_by_id
    document_types_by_id = await client.document_types_by_id
    paperless_doc = await client.get_document_by_id(paperless_id)

    async with get_temporary_pdf_download(paperless_id) as pdf_path:
        pages: list[Page] = []
        error: str | None = None

        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    runs: list[TextRun] = []
                    pdfplumber_text_runs = page.extract_words(keep_blank_chars=True, x_tolerance=int(X_TOLERANCE), y_tolerance=int(Y_TOLERANCE), use_text_flow=False)
                    for text_run in pdfplumber_text_runs:
                        runs.append(TextRun(text=text_run['text'].strip(), x=text_run['x0'], y=text_run['top'], x2=text_run['x1'], y2=text_run['bottom']))
                    pages.append(Page(text_runs=runs, width=page.width, height=page.height))
                log.info('Parsed "%s" from %s', paperless_doc.title , pdf_path)
        except pdfminer.psparser.PSException as e:
            error = str(e)
            log.error('Error parsing "%s" from %s: %s', paperless_doc.title , pdf_path, error)
        
        correspondent = correspondents_by_id[paperless_doc.correspondent].name if paperless_doc.correspondent else None
        document_type = document_types_by_id[paperless_doc.document_type].name if paperless_doc.document_type else None
        document = Document(
            id=paperless_id,
            title=paperless_doc.title,
            correspondent=correspondent,
            document_type=document_type,
            datetime_added=paperless_doc.added,
            date_created=paperless_doc.created_date,
            paperless_url=pydantic.TypeAdapter(pydantic.AnyHttpUrl).validate_strings(f'{paperless.PAPERLESS_URL}/documents/{paperless_id}/details'),
            pages=pages,
            parse_status=DocumentParseStatus(datetime_parsed=datetime.datetime.now().astimezone(), error=error)
        )
        return document


@cache.file_cache('pdf_page_svg', '.svg') # type: ignore
async def get_pdf_page_svg(paperless_id: int, page_nr: int) -> bytes:
    async with get_temporary_pdf_download(paperless_id) as pdf_path:
        proc = await asyncio.create_subprocess_exec('/usr/bin/pdftocairo', '-svg', '-f', str(page_nr + 1), '-l', str(page_nr + 1), str(pdf_path), '-', stdout=subprocess.PIPE)
        stdout, _ = await proc.communicate()
        return stdout
