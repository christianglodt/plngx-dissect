
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

export type RegionRegexCheck = RegionRegex & {
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
    before: Date | null;
    after: Date | null;
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

export type Check = NumPagesCheck | RegionRegexCheck | TitleRegexCheck | CorrespondentCheck | DocumentTypeCheck | StoragePathCheck | TagCheck | DateCreatedCheck | AndCheck | OrCheck | NotCheck;

export type Region = {
    x: number;
    y: number;
    x2: number;
    y2: number;
}

export type RegionRegex = Region & {
    regex: string;
}

export type Field = {
    name: string;
    template: string;
}

export type Pattern = {
    name: string;
    page: number;
    checks: Check[];
    regions: RegionRegex[];
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
     datetime_added: Date;
     date_created: Date;
     paperless_url: string;
     pages: Page[];
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

export enum PaperlessCustomFieldDataType {
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
    data_type: PaperlessCustomFieldDataType;
}

export type RegionResult = {
    text: string;
    group_values: Record<string, string>;
}

export type FieldResult = {
    value: string | null;
    error: string | null;
}

export type PatternEvaluationResult = {
    checks: Array<boolean>;
    regions: Array<RegionResult | null>;
    fields: Array<FieldResult | null>;
}