import pydantic
import typing
import decimal
from collections import abc

class Region(pydantic.BaseModel):
    x: decimal.Decimal
    y: decimal.Decimal
    width: decimal.Decimal
    height: decimal.Decimal


class Check(pydantic.BaseModel, abc.ABC):
    pass


class NumPagesCheck(Check):
    num_pages: int


class RegionRegexCheck(Check):
    region: Region
    regex: str


class RegionRegex(pydantic.BaseModel):
    region: Region
    regex: str


class Field(pydantic.BaseModel):
    name: str
    template: str


class Pattern(pydantic.BaseModel):
    name: str
    checks: list[Check]
    regions: list[RegionRegex]
    fields: list[Field]


