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
import cache
import re
from typing import AsyncIterator


class TextRun(Region):
    text: str


class Page(pydantic.BaseModel):
    width: float
    height: float
    text_runs: list[TextRun]

    def get_region_text(self, region: Region) -> str:
        runs_in_region = list(filter(lambda t: region.encloses(t), self.text_runs))

        text_lines: list[list[str]] = [[]]
        while len(runs_in_region) > 0:
            runs_in_region.sort(key=lambda t: (t.y, t.x))
            first = runs_in_region.pop(0)
            text_lines[-1].append(first.text)
            horizontally_colliding = list(filter(lambda t: t.intersects_vertically(first), runs_in_region))
            for c in horizontally_colliding: # TODO make more efficient
                runs_in_region.remove(c)

            horizontally_colliding.sort(key=lambda t: t.x)
            text_lines[-1] += [t.text for t in horizontally_colliding]
            text_lines.append([])
        
        lines = [' '.join(l) for l in text_lines]
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


class DocumentBase(pydantic.BaseModel):
    id: int
    title: str
    correspondent: str | None
    document_type: str | None
    paperless_url: pydantic.AnyHttpUrl
    datetime_added: pydantic.AwareDatetime
    date_created: datetime.date


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
        with pdfplumber.open(pdf_path) as pdf:
            pages: list[Page] = []
            for page in pdf.pages:
                runs: list[TextRun] = []
                pdfplumber_text_runs = page.extract_words(keep_blank_chars=True, x_tolerance=int(X_TOLERANCE), y_tolerance=int(Y_TOLERANCE), use_text_flow=False)
                for text_run in pdfplumber_text_runs:
                    runs.append(TextRun(text=text_run['text'].strip(), x=text_run['x0'], y=text_run['top'], x2=text_run['x1'], y2=text_run['bottom']))
                pages.append(Page(text_runs=runs, width=page.width, height=page.height))
            
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
            )
            return document


@cache.file_cache('pdf_page_svg', '.svg') # type: ignore
async def get_pdf_page_svg(paperless_id: int, page_nr: int) -> bytes:
    async with get_temporary_pdf_download(paperless_id) as pdf_path:
        proc = await asyncio.create_subprocess_exec('/usr/bin/pdftocairo', '-svg', '-f', str(page_nr + 1), '-l', str(page_nr + 1), str(pdf_path), '-', stdout=subprocess.PIPE)
        stdout, _ = await proc.communicate()
        return stdout
