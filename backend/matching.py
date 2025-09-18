#!/usr/bin/env python

import os
import logging
import flufl.lock
import datetime
import pathlib
import itertools
from typing import AsyncIterator, Annotated, Literal, cast
from pydantic import BaseModel, Field, NaiveDatetime
# import aiomultiprocess
import asyncio
import paperless
from document import Document, get_parsed_document
from pattern import Pattern, list_patterns, get_pattern
from history import history_log_update

logging.basicConfig()
log = logging.getLogger('uvicorn')

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

PAPERLESS_REQUIRED_TAGS: list[str] = [t.strip() for t in os.environ.get('PAPERLESS_REQUIRED_TAGS', '').split(',') if t.strip() != '' and not t.strip().startswith('-')]
PAPERLESS_EXCLUDED_TAGS: list[str] = [t.strip().lstrip('-') for t in os.environ.get('PAPERLESS_REQUIRED_TAGS', '').split(',') if t.strip() != '' and t.strip().startswith('-')]
POST_PROCESS_ADD_TAGS =    [t.strip() for t in os.environ.get('POST_PROCESS_CHANGE_TAGS', '').split(',') if t.strip() != '' and not t.strip().startswith('-')]
POST_PROCESS_REMOVE_TAGS = [t.strip().lstrip('-') for t in os.environ.get('POST_PROCESS_CHANGE_TAGS', '').split(',') if t.strip() != '' and t.strip().startswith('-')]
POST_PROCESS_DONT_SAVE = os.environ.get('POST_PROCESS_DONT_SAVE', 'False').lower() == 'true'


async def filter_documents_matching_pattern(paperless_docs: AsyncIterator[paperless.PaperlessDocument], pattern: Pattern, client: paperless.PaperlessClient) -> AsyncIterator[Document]:
    async for paperless_doc in paperless_docs:
        doc = await get_parsed_document(paperless_doc.id, client=client)
        
        if await pattern.matches(doc, paperless_doc, client):
            yield doc


# aiomultiprocess-using parallel download and parsing of pdfs. Currently not usable because paperless PDF downloads
# occasionally fail when doing multiple downloads with a large number of parallel requests.
# async def get_doc_for_paperless_doc_if_pattern_matches(paperless_doc: paperless.PaperlessDocument, pattern: Pattern, client: paperless.PaperlessClient) -> Document | None:
#     doc = await get_parsed_document(paperless_doc.id, client=client)
#     if await pattern.matches(doc, paperless_doc, client):
#         yield doc
#
#
# async def filter_documents_matching_pattern_mp(paperless_docs: AsyncIterator[paperless.PaperlessDocument], pattern: Pattern, client: paperless.PaperlessClient) -> AsyncIterator[Document]:
#     async with aiomultiprocess.Pool() as pool:
#         coroutines: list[Awaitable[Document | None]] = []
#         async for pl_doc in paperless_docs:
#             cr = pool.apply(get_doc_for_paperless_doc_if_pattern_matches, [pl_doc, pattern, client])
#             coroutines.append(cr)
#         for doc in await asyncio.gather(*coroutines):
#             if doc:
#                 yield doc


async def get_documents_matching_pattern(pattern: Pattern, all_documents: bool = False) -> AsyncIterator[Document]:
    client = paperless.PaperlessClient()

    # Find topmost correspondent and document checks and use them in paperless query.
    # This reduces the number of results needing to be checked significantly in the most common case.
    correspondents, document_types = pattern.get_required_correspondents_and_document_types()

    required_tags = [] if all_documents else PAPERLESS_REQUIRED_TAGS
    excluded_tags = [] if all_documents else PAPERLESS_EXCLUDED_TAGS

    paperless_docs = client.get_documents_with_tags(required_tags, excluded_tags, correspondents=correspondents, document_types=document_types)

    async for doc in filter_documents_matching_pattern(paperless_docs, pattern, client):
        yield doc


lockfile_path = pathlib.Path('../data/state/processing.lock').resolve()
lockfile_path.parent.mkdir(parents=True, exist_ok=True)
processing_lock = flufl.lock.Lock(str(lockfile_path), lifetime=datetime.timedelta(hours=24))  # pyright: ignore[reportPrivateImportUsage]


async def process_all_documents():
    try:
        with processing_lock:
            log.info(f'Processing all documents with tags {PAPERLESS_REQUIRED_TAGS}')

            patterns = [await get_pattern(p.name) for p in await list_patterns()]
            log.debug(f'Loaded {len(patterns)} patterns')

            client = paperless.PaperlessClient()

            try:
                [await client.get_tag_by_name(t) for t in itertools.chain(POST_PROCESS_ADD_TAGS, POST_PROCESS_REMOVE_TAGS)]
            except paperless.TagNotFoundException as e:
                log.error(f'Tag with name "{e.args[0]}" used in PAPERLESS_REQUIRED_TAGS or POST_PROCESS_CHANGE_TAGS does not exist')
                return

            async for paperless_doc in client.get_documents_with_tags(PAPERLESS_REQUIRED_TAGS, PAPERLESS_EXCLUDED_TAGS):
                await process_document(paperless_doc, client, patterns)
    except flufl.lock.AlreadyLockedError:  # pyright: ignore[reportPrivateImportUsage]
        log.warning('Not processing documents because process_all_documents() is already running')


async def process_document(paperless_doc: paperless.PaperlessDocument, client: paperless.PaperlessClient | None = None, patterns: list[Pattern] | None = None) -> None:
    if client is None:
        client = paperless.PaperlessClient()

    if patterns is None:
        patterns = [await get_pattern(p.name) for p in await list_patterns()]
        log.debug(f'Loaded {len(patterns)} patterns')

    tags_by_name = await client.tags_by_name
    tags_by_id = await client.tags_by_id
    custom_fields_by_id = await client.custom_fields_by_id
    custom_fields_by_name = await client.custom_fields_by_name

    try:
        remove_tag_ids = [tags_by_name[t].id for t in POST_PROCESS_REMOVE_TAGS]
        add_tag_ids = [tags_by_name[t].id for t in POST_PROCESS_ADD_TAGS]
        [tags_by_name[t].id for t in PAPERLESS_REQUIRED_TAGS]
    except KeyError as e:
        log.error(f'Tag with name "{e.args[0]}" used in PAPERLESS_REQUIRED_TAGS or POST_PROCESS_CHANGE_TAGS does not exist')
        return

    log.debug(f'Retrieved document {paperless_doc.id}')
    doc = await get_parsed_document(paperless_doc.id, client=client)
    log.debug(f'Loaded cached text runs for document {doc.id}')

    if doc.parse_status.error != None:
        log.error(f'Document {doc.id} has parsing error, skipping (may want to delete from cache!)')
        return

    paperless_doc_has_changed = False
    for pattern in patterns:
        if await pattern.matches(doc, paperless_doc, client):
            log.debug(f'Pattern "{pattern.name}" matches against document {doc.id}')
            result = await pattern.evaluate(paperless_doc.id, client)
                        
            if any(f and f.error for f in result.fields):
                log.error(f'Skipping "{pattern.name}" for document {doc.id} due to errors: {", ".join(f.error for f in result.fields if f and f.error)}')
                continue

            for t_id in remove_tag_ids:
                if t_id in paperless_doc.tags:
                    paperless_doc_has_changed = True
                    paperless_doc.tags.remove(t_id)
                    log.debug(f'Removed tag "{tags_by_id[t_id].name}" from document {doc.id}')
                        
            for t_id in add_tag_ids:
                if t_id not in paperless_doc.tags:
                    paperless_doc_has_changed = True
                    paperless_doc.tags.append(t_id)
                    log.debug(f'Added tag "{tags_by_id[t_id].name}" to document {doc.id}')

            custom_field_set_has_changed = False
            for field, field_result in zip(pattern.fields, result.fields):
                if field_result is None:
                    continue # should not happen since pattern has matched

                if field.kind == 'custom':
                    field_id = custom_fields_by_name[field.name].id
                    field_def = custom_fields_by_id[field_id]
                    new_value = field_result.value
                    try:
                        if new_value is not None:
                            new_value = field_def.convert_value_to_paperless(new_value)
                    except paperless.PaperlessValueConversionException as e:
                        log.error(f'Invalid value {new_value!r} for custom field "{field_def.name}" of data type "{field_def.data_type}"')
                        continue

                    existing_field = next(iter(filter(lambda f: f.field == field_id, paperless_doc.custom_fields)), None)
                    try:
                        old_value = paperless.value_to_python(field_def.data_type, existing_field.value) if existing_field else object()
                        if old_value != new_value:
                            paperless_doc_has_changed = True
                            custom_field_set_has_changed = True
                    except paperless.PaperlessValueConversionException as e:
                        if existing_field:
                            log.info(f'Previous value {existing_field.value!r} for custom field "{field_def.name}" of data type "{field_def.data_type}" is not a valid value')
                        else:
                            log.info(f'No previous value found for custom field "{field_def.name}" of data type "{field_def.data_type}"')
                        paperless_doc_has_changed = True
                        custom_field_set_has_changed = True

                    new_value = paperless.value_to_paperless(field_def.data_type, new_value)
                    new_custom_field_value = paperless.PaperlessCustomFieldValue(field=field_id, value=new_value)
                    try:
                        index = next(i for i, v in enumerate(paperless_doc.custom_fields) if v.field == field_id)
                        paperless_doc.custom_fields[index] = new_custom_field_value
                    except StopIteration:
                        paperless_doc.custom_fields.append(new_custom_field_value)

                if field.kind == 'attr':
                    attributes = await client.get_element_list('attributes')
                    attribute = next(iter(filter(lambda a: a.name == field.name, attributes)), None)
                    if attribute:
                        attribute = cast(paperless.PaperlessAttribute, attribute)
                        try:
                            if field_result.value is not None:
                                value = paperless.value_to_paperless(attribute.data_type, field_result.value)
                                if getattr(paperless_doc, attribute.name, None) != value:
                                    setattr(paperless_doc, attribute.name, value)
                                    log.info(f'Updated attribute "{attribute.name}" of document {doc.id} to "{value}"')
                                    paperless_doc_has_changed = True

                        except paperless.PaperlessValueConversionException as e:
                            log.error(f'Invalid value {field_result.value!r} for attribute "{attribute.name}" of data type "{attribute.data_type}"')
                            continue

            if custom_field_set_has_changed:
                log.info(f'Updated custom fields of document {doc.id} to {paperless_doc.custom_fields}')
                
    if paperless_doc_has_changed:
        pass # TODO add note (using POST to endpoint /paperless/api/documents/{id}/notes/ ?)

        history_field_desc = [f'{custom_fields_by_id[f.field].name}: {f.value}' for f in paperless_doc.custom_fields]
        history_details = f'Set fields to {", ".join(history_field_desc)}'
        if POST_PROCESS_DONT_SAVE:
            log.info(f'Did not save document {paperless_doc.id} to Paperless (POST_PROCESS_DONT_SAVE)')
            log.debug(f'History details: {history_details}')
        else:
            await client.put_document(paperless_doc)
            log.info(f'Saved document {paperless_doc.id} to Paperless')
            await history_log_update(paperless_doc.id, paperless_doc.title, history_details)


if __name__ == '__main__':
    import asyncio
    import pathlib
    log.setLevel(logging.DEBUG)
    log.root.setLevel(logging.DEBUG)
    if pathlib.Path(os.getcwd()).resolve() != pathlib.Path(__file__).parent.resolve():
        raise Exception('Must be run from directory containing matching.py')
    asyncio.run(process_all_documents())
