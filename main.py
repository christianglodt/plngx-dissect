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


app = FastAPI()


@app.get('/api/docs')
async def docs():
    import paperless
    c = paperless.PaperlessClient()
    return await c.document_types_by_id()

app.mount('/', StaticFiles(directory='/app/plngx-dissect-frontend/dist/', html=True, check_dir=False))
