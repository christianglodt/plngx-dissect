import pydantic
from typing import Literal
import abc
import datetime

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


