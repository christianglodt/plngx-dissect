import decimal
import datetime
import pydantic
import jinja2
import jinja2.sandbox
from typing import Literal, cast

import paperless


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

    def render(self, region_values: dict[str, str]) -> FieldResult:
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

    async def get_result(self, client: paperless.PaperlessClient, region_values: dict[str, str]) -> FieldResult:
        custom_fields_by_name = await client.custom_fields_by_name

        field_result = self.render(region_values)
        if not field_result.error:
            if self.kind == 'custom':
                if not self.name in custom_fields_by_name:
                    field_result.error = f'Field {self.name} not found'
                else:
                    field_def = custom_fields_by_name[self.name]
                    field_result.data_type = field_def.data_type
                    try:
                        if field_result.value is not None:
                            converted_value = field_def.convert_value_to_paperless(field_result.value)
                            field_result.value = str(converted_value)
                    except paperless.PaperlessValueConversionException as e:
                        field_result.value = None
                        field_result.error = str(e)

            if self.kind == 'attr':
                attributes = await client.get_element_list('attributes')
                attribute = next(iter(filter(lambda a: a.name == self.name, attributes)), None)
                if attribute is None:
                    field_result.error = f'Attribute {self.name} not found'
                else:
                    attribute = cast(paperless.PaperlessAttribute, attribute)
                    try:
                        if field_result.value is not None:
                            converted_value = paperless.value_to_paperless(attribute.data_type, field_result.value)
                            field_result.value = str(converted_value)
                    except paperless.PaperlessValueConversionException as e:
                        field_result.value = None
                        field_result.error = str(e)
        return field_result
