import pydantic
from typing import Literal
import abc
import datetime
import aiofiles
import aiofiles.os
import pathlib
import urllib.parse
import ryaml
import re

import region
import document
import field
from paperless import PaperlessClient, PaperlessDocument, CustomFieldValueConversionException


class Check(pydantic.BaseModel, abc.ABC):
    @abc.abstractmethod
    async def matches(self, page: document.Page, doc: document.Document, paperless_doc: PaperlessDocument, client: PaperlessClient) -> bool:
        raise NotImplementedError()


class NumPagesCheck(Check):
    type: Literal['num_pages']
    num_pages: int

    async def matches(self, page: document.Page, doc: document.Document, paperless_doc: PaperlessDocument, client: PaperlessClient) -> bool:
        return len(doc.pages) == self.num_pages


class RegionRegexCheck(region.RegionRegex):
    type: Literal['region']

    async def matches(self, page: document.Page, doc: document.Document, paperless_doc: PaperlessDocument, client: PaperlessClient) -> bool:
        text = page.get_region_text(self)
        if re.match(self.regex, text) is not None:
            return True
        return False


class TitleRegexCheck(Check):
    type: Literal['title']
    regex: str

    async def matches(self, page: document.Page, doc: document.Document, paperless_doc: PaperlessDocument, client: PaperlessClient) -> bool:
        return re.match(self.regex, doc.title) is not None


class CorrespondentCheck(Check):
    type: Literal['correspondent']
    name: str

    async def matches(self, page: document.Page, doc: document.Document, paperless_doc: PaperlessDocument, client: PaperlessClient) -> bool:
        correspondents = await client.correspondents_by_id
        c_name = correspondents[paperless_doc.correspondent].name if paperless_doc.correspondent != None else ''
        return c_name == self.name


class DocumentTypeCheck(Check):
    type: Literal['document_type']
    name: str

    async def matches(self, page: document.Page, doc: document.Document, paperless_doc: PaperlessDocument, client: PaperlessClient) -> bool:
        doc_types = await client.document_types_by_id
        d_name = doc_types[paperless_doc.document_type].name if paperless_doc.document_type != None else ''
        return d_name == self.name


class StoragePathCheck(Check):
    type: Literal['storage_path']
    name: str

    async def matches(self, page: document.Page, doc: document.Document, paperless_doc: PaperlessDocument, client: PaperlessClient) -> bool:
        storage_paths = await client.storage_paths_by_id
        s_name = storage_paths[paperless_doc.storage_path].name if paperless_doc.storage_path != None else ''
        return s_name == self.name


class TagCheck(Check):
    type: Literal['tags']
    includes: list[str] = []
    excludes: list[str] = []

    async def matches(self, page: document.Page, doc: document.Document, paperless_doc: PaperlessDocument, client: PaperlessClient) -> bool:
        tags = await client.tags_by_id
        document_tags = set([tags[t_id].name for t_id in paperless_doc.tags])
        
        for t in self.includes:
            if t not in document_tags:
                return False
        
        for t in self.excludes:
            if t in document_tags:
                return False

        return True


class DateCreatedCheck(Check):
    type: Literal['date_created']
    before: datetime.date | None = None
    after: datetime.date | None = None
    year: int | None = None

    async def matches(self, page: document.Page, doc: document.Document, paperless_doc: PaperlessDocument, client: PaperlessClient) -> bool:
        if self.before is not None and doc.date_created >= self.before:
            return False
        if self.after is not None and doc.date_created <= self.after:
            return False
        if self.year and doc.date_created.year != self.year:
            return False
        return True


class AndCheck(Check):
    type: Literal['and']
    checks: list['AnyCheck']

    async def matches(self, page: document.Page, doc: document.Document, paperless_doc: PaperlessDocument, client: PaperlessClient) -> bool:
        for check in self.checks:
            if not await check.matches(page, doc, paperless_doc, client):
                return False
        return True
    

class OrCheck(Check):
    type: Literal['or']
    checks: list['AnyCheck']

    async def matches(self, page: document.Page, doc: document.Document, paperless_doc: PaperlessDocument, client: PaperlessClient) -> bool:
        for check in self.checks:
            if await check.matches(page, doc, paperless_doc, client):
                return True
        return False


class NotCheck(Check):
    type: Literal['not']
    check: 'AnyCheck'

    async def matches(self, page: document.Page, doc: document.Document, paperless_doc: PaperlessDocument, client: PaperlessClient) -> bool:
        return not await self.check.matches(page, doc, paperless_doc, client)


AnyCheck = NumPagesCheck | RegionRegexCheck | TitleRegexCheck | CorrespondentCheck | DocumentTypeCheck | StoragePathCheck | TagCheck | DateCreatedCheck | AndCheck | OrCheck | NotCheck


class CheckResult(pydantic.BaseModel):
    passed: bool
    error: str | None


class PatternEvaluationResult(pydantic.BaseModel):
    # None values are present if pattern page match fails
    checks: list[CheckResult|None]
    regions: list[region.RegionResult|None]
    fields: list[field.FieldResult|None]


class Pattern(pydantic.BaseModel):
    page: int # 0 is first, -1 is last, other number is exact page number
    name: str
    checks: list[AnyCheck]
    regions: list[region.RegionRegex]
    fields: list[field.Field]

    async def matches(self, doc: document.Document, paperless_doc: PaperlessDocument, client: PaperlessClient) -> bool:
        try:
            page = doc.pages[self.page]
        except IndexError:
            return False

        for check in self.checks:
            try:
                if not await check.matches(page, doc, paperless_doc, client):
                    return False
            except:
                return False

        return True

    async def get_match_result(self, doc: document.Document, page_nr: int, paperless_doc: PaperlessDocument, client: PaperlessClient) -> list[CheckResult|None]:
        if self.page == -1 and page_nr != len(doc.pages) - 1:
            return [None] * len(self.checks)
        if self.page != -1 and page_nr != self.page:
            return [None] * len(self.checks)
        
        page = doc.pages[page_nr]

        res: list[CheckResult|None] = []
        for check in self.checks:
            try:
                passed = await check.matches(page, doc, paperless_doc, client)
                error = None
            except Exception as e:
                passed = False
                error = str(e)
            res.append(CheckResult(passed=passed, error=error))

        return res

    async def evaluate(self, document_id: int, page_nr: int, client: PaperlessClient) -> PatternEvaluationResult:

        doc = await document.get_parsed_document(document_id, client=client)
        paperless_doc = await client.get_document_by_id(document_id)

        check_results = await self.get_match_result(doc=doc, page_nr=page_nr, paperless_doc=paperless_doc, client=client)

        custom_fields_by_name = await client.custom_fields_by_name

        region_results: list[region.RegionResult|None] = []
        field_results: list[field.FieldResult|None] = []
        if any(r is None or r.passed == False for r in check_results):
            region_results = [None] * len(self.regions)
            field_results = [None] * len(self.fields)
        else:
            page = doc.pages[page_nr]
            for r in self.regions:
                region_results.append(page.evaluate_region(r))

            for f in self.fields:
                field_result = f.get_result(region_results)
                if not field_result.error:
                    if not f.name in custom_fields_by_name:
                        field_result.error = f'Field {f.name} not found'
                    else:
                        field_def = custom_fields_by_name[f.name]
                        field_result.data_type = field_def.data_type
                        try:
                            if field_result.value is not None:
                                converted_value = field_def.convert_value_to_paperless(field_result.value)
                                field_result.value = str(converted_value)
                        except CustomFieldValueConversionException as e:
                            field_result.value = None
                            field_result.error = str(e)
                field_results.append(field_result)

        return PatternEvaluationResult(checks=check_results, regions=region_results, fields=field_results)

    def get_required_correspondents_and_document_types(self) -> tuple[list[str], list[str]]:
        # Most patterns have simple checks (eg. one document type and one correspondent).
        # This method extracts these checks from the pattern so that they can be used
        # as url parameters when querying paperless, reducing the number of documents that
        # need to be checked when getting the list of documents matching a pattern.

        correspondents: list[str] = []
        document_types: list[str] = []

        for check in self.checks:
            # simple non-recursive loop to find

            if isinstance(check, CorrespondentCheck):
                correspondents.append(check.name)

            if isinstance(check, DocumentTypeCheck):
                document_types.append(check.name)

        return (correspondents, document_types)


class PatternListEntry(pydantic.BaseModel):
    name: str


CONFIG_PATH = pathlib.Path('../config').resolve()


def escape_name(name: str) -> str:
    return urllib.parse.quote(name, safe='') + '.yml'


def unescape_name(name: str) -> str:
    return urllib.parse.unquote(name)[:-len('.yml')]


def name_to_path(name: str) -> pathlib.Path:
    path_in_config = (CONFIG_PATH / escape_name(name)).resolve().relative_to(CONFIG_PATH)
    return CONFIG_PATH / path_in_config


def path_to_name(path: pathlib.Path) -> str:
    relative = (CONFIG_PATH / path).resolve().relative_to(CONFIG_PATH)
    return unescape_name(relative.name)


async def list_patterns() -> list[PatternListEntry]:
    res: list[PatternListEntry] = []
    for filename in await aiofiles.os.listdir(CONFIG_PATH):
        path = CONFIG_PATH / filename
        if path.suffix != '.yml':
            continue
        name = path_to_name(path)

        res.append(PatternListEntry(name=name))

    return res


async def create_pattern(name: str) -> Pattern:
    pattern = Pattern(name=name, page=0, checks=[], regions=[], fields=[])
    async with aiofiles.open(name_to_path(name), 'x') as f:
        await f.write(ryaml.dumps(pattern.model_dump(mode='json')))
    return pattern


async def get_pattern(name: str) -> Pattern:
    async with aiofiles.open(name_to_path(name), 'r', encoding='utf-8') as f:
        obj = ryaml.loads(await f.read())
        return Pattern.model_validate(obj)


async def put_pattern(pattern: Pattern):
    async with aiofiles.tempfile.NamedTemporaryFile('w', encoding='utf-8', dir=CONFIG_PATH) as f:
        await f.write(ryaml.dumps(pattern.model_dump(mode='json')))
        await aiofiles.os.rename(str(f.name), name_to_path(pattern.name))


async def delete_pattern(name: str):
    await aiofiles.os.remove(name_to_path(name))


async def rename_pattern(old_name: str, new_name: str):
    await create_pattern(new_name) # The purpose of this call is to fail if the file already exists
    pattern = await get_pattern(old_name)
    pattern.name = new_name
    await put_pattern(pattern)
    await delete_pattern(old_name)
