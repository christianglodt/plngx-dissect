import re
import typing


class ExpressionError(Exception):
    pass


def normalize_whitespace(s: str) -> str:
    return re.sub(r'\s+', ' ', s)


def matcher_word(name: str):
    return rf'(?P<{name}>\w+)'


def matcher_int(name: str):
    return rf'(?P<{name}>[0-9]+)'


def matcher_number(name: str, decimal_symbol: str = 'dot'):
    if decimal_symbol == 'dot':
        return rf'(?P<{name}>[0-9 ,]+(\.[0-9]*)?)' # TODO better handling of leading/trailing whitespace
    elif decimal_symbol == 'comma':
        return rf'(?P<{name}>[0-9 .]+(,[0-9]*)?)' # TODO better handling of leading/trailing whitespace
    else:
        raise ExpressionError('number type must be "dot" or "comma"')


SIMPLE_EXPR_TO_REGEX: dict[str, typing.Callable[[str], str]] = {
    'word': matcher_word,
    'int': matcher_int,
    'integer': matcher_int,
    'number': matcher_number,
    'decimal': matcher_number
}


def simple_expr_to_regex(expr: str) -> str:
    # Split on < or >, unless preceded by a backslash. Include separators in result.
    parts = re.split(r'((?<!\\)[<>*?])', expr)

    regex = ''
    in_brackets = False
    while parts:
        word = parts.pop(0)
        if word == '<':
            in_brackets = True
            continue
        elif word == '>':
            in_brackets = False
            continue
        elif word == '*':
            regex += '.*?'
        elif word == '?':
            regex += '.'
        else:
            if in_brackets:
                placeholder_parts = word.strip().split(':')
                if len(placeholder_parts) < 2:
                    raise ExpressionError(f'Placeholder "{word}" must specify name and type')
                
                placeholder_name = placeholder_parts[0]
                placeholder_type = placeholder_parts[1].lower()
                placeholder_args = placeholder_parts[2:]

                if placeholder_name == '':
                    raise ExpressionError(f'Placeholder name can not be empty')

                if not re.match(r'^[a-zA-Z]\w*$', placeholder_name): # TODO allow unicode
                    raise ExpressionError(f'Placeholder name can not contain special characters')

                if placeholder_type not in SIMPLE_EXPR_TO_REGEX:
                    raise ExpressionError(f'Unknown placeholder type "{placeholder_type}"')
                
                as_re = SIMPLE_EXPR_TO_REGEX[placeholder_type](placeholder_name, *placeholder_args)
                regex += as_re

            else:
                regex += re.escape(normalize_whitespace(word)).replace(r'\ ', r'\s+')

    if in_brackets:
        raise ExpressionError('Placeholder not terminated')
    return regex
