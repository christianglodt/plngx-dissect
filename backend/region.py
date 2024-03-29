import pydantic
import typing


Pt = typing.NewType('Pt', float)


class Region(pydantic.BaseModel):
    x: Pt
    y: Pt
    x2: Pt
    y2: Pt

    def encloses(self, other: 'Region') -> bool:
        assert self.x2 >= self.x
        assert self.y2 >= self.y
        assert other.x2 >= other.x
        assert other.y2 >= other.y

        return self.x <= other.x <= self.x2 and self.x <= other.x2 <= self.x2 and \
               self.y <= other.y <= self.y2 and self.y <= other.y2 <= self.y2

    def intersects_vertically(self, other: 'Region') -> bool:
        assert self.x2 >= self.x
        assert self.y2 >= self.y
        assert other.x2 >= other.x
        assert other.y2 >= other.y

        if other.y2 <= self.y or other.y >= self.y2:
            return False
        return True

    @property
    def w(self) -> Pt:
        return typing.cast(Pt, self.x2 - self.x)

    @property
    def h(self) -> Pt:
        return typing.cast(Pt, self.y2 - self.y)

    def __hash__(self):
        return hash((Region, self.x, self.y, self.x2, self. y2))


class RegionRegex(Region):
    regex: str


class RegionResult(pydantic.BaseModel):
    text: str | None
    error: str | None
    group_values: typing.Mapping[str, str]
