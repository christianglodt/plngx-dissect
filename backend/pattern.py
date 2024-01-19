import pydantic
from typing import Literal
import abc
import datetime
import aiofiles
import aiofiles.os
import pathlib
import urllib.parse
import ruamel.yaml

import region

class RegionRegex(region.Region):
    regex: str


class Check(pydantic.BaseModel, abc.ABC):
    pass


class NumPagesCheck(Check):
    type: Literal['num_pages']
    num_pages: int


class RegionRegexCheck(RegionRegex):
    type: Literal['region']


class TitleRegexCheck(Check):
    type: Literal['title']
    regex: str


class CorrespondentCheck(Check):
    type: Literal['correspondent']
    name: str


class DocumentTypeCheck(Check):
    type: Literal['document_type']
    name: str


class StoragePathCheck(Check):
    type: Literal['storage_path']
    name: str


class TagCheck(Check):
    type: Literal['tags']
    includes: list[str] = []
    excludes: list[str] = []


class DateCreatedCheck(Check):
    type: Literal['date_created']
    before: datetime.date | None = None
    after: datetime.date | None = None
    year: int | None = None


class AndCheck(Check):
    type: Literal['and']
    checks: list['AnyCheck']


class OrCheck(Check):
    type: Literal['or']
    checks: list['AnyCheck']


class NotCheck(Check):
    type: Literal['not']
    check: 'AnyCheck'


class Field(pydantic.BaseModel):
    name: str
    template: str


AnyCheck = NumPagesCheck | RegionRegexCheck | TitleRegexCheck | CorrespondentCheck | DocumentTypeCheck | StoragePathCheck | TagCheck | DateCreatedCheck | AndCheck | OrCheck | NotCheck


class Pattern(pydantic.BaseModel):
    page: int # 0 is first, -1 is last, other number is exact page number
    name: str
    checks: list[AnyCheck]
    regions: list[RegionRegex]
    fields: list[Field]


class PatternListEntry(pydantic.BaseModel):
    name: str


CONFIG_PATH = pathlib.Path('../config').resolve()


def escape_name(name: str) -> str:
    return urllib.parse.quote_plus(name) + '.yml'


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
        s = ruamel.yaml.StringIO()
        ruamel.yaml.YAML().dump(pattern.model_dump(), s)
        await f.write(s.getvalue())
    return pattern


async def get_pattern(name: str) -> Pattern:
    async with aiofiles.open(name_to_path(name), 'r', encoding='utf-8') as f:
        obj = ruamel.yaml.YAML().load(ruamel.yaml.StringIO(await f.read()))
        return Pattern.model_validate(obj)


async def put_pattern(pattern: Pattern):
    async with aiofiles.tempfile.NamedTemporaryFile('w', encoding='utf-8', dir=CONFIG_PATH) as f:
        s = ruamel.yaml.StringIO()
        ruamel.yaml.YAML().dump(pattern.model_dump(), s)
        await f.write(s.getvalue())
        await aiofiles.os.rename(str(f.name), name_to_path(pattern.name))


async def delete_pattern(name: str):
    await aiofiles.os.remove(name_to_path(name))


async def rename_pattern(old_name: str, new_name: str):
    await create_pattern(new_name) # The purpose of this call is to fail if the file already exists
    pattern = await get_pattern(old_name)
    pattern.name = new_name
    await put_pattern(pattern)
    await delete_pattern(old_name)
