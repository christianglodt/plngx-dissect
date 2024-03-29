#!/usr/bin/env python

import asyncio

import ryaml

from pattern import Pattern
from matching import filter_documents_matching_pattern, PAPERLESS_REQUIRED_TAGS
from document import DocumentBase

from typing import AsyncIterator, TypeVar
import paperless


async def pattern_matching(paperless_docs: AsyncIterator[paperless.PaperlessDocument], pattern: Pattern, client: paperless.PaperlessClient) -> list[DocumentBase]:
    res: list[DocumentBase] = []
    async for doc in filter_documents_matching_pattern(paperless_docs, pattern, client):
        res.append(doc)
    return res


T = TypeVar('T')
async def async_iter(l: list[T]) -> AsyncIterator[T]:
    for o in l:
        yield o


async def profile():
    client = paperless.PaperlessClient()

    paperless_docs = [d async for d in client.get_documents_with_tags(PAPERLESS_REQUIRED_TAGS)]
        
    pattern = Pattern.model_validate(ryaml.loads(PATTERN))

    for _ in range(50):
      print(await pattern_matching(async_iter(paperless_docs), pattern, client))
    


PATTERN = '''
page: 0
name: SoloMed Invoice
checks:
- type: correspondent
  name: SoloMedGmbH
- type: document_type
  name: Bill
regions:
- x: 62.0
  y: 416.0
  x2: 546.0
  y2: 707.0
  regex: Invoice amount € (?P<Amount>[\\d,]+)
fields:
- name: Amount
  template: '{{ Amount | replace(",", ".") }}'

'''

if __name__ == '__main__':
    asyncio.run(profile())
