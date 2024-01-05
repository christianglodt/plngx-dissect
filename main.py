import threading
import sys
import os
import subprocess
import tempfile
import json

from typing import Union

from contextlib import asynccontextmanager
from fastapi import FastAPI, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from starlette.responses import StreamingResponse

import dotenv

dotenv.load_dotenv()

# import watcher
# watcher.start_watcher()

# VIS_OUTPUT_FILENAME = '/tmp/vis.json'


# # @app.get("/")
# # def read_root():
# #     return {"Hello": "World"}


# # @app.get("/items/{item_id}")
# # def read_item(item_id: int, q: Union[str, None] = None):
# #     return {"item_id": item_id, "q": q}

# def recompile_task():
#     env = dict(os.environ)
#     env['BEANCOUNT_EXPORT_VIS_JSON'] = VIS_OUTPUT_FILENAME
#     input_folder = os.environ.get('BEANCOUNT_VIS_INPUT_DATA', 'year/') # base folder for bean-extract
#     try:
#         res = subprocess.check_output(['bean-extract', 'config.py', input_folder], env=env, cwd='..', stderr=subprocess.STDOUT, encoding='utf-8')
#         print(f'Recompilation of {input_folder} succeeded')
#     except subprocess.CalledProcessError as e:
#         print(f'Error during recompilation of {input_folder}')
#         with tempfile.TemporaryDirectory(prefix='vis_') as tmp_dir:
#             tmp_filename = tmp_dir + '/error.json'
#             with open(tmp_filename, 'w') as f:
#                 data = {
#                     'input_files': [input_folder], # TODO support multiple?
#                     'status': 'error',
#                     'message': e.output
#                 }
#                 json.dump(data, f)
#             os.rename(tmp_filename, VIS_OUTPUT_FILENAME)


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     recompile_task()
#     yield


# app = FastAPI(lifespan=lifespan)

app = FastAPI()


# @app.get('/api/last_modified')
# def last_modified():
#     return { 'last_modified': str(os.stat(VIS_OUTPUT_FILENAME).st_mtime_ns) }


# @app.get('/api/vis.json')
# def vis_json():
#     return StreamingResponse(open(VIS_OUTPUT_FILENAME, 'rb'), media_type='application/json')


# @app.post('/api/recompile')
# def recompile(background_tasks: BackgroundTasks):
#     background_tasks.add_task(recompile_task)
#     return {}


app.mount('/', StaticFiles(directory='/app/plngx-dissect-frontend/dist/', html=True, check_dir=False))
