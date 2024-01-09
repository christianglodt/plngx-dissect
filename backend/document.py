import pydantic
from region import Pt, Region
import paperless
import aiofiles
import asyncio
import subprocess
from contextlib import asynccontextmanager
import pathlib
import pdfplumber
import cache
from typing import AsyncIterator

class TextRun(Region):
    text: str


class Page(pydantic.BaseModel):
    text_runs: list[TextRun]


class Document(pydantic.BaseModel):
    id: int
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

@cache.pydantic_yaml_cache(Document, 'parsed_document')
async def get_parsed_document(paperless_id: int) -> Document:
    async with get_temporary_pdf_download(paperless_id) as pdf_path:
        with pdfplumber.open(pdf_path) as pdf:
            pages: list[Page] = []
            for page in pdf.pages:
                runs: list[TextRun] = []
                pdfplumber_text_runs = page.extract_words(keep_blank_chars=True, x_tolerance=int(X_TOLERANCE), y_tolerance=int(Y_TOLERANCE), use_text_flow=False)
                for text_run in pdfplumber_text_runs:
                    runs.append(TextRun(text=text_run['text'].strip(), x=text_run['x0'], y=text_run['top'], x2=text_run['x1'], y2=text_run['bottom']))
                pages.append(Page(text_runs=runs))
            
            document = Document(id=paperless_id, pages=pages)
            return document


@cache.file_cache('pdf_page_svg')
async def get_pdf_page_svg(paperless_id: int, page_nr: int) -> bytes:
    async with get_temporary_pdf_download(paperless_id) as pdf_path:
        proc = await asyncio.create_subprocess_exec('/usr/bin/inkscape', '--export-plain-svg', '--export-filename=-', f'--pdf-page={page_nr + 1}', str(pdf_path), stdout=subprocess.PIPE)
        stdout, _ = await proc.communicate()
        return stdout
