#!/usr/bin/env python

import asyncio

import ryaml

from pattern import Pattern
from matching import get_documents_matching_pattern
from document import DocumentBase


async def pattern_matching(pattern: Pattern) -> list[DocumentBase]:
    res: list[DocumentBase] = []
    async for doc in get_documents_matching_pattern(pattern):
        res.append(doc)
    return res


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
    pattern = Pattern.model_validate(ryaml.loads(PATTERN))
    print(asyncio.run(pattern_matching(pattern)))
