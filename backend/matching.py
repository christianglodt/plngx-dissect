import os
from typing import AsyncIterator

import paperless
from document import DocumentBase, get_parsed_document
from pattern import Pattern


REQUIRED_TAGS = [t.strip() for t in os.environ.get('PAPERLESS_REQUIRED_TAGS', '').split(',')]

async def get_documents_matching_pattern(pattern: Pattern) -> AsyncIterator[DocumentBase]: # TODO return DocumentRef type with only Id, title
    async for paperless_doc in paperless.PaperlessClient().get_documents_with_tags(REQUIRED_TAGS):
        doc = await get_parsed_document(paperless_doc.id)
        # TODO filter using pattern
        yield DocumentBase(id=doc.id, paperless_url=doc.paperless_url, title=doc.title, datetime_added=paperless_doc.added, date_created=paperless_doc.created)
