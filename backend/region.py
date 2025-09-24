import pydantic
import typing
import re
from simple_expr import simple_expr_to_regex, ExpressionError

if typing.TYPE_CHECKING:
    from document import Page


Pt = typing.NewType('Pt', float)


class RegionBase(pydantic.BaseModel):
    x: Pt
    y: Pt
    x2: Pt
    y2: Pt

    def encloses(self, other: 'RegionBase') -> bool:
        assert self.x2 >= self.x
        assert self.y2 >= self.y
        assert other.x2 >= other.x
        assert other.y2 >= other.y

        return self.x <= other.x <= self.x2 and self.x <= other.x2 <= self.x2 and \
               self.y <= other.y <= self.y2 and self.y <= other.y2 <= self.y2

    def intersects_vertically(self, other: 'RegionBase') -> bool:
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


class Region(RegionBase):
    page: int | typing.Literal['first_match', 'last_match'] = 'last_match'
    kind: typing.Literal['simple', 'regex']
    simple_expr: str | None = None
    regex_expr: str | None = None

    def evaluate_on_page(self, page: 'Page') -> 'RegionResult':
        text = page.get_region_text(self)
        return self.evaluate_on_text(page.page_nr, text)

    def evaluate_on_text(self, page_nr: int, text: str) -> 'RegionResult':

        regex = None
        if self.kind == 'regex':
            if not self.regex_expr:
                return RegionResult.no_match(text)
            regex = self.regex_expr

        elif self.kind == 'simple':
            if not self.simple_expr:
                return RegionResult.no_match(text)
            try:
                regex = simple_expr_to_regex(self.simple_expr)
            except ExpressionError as e:
                return RegionResult(text=text, error=str(e), group_values=None, group_positions=None, is_retained=False)

        if regex is None:
                return RegionResult.no_match(text)

        try:
            options = re.DOTALL | re.MULTILINE
            if self.kind == 'simple':
                options |= re.IGNORECASE
            if match := re.search(regex, text, options):

                group_values: dict[str, str] = {}
                group_positions: list[tuple[int, int]] = []
                for name, index in match.re.groupindex.items():
                    start, end = match.span(index)
                    if start != -1:  # group actually matched
                        group_values[name] = match.group(name)
                        group_positions.append((start, end))

                return RegionResult(text=text, error=None, group_values=group_values, group_positions=group_positions, is_retained=False)
            else:
                return RegionResult.no_match(text=text)
        except re.error as e:
            return RegionResult(text=text, error=e.msg, group_values=None, group_positions=None, is_retained=False)

    def get_selected_result(self, results: list['RegionResult']) -> 'RegionResult | None':
        selected_page_result: RegionResult | None = None
        if self.page == 'first_match':
            selected_page_result = next(iter(filter(lambda r: r.group_values is not None, results)), None)
        elif self.page == 'last_match':
            selected_page_result = next(iter(filter(lambda r: r.group_values is not None, results[::-1])), None)
        else:
            page_nr = self.page
            selected_page_result = results[page_nr]

        return selected_page_result


class RegionResult(pydantic.BaseModel):
    text: str
    error: str | None
    group_values: typing.Mapping[str, str] | None # None indicates "no match", empty dict indicates match but no capturing groups
    group_positions: list[tuple[int, int]] | None
    is_retained: bool | None = None # Updated after 

    @classmethod
    def no_match(cls, text: str):
        return RegionResult(text=text, error=None, group_values=None, group_positions=None, is_retained=False)

    @classmethod
    def results_to_values(cls, results: list[list['RegionResult']]) -> dict[str, str]:
        res: dict[str, str] = {}

        for region_res in results:
            for page_res in region_res:
                if page_res.is_retained:
                    for name, value in (page_res.group_values or {}).items():
                        res[name] = value

        return res
