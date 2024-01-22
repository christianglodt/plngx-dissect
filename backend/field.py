import pydantic
import jinja2

import region


class FieldResult(pydantic.BaseModel):
    value: str | None
    error: str | None


class Field(pydantic.BaseModel):
    name: str
    template: str

    def get_result(self, region_results: list[region.RegionResult|None]) -> FieldResult:

        context: dict[str, str] = {}
        for r in region_results:
            if r is None:
                continue
            context.update(r.group_values)

        template = jinja2.Template(self.template)
        value = template.render(**context)
        return FieldResult(value=value, error=None)
