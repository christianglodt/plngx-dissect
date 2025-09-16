import decimal
import datetime
import pydantic
import jinja2
import jinja2.sandbox
from typing import Literal

import region


def parse_date(date_str: str, format: str ='%d/%m/%Y') -> datetime.date:
    return datetime.datetime.strptime(date_str, format).date()


def parse_monetary(s: str) -> decimal.Decimal:
    if ',' in s and '.' in s:
        dec_point = s[-3]
        if dec_point == '.':
            s = s.replace(',', '')
        elif dec_point == ',':
            s = s.replace('.', '').replace(',', '.')
    elif ',' in s:
        s = s.replace(',', '.')
    return decimal.Decimal(s)



class FieldResult(pydantic.BaseModel):
    data_type: str | None = None
    value: str | None
    error: str | None


class Field(pydantic.BaseModel):
    kind: Literal['attr', 'custom'] = 'custom'
    name: str
    template: str

    def get_result(self, region_values: dict[str, str]) -> FieldResult:

        try:
            env = jinja2.sandbox.SandboxedEnvironment()
            env.filters['parse_monetary'] = parse_monetary # type: ignore
            env.filters['parse_date'] = parse_date         # type: ignore
            template = env.from_string(self.template)
            value = template.render(**region_values)
            error = None
        except jinja2.exceptions.TemplateError as e:
            value = None
            error = e.message
        except Exception as e:
            value = None
            error = str(e)
        return FieldResult(value=value, error=error)
