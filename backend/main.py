from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from apscheduler.schedulers.asyncio import AsyncIOScheduler # type: ignore
from apscheduler.triggers.cron import CronTrigger # type: ignore
import aiohttp
import pydantic
import json
import paperless
import pattern
import document
import matching
import pathlib
import os

import dotenv

dotenv.load_dotenv('../.env')

RAW_PATH_PREFIX = '/' + os.environ.get('PATH_PREFIX', '').strip('/')
PATH_PREFIX = '' if RAW_PATH_PREFIX == '/' else RAW_PATH_PREFIX

app = FastAPI(docs_url=PATH_PREFIX + '/docs', redoc_url=PATH_PREFIX + '/redoc')

api_app = FastAPI()

@api_app.get('/patterns')
async def get_pattern_list() -> list[pattern.PatternListEntry]:
    return await pattern.list_patterns()


class CreatePatternRequestBody(pydantic.BaseModel):
    name: str


@api_app.post('/patterns')
async def create_pattern(request: CreatePatternRequestBody) -> pattern.Pattern:
    return await pattern.create_pattern(request.name)


@api_app.get('/pattern/{name:path}')
async def get_pattern(name: str) -> pattern.Pattern:
    try:
        return await pattern.get_pattern(name)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail='Pattern not found')


@api_app.put('/pattern/{name:path}')
async def put_pattern(name: str, p: pattern.Pattern) -> pattern.Pattern:
    if name != p.name:
        raise HTTPException(status_code=400, detail="Name in URL must correspond to name in body payload")
    await pattern.put_pattern(p)
    return p


@api_app.delete('/pattern/{name:path}')
async def delete_pattern(name: str):
    await pattern.delete_pattern(name)


@api_app.post('/pattern/{name:path}/rename')
async def rename_pattern(name: str, new_name: str):
    await pattern.rename_pattern(name, new_name)


@api_app.get('/document/{document_id}/svg', response_class=Response)
async def get_document_svg(document_id: int, page_nr: int = 0) -> Response:
    data = await document.get_pdf_page_svg(document_id, page_nr)
    return Response(content=data, media_type='image/svg+xml')


@api_app.post('/document/{document_id}/{page_nr}/evaluate_pattern')
async def evaluate_pattern(document_id: int, page_nr: int, p: pattern.Pattern) -> pattern.PatternEvaluationResult:
    client = paperless.PaperlessClient()
    return await p.evaluate(document_id, page_nr, client)


@api_app.get('/document/{document_id}')
async def get_document(document_id: int) -> document.Document:
    try:
        return await document.get_parsed_document(document_id)
    except aiohttp.ClientResponseError as e:
        raise HTTPException(status_code=e.status, detail=e.message)
    except aiohttp.ClientConnectorError as e:
        raise HTTPException(status_code=500, detail=str(e.strerror))


@api_app.post('/documents/matching_pattern')
async def get_documents_matching_pattern(p: pattern.Pattern) -> list[document.DocumentBase]:
    # FastAPI will use the serializer for the declared return type (DocumentBase), not the one
    # for the actual type (Document). We rely on this to omit the bulky page data from this endpoint.
    MAX_RESULTS = 50

    res: list[document.DocumentBase] = []
    async for d in matching.get_documents_matching_pattern(p):
        res.append(d)

        if len(res) == MAX_RESULTS:
            break
    return res


@api_app.get('/paperless_element/{slug}')
async def get_paperless_element_list(slug: str) -> list[paperless.PaperlessNamedElement]:
    return await paperless.PaperlessClient().get_element_list(slug)


templates = Jinja2Templates(directory="templates")
 
@api_app.get('/config.js')
async def config_js(request: Request):
    return templates.TemplateResponse(request=request, name="config.js", context={"path_prefix": PATH_PREFIX}, media_type='text/javascript')


app.mount(PATH_PREFIX + '/api', api_app)
app.mount(PATH_PREFIX + '/static', StaticFiles(directory='../plngx-dissect-frontend/dist/', html=True, check_dir=False))

templates = Jinja2Templates(directory="templates")

try:
    with open('../plngx-dissect-frontend/dist/.vite/manifest.json', 'rb') as f:
        manifest = json.load(f)
except FileNotFoundError:
    # must be in development mode
    manifest = None

@app.get('/{path_name:path}')
async def catch_all(request: Request, path_name: str):
    if manifest is None:
        raise HTTPException(status_code=500, detail='No manifest found, run "npm run build" or access via vite dev server')

    p = pathlib.Path(path_name)
    if not path_name.endswith('/'):
        p = p.parent

    relative_path = str(pathlib.Path((PATH_PREFIX + '/static').lstrip('/')).relative_to(p, walk_up=True))
    css_files = [relative_path + '/' + c for c in manifest['index.html']['css']]
    js_file = relative_path + '/' + manifest['index.html']['file']
    return templates.TemplateResponse(request=request, name="index.html", context={"path_prefix": PATH_PREFIX, 'css_files': css_files, 'js_file': js_file}, media_type='text/html')


scheduler = AsyncIOScheduler()
trigger = CronTrigger(**matching.SCHEDULER_PATTERN)

@scheduler.scheduled_job(trigger) # type: ignore
async def process_patterns():
    await matching.process_all_documents()

scheduler.start()
