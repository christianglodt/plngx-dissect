import { useQuery } from '@tanstack/react-query'



async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.statusText);
    const obj = response.json();
    return obj as T;
}


type PatternListEntry = {
    name: string
}

const getPatternList = async () => {
    return await fetchJson<PatternListEntry[]>('/api/patterns');
}

export const usePatternList = () => {
    return useQuery({ queryKey: ['patternList'], queryFn: getPatternList });
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


const getPatternByName = async (name: string) => {
    return await fetchJson<Pattern>(`/api/pattern/${name}`);
}

export const usePattern = (name: string) => {
    return useQuery({queryKey: ['pattern', name], queryFn: async () => getPatternByName(name)});
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

const getDocumentById = async (id: number | null) => {
    if (!id) return null;
    return await fetchJson<Document>(`/api/document/${id}`);
}

export const useDocument = (id: number | null) => {
    return useQuery({queryKey: ['document', id], queryFn: async () => getDocumentById(id)});
}
