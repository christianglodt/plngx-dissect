#!/usr/bin/env python

import os
import logging
from typing import AsyncIterator, Annotated, Literal
from pydantic import BaseModel, Field, NaiveDatetime

import paperless
from document import DocumentBase, get_parsed_document
from pattern import Pattern, list_patterns, get_pattern

logging.basicConfig(format='%(asctime)s %(levelname)8s: %(message)s', level=logging.DEBUG)
log = logging.getLogger(__name__)

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

PAPERLESS_REQUIRED_TAGS = [t.strip() for t in os.environ.get('PAPERLESS_REQUIRED_TAGS', '').split(',') if t.strip() != '']
POST_PROCESS_REMOVE_TAGS = [t.strip() for t in os.environ.get('POST_PROCESS_REMOVE_TAGS', '').split(',') if t.strip() != '']
POST_PROCESS_ADD_TAGS = [t.strip() for t in os.environ.get('POST_PROCESS_ADD_TAGS', '').split(',') if t.strip() != '']
POST_PROCESS_DONT_SAVE = os.environ.get('POST_PROCESS_DONT_SAVE', 'False').lower() == 'true'


async def filter_documents_matching_pattern(paperless_docs: AsyncIterator[paperless.PaperlessDocument], pattern: Pattern, client: paperless.PaperlessClient) -> AsyncIterator[DocumentBase]:
    async for paperless_doc in paperless_docs:
        doc = await get_parsed_document(paperless_doc.id, client=client)
        
        if await pattern.matches(doc, paperless_doc, client):
            # Return DocumentBase, which is the model used for listing documents (ie. not including page data)
            # TODO find better way to remove pages from returned doc (copy? unparse/parse?)
            yield DocumentBase(id=doc.id, paperless_url=doc.paperless_url, title=doc.title, correspondent=doc.correspondent, document_type=doc.document_type, datetime_added=paperless_doc.added, date_created=paperless_doc.created, parse_status=doc.parse_status)


async def get_documents_matching_pattern(pattern: Pattern) -> AsyncIterator[DocumentBase]:
    client = paperless.PaperlessClient()

    # Find topmost correspondent and document checks and use them in paperless query.
    # This reduces the number of results needing to be checked significantly in the most common case.
    correspondents, document_types = pattern.get_required_correspondents_and_document_types()

    paperless_docs = client.get_documents_with_tags(PAPERLESS_REQUIRED_TAGS, correspondents=correspondents, document_types=document_types)

    async for doc in filter_documents_matching_pattern(paperless_docs, pattern, client):
        yield doc


async def process_all_documents():
    log.info(f'Processing all documents with tags {PAPERLESS_REQUIRED_TAGS}')

    patterns: list[Pattern] = []
    for p in await list_patterns():
        patterns.append(await get_pattern(p.name))
    log.debug(f'Loaded {len(patterns)} patterns')

    client = paperless.PaperlessClient()
    tags_by_name = await client.tags_by_name
    log.debug(f'Retrieved tags by name from Paperless')
    custom_fields_by_id = await client.custom_fields_by_id
    custom_fields_by_name = await client.custom_fields_by_name
    log.debug(f'Retrieved custom fields by name from Paperless')

    try:
        remove_tag_ids = [tags_by_name[t].id for t in POST_PROCESS_REMOVE_TAGS]
        add_tag_ids = [tags_by_name[t].id for t in POST_PROCESS_ADD_TAGS]
        [tags_by_name[t].id for t in PAPERLESS_REQUIRED_TAGS]
    except KeyError as e:
        log.error(f'Tag with name "{e.args[0]}" used in PAPERLESS_REQUIRED_TAGS, POST_PROCESS_REMOVE_TAGS or POST_PROCESS_ADD_TAGS does not exist')
        return

    async for paperless_doc in client.get_documents_with_tags(PAPERLESS_REQUIRED_TAGS):
        log.debug(f'Retrieved paperless document {paperless_doc.id}')
        doc = await get_parsed_document(paperless_doc.id, client=client)
        log.debug(f'Loaded cached text runs for document {doc.id}')

        paperless_doc_has_changed = False
        for pattern in patterns:
            if await pattern.matches(doc, paperless_doc, client):
                log.debug(f'Pattern "{pattern.name}" matches against document {doc.id}')
                result = await pattern.evaluate(paperless_doc.id, pattern.page, client)
                
                for t_id in remove_tag_ids:
                    if t_id in paperless_doc.tags:
                        paperless_doc_has_changed = True
                        paperless_doc.tags.remove(t_id)
                        log.debug('Removed tag {tags_by_id[t_id]} from document {doc.id}')
                
                for t_id in add_tag_ids:
                    if t_id not in paperless_doc.tags:
                        paperless_doc_has_changed = True
                        paperless_doc.tags.append(t_id)
                        log.debug('Added tag {tags_by_id[t_id]} to document {doc.id}')

                
                for field, field_result in zip(pattern.fields, result.fields):
                    field_id = custom_fields_by_name[field.name].id
                    if field_result is not None:
                        field_def = custom_fields_by_id[field_id]
                        field_value = field_result.value
                        try:
                            if field_value is not None:
                                field_value = field_def.convert_value_to_paperless(field_value)
                        except paperless.CustomFieldValueConversionException as e:
                            log.error(f'Invalid value {field_value!r} for custom field "{field_def.name}" of data type "{field_def.data_type}"')
                            continue

                        if field_id not in [f.field for f in paperless_doc.custom_fields]:
                            paperless_doc_has_changed = True

                        new_value = paperless.PaperlessCustomFieldValue(field=field_id, value=field_value) # TODO check value against expected type (also in UI)
                        new_custom_fields = list(filter(lambda f: f.field != field_id, paperless_doc.custom_fields))
                        new_custom_fields.append(new_value)
                        paperless_doc.custom_fields = new_custom_fields
                        log.info(f'Updated custom fields of document {doc.id} to {new_custom_fields}')
        
        if paperless_doc_has_changed:
            pass # TODO add note (using POST to endpoint /paperless/api/documents/{id}/notes/ ?)
            
            if POST_PROCESS_DONT_SAVE:
                log.info(f'Did not save document {paperless_doc.id} to Paperless (POST_PROCESS_DONT_SAVE)')
            else:
                await client.put_document(paperless_doc)
                log.info(f'Saved document {paperless_doc.id} to Paperless')


if __name__ == '__main__':
    import asyncio
    import pathlib
    if pathlib.Path(os.getcwd()).resolve() != pathlib.Path(__file__).parent.resolve():
        raise Exception('Must be run from directory containing matching.py')
    asyncio.run(process_all_documents())
