import aiohttp
import os
import pydantic
from typing import TypeVar, Mapping, Any, Literal, Generic, Type, Collection, AsyncIterator, AsyncGenerator
import datetime
import decimal
import dotenv
import asyncstdlib
import urllib.parse
from contextlib import asynccontextmanager


dotenv.load_dotenv('../.env')

PAPERLESS_URL: str = os.environ.get('PAPERLESS_URL', 'http://localhost').rstrip('/')
PAPERLESS_API_TOKEN: str = os.environ.get('PAPERLESS_API_TOKEN', '')
PAPERLESS_FORCE_SSL: bool = os.environ.get('PAPERLESS_FORCE_SSL', 'False').lower() == 'true'


PaperlessDataT = TypeVar('PaperlessDataT')


class PaperlessResponse(pydantic.BaseModel, Generic[PaperlessDataT]):
    count: int
    all: list[int]
    results: list[PaperlessDataT]
    next: pydantic.AnyHttpUrl | None
    previous: pydantic.AnyHttpUrl | None


class PaperlessCustomField(pydantic.BaseModel):
    id: int
    name: str
    data_type: Literal['string', 'monetary']


class PaperlessNamedElement(pydantic.BaseModel):
    id: int
    name: str

class PaperlessElementBase(PaperlessNamedElement):
    slug: str
    match: str
    matching_algorithm: int
    is_insensitive: bool
    document_count: int
    owner: int
    user_can_change: bool


class PaperlessTag(PaperlessElementBase):
    colour: int
    is_inbox_tag: bool


class PaperlessCustomFieldValue(pydantic.BaseModel):
    value: str | decimal.Decimal | None
    field: int


class PaperlessDocument(pydantic.BaseModel):
    id: int
    correspondent: int | None
    document_type: int | None
    storage_path: int | None
    title: str
    content: str
    tags: list[int]
    created: pydantic.AwareDatetime
    created_date: datetime.date
    modified: pydantic.AwareDatetime
    added: pydantic.AwareDatetime
    archive_serial_number: str | None
    original_file_name: str
    archived_file_name: str
    owner: int | None
    user_can_change: bool
    is_shared_by_requester: bool
    notes: list[Any]
    custom_fields: list[PaperlessCustomFieldValue]


class PaperlessCorrespondent(PaperlessElementBase):
    last_correspondence: pydantic.AwareDatetime


class PaperlessDocumentType(PaperlessElementBase):
    pass


class PaperlessStoragePath(PaperlessElementBase):
    path: str


def ensure_https(url: str|pydantic.AnyHttpUrl) -> str:
    parts = list(urllib.parse.urlsplit(str(url)))
    parts[0] = 'https'
    return urllib.parse.urlunsplit(parts)


class PaperlessClient:
    def __init__(self, base_url: str = PAPERLESS_URL, api_token: str = PAPERLESS_API_TOKEN):
        self.base_url = base_url
        self.api_token = api_token

    @asynccontextmanager
    async def _get(self, url: str | pydantic.AnyHttpUrl) -> AsyncIterator[aiohttp.ClientResponse]:
        async with aiohttp.ClientSession() as session:
            if PAPERLESS_FORCE_SSL:
                url = ensure_https(url)
            async with session.get(str(url), headers={'Authorization': f'Token {self.api_token}'}) as response:
                response.raise_for_status()
                yield response

    async def _iter_paginated_results(self, url: str, result_type: Type[PaperlessDataT]) -> AsyncGenerator[PaperlessDataT, None]:
        current_url: str | pydantic.AnyHttpUrl | None = url
        while current_url is not None:
            async with self._get(current_url) as response:
                response.raise_for_status()
                response_obj: PaperlessResponse[result_type] = PaperlessResponse[result_type].model_validate(await response.json())
                for obj in response_obj.results:
                    yield obj
                current_url = response_obj.next
    
    @asyncstdlib.cached_property
    async def tags_by_id(self) -> Mapping[int, PaperlessTag]:
        return { t.id: t async for t in self._iter_paginated_results(f'{self.base_url}/api/tags/', PaperlessTag) }

    async def tags_by_name(self) -> Mapping[str, PaperlessTag]:
        return { t.name: t for t in (await self.tags_by_id).values() }

    @asyncstdlib.cached_property
    async def custom_fields_by_id(self) -> Mapping[int, PaperlessCustomField]:
        return { f.id: f async for f in self._iter_paginated_results(f'{self.base_url}/api/custom_fields/', PaperlessCustomField) }

    async def custom_fields_by_name(self) -> Mapping[str, PaperlessCustomField]:
        return { t.name: t for t in (await self.custom_fields_by_id).values() }

    @asyncstdlib.cached_property
    async def correspondents_by_id(self) -> Mapping[int, PaperlessCorrespondent]:
        return { c.id: c async for c in self._iter_paginated_results(f'{self.base_url}/api/correspondents/', PaperlessCorrespondent) }

    @asyncstdlib.cached_property
    async def document_types_by_id(self) -> Mapping[int, PaperlessDocumentType]:
        return { t.id: t async for t in self._iter_paginated_results(f'{self.base_url}/api/document_types/', PaperlessDocumentType) }

    @asyncstdlib.cached_property
    async def storage_paths_by_id(self) -> Mapping[int, PaperlessStoragePath]:
        return { p.id: p async for p in self._iter_paginated_results(f'{self.base_url}/api/storage_paths/', PaperlessStoragePath) }

    async def get_document_by_id(self, document_id: int) -> PaperlessDocument:
        url = f'{self.base_url}/api/documents/{document_id}/'
        async with self._get(url) as response:
            response.raise_for_status()
            return PaperlessDocument.model_validate(await response.json())

    async def get_documents_with_tags(self, tags: Collection[str]) -> AsyncIterator[PaperlessDocument]:
        tags_by_name = await self.tags_by_name()
        tag_ids = [tags_by_name[tag].id for tag in tags]
        url = f'{self.base_url}/api/documents/?tags__id__all={",".join(str(tag_id) for tag_id in tag_ids)}'
        async for d in self._iter_paginated_results(url, PaperlessDocument):
            yield d

    @asynccontextmanager
    async def get_document_stream(self, document_id: int) -> AsyncIterator[aiohttp.StreamReader]:
        url = f'{self.base_url}/api/documents/{document_id}/download/'
        async with self._get(url) as response:
            yield response.content

    async def get_element_list(self, slug: str) -> list[PaperlessNamedElement]:
        res: list[PaperlessNamedElement] = []

        async for e in self._iter_paginated_results(f'{self.base_url}/api/{slug}/', PaperlessNamedElement):
            res.append(e)

        return res
    