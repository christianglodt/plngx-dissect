from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

import pattern

import dotenv

dotenv.load_dotenv('../.env')


app = FastAPI()


@app.get('/api/patterns')
async def get_pattern_list() -> list[pattern.PatternListEntry]:
    return await pattern.list_patterns()


@app.get('/api/pattern/{name}')
async def get_pattern(name: str) -> pattern.Pattern:
    return await pattern.get_pattern(name)


@app.post('/api/pattern/{name}')
async def put_pattern(name: str, p: pattern.Pattern):
    await pattern.put_pattern(p)
    


app.mount('/', StaticFiles(directory='../plngx-dissect-frontend/dist/', html=True, check_dir=False))
