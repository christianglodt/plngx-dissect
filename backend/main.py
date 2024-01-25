from fastapi import FastAPI, HTTPException, Response
from fastapi.staticfiles import StaticFiles
from apscheduler.schedulers.asyncio import AsyncIOScheduler # type: ignore
from apscheduler.triggers.cron import CronTrigger # type: ignore
import aiohttp
import pydantic

import paperless
import pattern
import document
import matching

import dotenv

dotenv.load_dotenv('../.env')


app = FastAPI()

@app.get('/api/patterns')
async def get_pattern_list() -> list[pattern.PatternListEntry]:
    return await pattern.list_patterns()


class CreatePatternRequestBody(pydantic.BaseModel):
    name: str


@app.post('/api/patterns')
async def create_pattern(request: CreatePatternRequestBody) -> pattern.Pattern:
    return await pattern.create_pattern(request.name)


@app.get('/api/pattern/{name:path}')
async def get_pattern(name: str) -> pattern.Pattern:
    try:
        return await pattern.get_pattern(name)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail='Pattern not found')


@app.put('/api/pattern/{name:path}')
async def put_pattern(name: str, p: pattern.Pattern) -> pattern.Pattern:
    if name != p.name:
        raise HTTPException(status_code=400, detail="Name in URL must correspond to name in body payload")
    await pattern.put_pattern(p)
    return p


@app.delete('/api/pattern/{name:path}')
async def delete_pattern(name: str):
    await pattern.delete_pattern(name)


@app.post('/api/pattern/{name:path}/rename')
async def rename_pattern(name: str, new_name: str):
    await pattern.rename_pattern(name, new_name)


@app.get('/api/document/{document_id}/svg', response_class=Response)
async def get_document_svg(document_id: int, page_nr: int = 0) -> Response:
    data = await document.get_pdf_page_svg(document_id, page_nr)
    return Response(content=data, media_type='image/svg+xml')


@app.post('/api/document/{document_id}/{page_nr}/evaluate_pattern')
async def evaluate_pattern(document_id: int, page_nr: int, p: pattern.Pattern) -> pattern.PatternEvaluationResult:
    client = paperless.PaperlessClient()
    return await p.evaluate(document_id, page_nr, client)


@app.get('/api/document/{document_id}')
async def get_document(document_id: int) -> document.Document:
    try:
        return await document.get_parsed_document(document_id)
    except aiohttp.ClientResponseError as e:
        raise HTTPException(status_code=e.status, detail=e.message)
    except aiohttp.ClientConnectorError as e:
        raise HTTPException(status_code=500, detail=str(e.strerror))


@app.post('/api/documents/matching_pattern')
async def get_documents_matching_pattern(p: pattern.Pattern) -> list[document.DocumentBase]:
    MAX_RESULTS = 20

    res: list[document.DocumentBase] = []
    async for d in matching.get_documents_matching_pattern(p):
        res.append(d)

        if len(res) == MAX_RESULTS:
            break
    return res


@app.get('/api/paperless_element/{slug}')
async def get_paperless_element_list(slug: str) -> list[paperless.PaperlessNamedElement]:
    return await paperless.PaperlessClient().get_element_list(slug)


scheduler = AsyncIOScheduler()
trigger = CronTrigger(**matching.SCHEDULER_PATTERN)


@scheduler.scheduled_job(trigger) # type: ignore
async def process_patterns():
    await matching.process_all_documents()


scheduler.start()

app.mount('/', StaticFiles(directory='../plngx-dissect-frontend/dist/', html=True, check_dir=False))
