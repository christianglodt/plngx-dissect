import unittest

DOCUMENT = '''
TODO: anonymized document
'''

PATTERN = r'''
TODO: anonymized Pattern
'''


from document import Document
from pattern import Pattern
import yaml


class TestRegionResultText(unittest.TestCase):

    def setUp(self) -> None:
        self.document = Document.model_validate(yaml.load(DOCUMENT, Loader=yaml.CLoader))
        self.pattern = Pattern.model_validate(yaml.load(PATTERN, Loader=yaml.CLoader))

        self.region = self.pattern.regions[0]
        self.page = self.document.pages[0]

    def test_page_get_region_text_lines(self):
        lines = self.page.get_region_text_lines(self.region)
        self.assertIn(['test', 'case'], lines)

    def test_page_get_region_text(self):
        text = self.page.get_region_text(self.region)
        self.assertIn('test case', text)

if __name__ == '__main__':
    unittest.main()
