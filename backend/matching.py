#!/usr/bin/env python

import os
from typing import AsyncIterator, Annotated, Literal
from pydantic import BaseModel, Field, NaiveDatetime

import paperless
from document import DocumentBase, get_parsed_document
from pattern import Pattern, list_patterns, get_pattern

import dotenv

dotenv.load_dotenv('../.env')


class SchedulerPattern(BaseModel): # https://apscheduler.readthedocs.io/en/latest/modules/triggers/cron.html#apscheduler.triggers.cron.CronTrigger
    year: Annotated[int, Field(ge=0, le=9999)] | str | None = None
    month: Annotated[int, Field(ge=1, le=12)] | str| None = None
    day: Annotated[int, Field(ge=1, le=31)] | str| None = None
    week: Annotated[int, Field(ge=1, le=53)] | str| None = None
    day_of_week: Annotated[int, Field(ge=0, le=6)] | Literal['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] | None = None
    hour: Annotated[int, Field(ge=0, le=23)] | str| None = None
    minute: Annotated[int, Field(ge=0, le=59)] | str| None = None
    second: Annotated[int, Field(ge=0, le=59)] | str| None = None
    start_date: NaiveDatetime | str| None = None
    end_date: NaiveDatetime | str| None = None
    timezone: str | None  = None
    jitter: int | None = None


DEFAULT_SCHEDULER_PATTERN = SchedulerPattern(hour='*')
SCHEDULER_PATTERN = SchedulerPattern.model_validate_json(os.environ.get('SCHEDULER_PATTERN', DEFAULT_SCHEDULER_PATTERN.model_dump_json())).model_dump()

REQUIRED_TAGS = [t.strip() for t in os.environ.get('PAPERLESS_REQUIRED_TAGS', '').split(',') if t.strip() != '']
POST_PROCESS_REMOVE_TAGS = [t.strip() for t in os.environ.get('POST_PROCESS_REMOVE_TAGS', '').split(',') if t.strip() != '']
POST_PROCESS_ADD_TAGS = [t.strip() for t in os.environ.get('POST_PROCESS_ADD_TAGS', '').split(',') if t.strip() != '']


async def get_documents_matching_pattern(pattern: Pattern) -> AsyncIterator[DocumentBase]:
    client = paperless.PaperlessClient()
    async for paperless_doc in client.get_documents_with_tags(REQUIRED_TAGS):
        doc = await get_parsed_document(paperless_doc.id)
        
        if await pattern.matches(doc, paperless_doc, client):
            yield DocumentBase(id=doc.id, paperless_url=doc.paperless_url, title=doc.title, datetime_added=paperless_doc.added, date_created=paperless_doc.created)


async def process_all_documents():
    patterns: list[Pattern] = []
    for p in await list_patterns():
        patterns.append(await get_pattern(p.name))

    client = paperless.PaperlessClient()
    tags_by_name = await client.tags_by_name()
    custom_fields_by_name = await client.custom_fields_by_name()
    client.custom_fields_by_id

    remove_tag_ids = [tags_by_name[t].id for t in POST_PROCESS_REMOVE_TAGS]
    add_tag_ids = [tags_by_name[t].id for t in POST_PROCESS_ADD_TAGS]

    async for paperless_doc in client.get_documents_with_tags(REQUIRED_TAGS):
        doc = await get_parsed_document(paperless_doc.id)

        paperless_doc_has_changed = False
        for pattern in patterns:
            if await pattern.matches(doc, paperless_doc, client):
                result = await pattern.evaluate(paperless_doc.id, pattern.page, client)
                
                for t_id in remove_tag_ids:
                    if t_id in paperless_doc.tags:
                        paperless_doc_has_changed = True
                    paperless_doc.tags.remove(t_id)
                
                for t_id in add_tag_ids:
                    if t_id not in paperless_doc.tags:
                        paperless_doc_has_changed = True
                    paperless_doc.tags.append(t_id)

                
                for field, field_result in zip(pattern.fields, result.fields):
                    field_id = custom_fields_by_name[field.name].id
                    if field_result is not None:
                        if field_id not in [f.field for f in paperless_doc.custom_fields]:
                            paperless_doc_has_changed = True

                        new_value = paperless.PaperlessCustomFieldValue(field=field_id, value=field_result.value)
                        new_custom_fields = list(filter(lambda f: f.field == field_id, paperless_doc.custom_fields))
                        new_custom_fields.append(new_value)
                        paperless_doc.custom_fields = new_custom_fields
        
        if paperless_doc_has_changed:
            pass # TODO add note (using POST to endpoint /paperless/api/documents/{id}/notes/ ?)
            
            #await client.put_document(paperless_doc)


if __name__ == '__main__':
    import asyncio
    import pathlib
    if pathlib.Path(os.getcwd()).resolve() != pathlib.Path(__file__).parent.resolve():
        raise Exception('Must be run from directory containing matching.py')
    asyncio.run(process_all_documents())
