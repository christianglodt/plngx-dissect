
export type PatternListEntry = {
    name: string
}

export type NumPagesCheck = {
    type: 'num_pages';
    num_pages: number;
}

export type RegionRegexCheck = {
    type: 'region';
    region: Region;
    regex: string;
}

export type TitleRegexCheck = {
    type: 'title';
    regex: string;
}

export type CorrespondentCheck = {
    type: 'correspondent';
    name: string;
}

export type DocumentTypeCheck = {
    type: 'document_type';
    name: string;
}

export type StoragePathCheck = {
    type: 'storage_path';
    name: string;
}

export type TagCheck = {
    type: 'tags';
    includes: string[];
    excludes: string[];
}

export type DateCreatedCheck = {
    type: 'date_created';
    before?: string;
    after?: string;
    year?: number
}

export type AndCheck = {
    type: 'and';
    checks: AnyCheck[];
}

export type OrCheck = {
    type: 'or';
    checks: AnyCheck[];
}

export type NotCheck = {
    type: 'not';
    check: AnyCheck;
}

export type AnyCheck = NumPagesCheck | RegionRegexCheck | TitleRegexCheck | CorrespondentCheck | DocumentTypeCheck | StoragePathCheck | TagCheck | DateCreatedCheck | AndCheck | OrCheck | NotCheck;

export type Region = {
    x: number;
    y: number;
    x2: number;
    xy2: number;
}

export type RegionRegex = {
    region: Region;
    regex: string;
}

export type Field = {
    name: string;
    template: string;
}

export type Pattern = {
    name: string;
    checks: AnyCheck[];
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
    aspect_ratio: number;
    text_runs: TextRun[];
}

export type Document = {
     id: number;
     pages: Page[];
}
