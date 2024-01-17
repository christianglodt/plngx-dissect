from fastapi import FastAPI, HTTPException, Response
from fastapi.staticfiles import StaticFiles
import aiohttp
import paperless

import pattern
import document

import dotenv

dotenv.load_dotenv('../.env')


app = FastAPI()


@app.get('/api/patterns')
async def get_pattern_list() -> list[pattern.PatternListEntry]:
    return await pattern.list_patterns()


@app.get('/api/pattern/{name}')
async def get_pattern(name: str) -> pattern.Pattern:
    try:
        return await pattern.get_pattern(name)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail='Pattern not found')


@app.put('/api/pattern/{name}')
async def put_pattern(name: str, p: pattern.Pattern) -> pattern.Pattern:
    if name != p.name:
        raise HTTPException(status_code=400, detail="Name in URL must correspond to name in body payload")
    await pattern.put_pattern(p)
    return p


@app.get('/api/document/{document_id}/svg', response_class=Response)
async def get_document_svg(document_id: int, page_nr: int = 0) -> Response:
    data = await document.get_pdf_page_svg(document_id, page_nr)
    return Response(content=data, media_type='image/svg+xml')


@app.get('/api/document/{document_id}')
async def get_document(document_id: int) -> document.Document:
    try:
        return await document.get_parsed_document(document_id)
    except aiohttp.ClientResponseError as e:
        raise HTTPException(status_code=e.status, detail=e.message)
    except aiohttp.ClientConnectorError as e:
        raise HTTPException(status_code=500, detail=str(e.strerror))

@app.get('/api/tags')
async def get_tag_list() -> list[paperless.PaperlessTag]:
    tags_by_id = await paperless.PaperlessClient().tags_by_id()
    return list(tags_by_id.values())


app.mount('/', StaticFiles(directory='../plngx-dissect-frontend/dist/', html=True, check_dir=False))
