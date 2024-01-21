import os
from typing import AsyncIterator

import paperless
from document import DocumentBase, get_parsed_document
from pattern import Pattern


REQUIRED_TAGS = [t.strip() for t in os.environ.get('PAPERLESS_REQUIRED_TAGS', '').split(',')]

async def get_documents_matching_pattern(pattern: Pattern) -> AsyncIterator[DocumentBase]:
    client = paperless.PaperlessClient()
    async for paperless_doc in client.get_documents_with_tags(REQUIRED_TAGS):
        doc = await get_parsed_document(paperless_doc.id)
        
        if await pattern.matches(doc, paperless_doc, client):
            yield DocumentBase(id=doc.id, paperless_url=doc.paperless_url, title=doc.title, datetime_added=paperless_doc.added, date_created=paperless_doc.created)
