import pydantic
import typing


Pt = typing.NewType('Pt', float)


class Region(pydantic.BaseModel):
    x: Pt
    y: Pt
    x2: Pt
    y2: Pt
