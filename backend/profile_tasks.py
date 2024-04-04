#!/usr/bin/env python

import asyncio

import ryaml

from pattern import Pattern
from matching import filter_documents_matching_pattern, PAPERLESS_REQUIRED_TAGS
from document import DocumentBase, get_parsed_document
from matching import get_documents_matching_pattern

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


async def profile_region_text():
    client = paperless.PaperlessClient()

    paperless_docs = [d async for d in client.get_documents_with_tags(PAPERLESS_REQUIRED_TAGS)]
        
    pattern = Pattern.model_validate(ryaml.loads(PATTERN))

    region = pattern.regions[0]
    docs = [await get_parsed_document(pl.id, client=client) for pl in paperless_docs]
    for _ in range(1000):
        for doc in docs:
            if doc.pages:
              _text = doc.pages[0].get_region_text(region)


async def profile_pattern_matching():
    client = paperless.PaperlessClient()

    paperless_docs = [d async for d in client.get_documents_with_tags(PAPERLESS_REQUIRED_TAGS)]
        
    pattern = Pattern.model_validate(ryaml.loads(PATTERN))

    for _ in range(50):
      print(await pattern_matching(async_iter(paperless_docs), pattern, client))


async def profile_get_documents_matching_pattern():
    pattern = Pattern.model_validate(ryaml.loads(PATTERN))
    MAX_RESULTS = 20

    res: list[DocumentBase] = []
    async for d in get_documents_matching_pattern(pattern):
        res.append(d)

        if len(res) == MAX_RESULTS:
            break
    print(res)


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
    asyncio.run(profile_get_documents_matching_pattern())
