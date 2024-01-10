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


class Check(pydantic.BaseModel, abc.ABC):
    pass


class NumPagesCheck(Check):
    type: Literal['num_pages']
    num_pages: int


class RegionRegexCheck(Check):
    type: Literal['region']
    region: region.Region
    regex: str


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
    checks: list[Check]


class OrCheck(Check):
    type: Literal['or']
    checks: list[Check]


class NotCheck(Check):
    type: Literal['not']
    check: Check


class RegionRegex(pydantic.BaseModel):
    region: region.Region
    regex: str


class Field(pydantic.BaseModel):
    name: str
    template: str


class Pattern(pydantic.BaseModel):
    name: str
    checks: list[Check]
    regions: list[RegionRegex]
    fields: list[Field]


class PatternListEntry(pydantic.BaseModel):
    name: str


CONFIG_PATH = pathlib.Path('/config')


async def list_patterns() -> list[PatternListEntry]:
    res: list[PatternListEntry] = []
    for filename in await aiofiles.os.listdir(CONFIG_PATH):
        path = CONFIG_PATH / filename
        if path.suffix != '.yml':
            continue
        name = urllib.parse.unquote(path.stem)

        res.append(PatternListEntry(name=name))

    return res


async def get_pattern(name: str) -> Pattern:
    escaped_name = urllib.parse.quote_plus(name) + '.yml'
    async with aiofiles.open(CONFIG_PATH / escaped_name, 'r', encoding='utf-8') as f:
        obj = ruamel.yaml.YAML().load(ruamel.yaml.StringIO(await f.read()))
        return Pattern.model_validate(obj)


async def put_pattern(pattern: Pattern):
    escaped_name = urllib.parse.quote_plus(pattern.name) + '.yml'
    async with aiofiles.tempfile.NamedTemporaryFile('w', encoding='utf-8', dir=CONFIG_PATH) as f:
        s = ruamel.yaml.StringIO()
        ruamel.yaml.dump(pattern.model_dump(), s)
        await f.write(s.getvalue())
        await f.close()
        await aiofiles.os.rename(str(f.name), CONFIG_PATH / escaped_name)
