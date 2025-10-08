
export type PatternListEntry = {
    name: string
}

export enum CheckTypeId {
    NumPages = 'num_pages',
    Region = 'region',
    Title = 'title',
    Correspondent = 'correspondent',
    DocumentType = 'document_type',
    StoragePath = 'storage_path',
    Tag = 'tags',
    DateCreated = 'date_created',
    And = 'and',
    Or = 'or',
    Not = 'not'
}

export type NumPagesCheck = {
    type: CheckTypeId.NumPages;
    num_pages: number;
}

export type RegionCheck = Region & {
    type: CheckTypeId.Region;
}

export type TitleRegexCheck = {
    type: CheckTypeId.Title;
    regex: string;
}

export type CorrespondentCheck = {
    type: CheckTypeId.Correspondent;
    name: string;
}

export type DocumentTypeCheck = {
    type: CheckTypeId.DocumentType;
    name: string;
}

export type StoragePathCheck = {
    type: CheckTypeId.StoragePath;
    name: string;
}

export type TagCheck = {
    type: CheckTypeId.Tag;
    includes: string[];
    excludes: string[];
}

export type DateCreatedCheck = {
    type: CheckTypeId.DateCreated;
    before: string | null;
    after: string | null;
    year: number | null;
}

export type AndCheck = {
    type: CheckTypeId.And;
    checks: Check[];
}

export type OrCheck = {
    type: CheckTypeId.Or;
    checks: Check[];
}

export type NotCheck = {
    type: CheckTypeId.Not;
    check: Check | null;
}

export type Check = NumPagesCheck | RegionCheck | TitleRegexCheck | CorrespondentCheck | DocumentTypeCheck | StoragePathCheck | TagCheck | DateCreatedCheck | AndCheck | OrCheck | NotCheck;

export type Region = {
    page: number | 'first_match' | 'last_match';
    kind: 'simple' | 'regex';
    simple_expr?: string | null;
    regex_expr?: string | null;
    x: number;
    y: number;
    x2: number;
    y2: number;
}

export type Field = {
    kind: 'attr' | 'custom';
    name: string;
    template: string;
}

export type PreprocessType = null | 'force-ocr';

export type Pattern = {
    name: string;
    preprocess: PreprocessType;
    checks: Check[];
    regions: Region[];
    fields: Field[];
}

export type TextRun = {
    x: number;
    y: number;
    x2: number;
    y2: number;
    text: string;
}

export type Page = {
    width: number;
    height: number;
    text_runs: TextRun[];
}

export type DocumentBase = {
     id: number;
     title: string;
     correspondent: string | null;
     document_type: string | null;
     datetime_added: Date;
     date_created: Date;
     paperless_url: string;
}

export type Document = DocumentBase & {
    pages: Page[];
}

export type PaperlessNamedElement = {
    id: number;
    name: string;
}

export type PaperlessElementBase = PaperlessNamedElement & {
    slug: string;
    match: string;
    matching_algorithm: number;
    is_insensitive: boolean;
    document_count: number;
    owner: number;
    user_can_change: boolean;
}

export type PaperlessTag = PaperlessElementBase & {
    color: number;
    is_inbox_tag: boolean;
}

export enum PaperlessDataType {
    String = 'string',
    Url = 'url',
    Date = 'date',
    Boolean = 'boolean',
    Integer = 'integer',
    Float = 'float',
    Monetary = 'monetary',
    DocumentLink = 'documentlink'
}

export type PaperlessCustomField = PaperlessNamedElement & {
    data_type: PaperlessDataType;
}

export type PaperlessAttribute = PaperlessNamedElement & {
    data_type: PaperlessDataType;
    label: string;
}

export type CheckResult = {
    passed: boolean;
    error: string | null;
}

export type RegionResult = {
    text: string;
    error: string | null;
    group_values: Record<string, string> | null;
    group_positions: Array<Array<number>> | null;
    is_retained: boolean;
}

export type FieldResult = {
    data_type?: string | null;
    value: string | null;
    error: string | null;
}

export type PatternEvaluationResult = {
    checks: Array<CheckResult>;
    regions: Array<Array<RegionResult>>;
    fields: Array<FieldResult | null>;
}

export type HistoryItem = {
    paperless_id: number;
    title: string;
    datetime: Date;
    operation: 'updated';
    details: string;
    paperless_url: string;
}
