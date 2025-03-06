import pydantic
from datetime import datetime
from typing import Literal
import pathlib
import aiofiles
import ryaml


HISTORY_PATH = pathlib.Path('../data/history').resolve()

MAX_HISTORY_SIZE = 50


class HistoryItem(pydantic.BaseModel):
    id: int
    title: str
    datetime: datetime
    operation: Literal['updated']
    details: str


class History(pydantic.RootModel[list[HistoryItem]]):
    root: list[HistoryItem]

    def __iter__(self): # type: ignore
        return iter(self.root)

    def __getitem__(self, index: int) -> HistoryItem:
        return self.root[index]


async def get_history() -> History:
    try:
        async with aiofiles.open(HISTORY_PATH / 'history.yml', 'r', encoding='utf-8') as f:
            history = ryaml.loads(await f.read())
            return History.model_validate(history)
    except FileNotFoundError:
        return History([])


async def save_history(history: History):
    async with aiofiles.open(HISTORY_PATH / 'history.yml', 'w', encoding='utf-8') as f:
        await f.write(ryaml.dumps(history.model_dump(mode='json')))


async def add_history_item(item: HistoryItem):
    history = await get_history()
    history.root.append(item)
    history.root = history.root[-MAX_HISTORY_SIZE:]
    await save_history(history)


async def history_log_update(paperless_id: int, title: str, details: str) -> HistoryItem:
    item = HistoryItem(id=paperless_id, title=title, datetime=datetime.now(), operation='updated', details=details)
    await add_history_item(item)
    return item
