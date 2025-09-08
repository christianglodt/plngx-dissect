// Converted from Python to Typescript with Chat-GPT

// ExpressionError
export class ExpressionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExpressionError";
  }
}

// normalize_whitespace
export function normalizeWhitespace(s: string): string {
  return s.replace(/\s+/g, " ");
}

// matchers
export function matcherWord(name: string): string {
  return `(?<${name}>\\p{Letter}+)`;
}

export function matcherInt(name: string): string {
  return `(?<${name}>[0-9]+)`;
}

export function matcherNumber(name: string, decimalSymbol: "dot" | "comma" = "dot"): string {
  if (decimalSymbol === "dot") {
    return `(?<${name}>[0-9 ,]+(\\.[0-9]*)?)`;
  } else if (decimalSymbol === "comma") {
    return `(?<${name}>[0-9 .]+(,[0-9]*)?)`;
  } else {
    throw new ExpressionError('number type must be "dot" or "comma"');
  }
}

// Mapping of simple expression types to regex generator functions
type MatcherFunc = (name: string, ...args: string[]) => string;

const SIMPLE_EXPR_TO_REGEX: Record<string, MatcherFunc> = {
  'word': matcherWord,
  'int': matcherInt,
  'integer': matcherInt,
  'number': matcherNumber,
  'decimal': matcherNumber,
};

// Convert a simple expression into a regex string
export function simpleExprToRegex(expr: string): string {
  // Split on < or >, unless preceded by a backslash. Include separators in result.
  const parts = expr.split(/((?<!\\)[<>*?])/);

  let regex = "";
  let inBrackets = false;

  while (parts.length > 0) {
    const word = parts.shift()!;
    if (word === "<") {
      inBrackets = true;
      continue;
    } else if (word === ">") {
      inBrackets = false;
      continue;
    } else if (word === "*") {
      regex += ".*?";
    } else if (word === '?') {
      regex += ".";
    } else {
      if (inBrackets) {
        const placeholderParts = word.trim().split(":");
        if (placeholderParts.length < 2) {
          throw new ExpressionError(`Placeholder "${word}" must specify name and type`);
        }

        const placeholderName = placeholderParts[0];
        const placeholderType = placeholderParts[1].toLowerCase();
        const placeholderArgs = placeholderParts.slice(2);

        if (!/^[a-zA-Z]\w*$/.test(placeholderName)) { // TODO allow unicode
          throw new ExpressionError(`Placeholder name can not contain special characters`);
        }

        if (!(placeholderType in SIMPLE_EXPR_TO_REGEX)) {
          throw new ExpressionError(`Unknown placeholder type "${placeholderType}"`);
        }

        const asRe = SIMPLE_EXPR_TO_REGEX[placeholderType](placeholderName, ...placeholderArgs);
        regex += asRe;
      } else {
        regex += RegExp.escape(normalizeWhitespace(word)).replace(/( |\\x20)/g, "\\s+");
      }
    }
  }
  if (inBrackets) {
    throw new ExpressionError('Placeholder not terminated');
  }

  return regex;
}
