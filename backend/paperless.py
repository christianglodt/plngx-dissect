import aiohttp
import os
import aiohttp.client_exceptions
import pydantic
from typing import TypeVar, Mapping, Any, Literal, Generic, Type, Collection, AsyncIterator, AsyncGenerator
import datetime
import decimal
import dotenv
import asyncstdlib
import urllib.parse
import asyncio
import logging
from contextlib import asynccontextmanager

dotenv.load_dotenv('../.env')

log = logging.getLogger('uvicorn')

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


class CustomFieldValueConversionException(Exception):
    pass


PaperlessCustomFieldValueType = str | datetime.date | bool | int | float | decimal.Decimal | list[int] | None


class PaperlessCustomField(pydantic.BaseModel):
    id: int
    name: str
    data_type: Literal['string', 'url', 'date', 'boolean', 'integer', 'float', 'monetary', 'documentlink']

    def convert_value_to_paperless(self, value: str) -> PaperlessCustomFieldValueType:
        match self.data_type:
            case 'string':
                return str(value)
            case 'url':
                try:
                    pydantic.AnyHttpUrl(value)
                    return value
                except pydantic.ValidationError as e:
                    raise CustomFieldValueConversionException('Invalid URL') from e
            case 'date':
                try:
                    return datetime.date.fromisoformat(value)
                except ValueError as e:
                    raise CustomFieldValueConversionException('Invalid date (expected ISO YYYY-MM-DD)') from e
            case 'boolean':
                try:
                    return { 'true': True, 'false': False, 'yes': True, 'no': False }[value.lower()]
                except KeyError:
                    raise CustomFieldValueConversionException('Invalid boolean (expected true, false, yes or no)')
            case 'integer':
                try:
                    return int(value)
                except ValueError:
                    raise CustomFieldValueConversionException('Invalid integer')
            case 'float':
                try:
                    return float(value)
                except ValueError:
                    raise CustomFieldValueConversionException('Invalid float')
            case 'monetary':
                try:
                    return decimal.Decimal(value)
                except decimal.InvalidOperation as e:
                    raise CustomFieldValueConversionException(f'Invalid monetary/decimal value')
            case 'documentlink':
                PaperlessCustomFieldDocumentLinkValue = pydantic.RootModel[list[int]]
                try:
                    return PaperlessCustomFieldDocumentLinkValue.model_validate_json(value).model_dump()
                except pydantic.ValidationError:
                    raise CustomFieldValueConversionException('Invalid document link (expected JSON list of integers)')


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
    color: str
    is_inbox_tag: bool


class PaperlessCustomFieldValue(pydantic.BaseModel):
    value: PaperlessCustomFieldValueType
    field: int


class PaperlessDocument(pydantic.BaseModel):
    id: int
    correspondent: int | None
    document_type: int | None
    storage_path: int | None
    title: str
    content: str
    tags: list[int]
    created: datetime.date
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
    pass # last_correspondence: pydantic.AwareDatetime


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
            
            tries = 5
            for _ in range(tries):
                try:
                    async with session.get(str(url), headers={'Authorization': f'Token {self.api_token}'}) as response:
                        try:
                            response.raise_for_status()
                            yield response
                            return
                        except aiohttp.client_exceptions.ClientResponseError as e:
                            if e.status == 500:
                                # Paperless db connection can raise "sorry, too many clients already" error,
                                # try again after delay.
                                await asyncio.sleep(1)
                except aiohttp.client_exceptions.ClientConnectorError as e:
                    if 'host.docker.internal:8009' in str(e):
                        raise IOError('When ssh-tunneling to paperless-ngx, ensure to use "ssh -L 0.0.0.0:8009:localhost:8009 <user@server>"') from e
                    raise


    @asynccontextmanager
    async def _put(self, url: str | pydantic.AnyHttpUrl, obj: pydantic.BaseModel) -> AsyncIterator[aiohttp.ClientResponse]:
        async with aiohttp.ClientSession() as session:
            if PAPERLESS_FORCE_SSL:
                url = ensure_https(url)
            async with session.put(str(url), headers={'Authorization': f'Token {self.api_token}', 'Content-type': 'application/json'}, data=obj.model_dump_json()) as response:
                response.raise_for_status()
                yield response

    async def _iter_paginated_results[PaperlessDataT](self, url: str, result_type: Type[PaperlessDataT]) -> AsyncGenerator[PaperlessDataT, None]:
        current_url: str | pydantic.AnyHttpUrl | None = url
        while current_url is not None:
            async with self._get(current_url) as response:
                response.raise_for_status()
                response_obj: PaperlessResponse[PaperlessDataT] = PaperlessResponse[result_type].model_validate(await response.json())
                for obj in response_obj.results:
                    yield obj
                current_url = response_obj.next
    
    @asyncstdlib.cached_property
    async def tags_by_id(self) -> Mapping[int, PaperlessTag]:
        return { t.id: t async for t in self._iter_paginated_results(f'{self.base_url}/api/tags/?page_size=1000', PaperlessTag) }

    @asyncstdlib.cached_property
    async def tags_by_name(self) -> Mapping[str, PaperlessTag]:
        return { t.name: t for t in (await self.tags_by_id).values() }

    @asyncstdlib.cached_property
    async def custom_fields_by_id(self) -> Mapping[int, PaperlessCustomField]:
        return { f.id: f async for f in self._iter_paginated_results(f'{self.base_url}/api/custom_fields/?page_size=1000', PaperlessCustomField) }

    @asyncstdlib.cached_property
    async def custom_fields_by_name(self) -> Mapping[str, PaperlessCustomField]:
        return { t.name: t for t in (await self.custom_fields_by_id).values() }

    @asyncstdlib.cached_property
    async def correspondents_by_id(self) -> Mapping[int, PaperlessCorrespondent]:
        return { c.id: c async for c in self._iter_paginated_results(f'{self.base_url}/api/correspondents/?page_size=1000', PaperlessCorrespondent) }
    
    @asyncstdlib.cached_property
    async def correspondents_by_name(self) -> Mapping[str, PaperlessCorrespondent]:
        return { c.name: c for c in (await self.correspondents_by_id).values() }

    @asyncstdlib.cached_property
    async def document_types_by_id(self) -> Mapping[int, PaperlessDocumentType]:
        return { t.id: t async for t in self._iter_paginated_results(f'{self.base_url}/api/document_types/?page_size=1000', PaperlessDocumentType) }

    @asyncstdlib.cached_property
    async def document_types_by_name(self) -> Mapping[str, PaperlessDocumentType]:
        return { t.name: t for t in (await self.document_types_by_id).values() }

    @asyncstdlib.cached_property
    async def storage_paths_by_id(self) -> Mapping[int, PaperlessStoragePath]:
        return { p.id: p async for p in self._iter_paginated_results(f'{self.base_url}/api/storage_paths/?page_size=1000', PaperlessStoragePath) }

    async def get_document_by_id(self, document_id: int) -> PaperlessDocument:
        url = f'{self.base_url}/api/documents/{document_id}/'
        async with self._get(url) as response:
            return PaperlessDocument.model_validate(await response.json())

    async def put_document(self, document: PaperlessDocument):
        async with self._put(f'{self.base_url}/api/documents/{document.id}/', document):
            return

    async def get_documents_with_tags(self, required_tags: Collection[str], excluded_tags: Collection[str], correspondents: Collection[str] = [], document_types: Collection[str] = []) -> AsyncIterator[PaperlessDocument]:
        tags_by_name = await self.tags_by_name
        try:
            required_tag_ids = [str(tags_by_name[tag].id) for tag in required_tags]
            excluded_tag_ids = [str(tags_by_name[tag].id) for tag in excluded_tags]
        except KeyError as e:
            log.error(f'Tag "{e}" not found in paperless, no documents returned')
            return

        url_params: dict[str, str] = {}
        url_params['page_size'] = '50'
        url_params['tags__id__all'] = ",".join(required_tag_ids)
        url_params['tags__id__none'] = ",".join(excluded_tag_ids)

        if correspondents:
            correspondents_by_name = await self.correspondents_by_name
            correspondent_ids = [str(correspondents_by_name[c].id) for c in correspondents if c in correspondents_by_name]
            url_params['correspondent__id__in'] = ",".join(correspondent_ids)
        
        if document_types:
            document_types_by_name = await self.document_types_by_name
            document_type_ids = [str(document_types_by_name[t].id) for t in document_types if t in document_types_by_name]
            url_params['document_type__id__in'] = ",".join(document_type_ids)

        query_string = urllib.parse.urlencode(url_params, safe=",")

        url = f'{self.base_url}/api/documents/?{query_string}'
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
    