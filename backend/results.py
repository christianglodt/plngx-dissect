import pydantic
from typing import Annotated, Mapping, cast
from collections import defaultdict
import pathlib
import logging

log = logging.getLogger('uvicorn')


RESULTS_FILE_PATH = pathlib.Path('../data/state/results.json').resolve()
RESULTS_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)


class ProcessedDocument(pydantic.BaseModel):
    id: int
    title: str


class ProcessingError(pydantic.BaseModel):
    document: ProcessedDocument
    pattern_name: str
    error: str


class ProcessingResults(pydantic.BaseModel):
    errors: Annotated[list[ProcessingError], pydantic.Field(default_factory=list)]
    matched: Annotated[Mapping[int, list[str]], pydantic.Field(default_factory=lambda: cast(Mapping[int, list[str]], defaultdict(list)))]
    unmatched: Annotated[list[ProcessedDocument], pydantic.Field(default_factory=list)]

    def register_error(self, document_id: int, document_title: str, pattern_name: str, error: str):
        self.errors.append(ProcessingError(document=ProcessedDocument(id=document_id, title=document_title), pattern_name=pattern_name, error=error))

    def register_match(self, document_id: int, pattern_name: str):
        self.matched[document_id].append(pattern_name)

    def register_unmatched(self, document_id: int, document_title: str):
        self.unmatched.append(ProcessedDocument(id=document_id, title=document_title))

    def save(self):
        try:
            tmp_file = (RESULTS_FILE_PATH.parent / 'results.json.tmp').resolve()
            tmp_file.write_text(self.model_dump_json())
            tmp_file.rename(RESULTS_FILE_PATH)
        except Exception as e:
            log.error(f'Error saving results.json: {e}')
