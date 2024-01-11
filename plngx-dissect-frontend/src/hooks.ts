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


type NumPagesCheck = {
    type: 'num_pages';
    num_pages: number;
}

type RegionRegexCheck = {
    type: 'region';
    region: Region;
    regex: string;
}

type TitleRegexCheck = {
    type: 'title';
    regex: string;
}

type CorrespondentCheck = {
    type: 'correspondent';
    name: string;
}

type DocumentTypeCheck = {
    type: 'document_type';
    name: string;
}

type StoragePathCheck = {
    type: 'storage_path';
    name: string;
}

type TagCheck = {
    type: 'tags';
    includes: string[];
    excludes: string[];
}

type DateCreatedCheck = {
    type: 'date_created';
    before?: string;
    after?: string;
    year?: number
}

type AndCheck = {
    type: 'and';
    checks: AnyCheck[];
}

type OrCheck = {
    type: 'or';
    checks: AnyCheck[];
}

type NotCheck = {
    type: 'not';
    check: AnyCheck;
}

type AnyCheck = NumPagesCheck | RegionRegexCheck | TitleRegexCheck | CorrespondentCheck | DocumentTypeCheck | StoragePathCheck | TagCheck | DateCreatedCheck | AndCheck | OrCheck | NotCheck

type Region = {
    x: number;
    y: number;
    x2: number;
    xy2: number;
}

type RegionRegex = {
    region: Region;
    regex: string;
}

type Field = {
    name: string;
    template: string;
}

type Pattern = {
    name: string;
    checks: AnyCheck[];
    regions: RegionRegex[];
    fields: Field[];
}


const getPatternByName = async (name: string) => {
    return await fetchJson<Pattern>(`/api/pattern/${name}`);
}

export const usePattern = (name: string) => {
    return useQuery({queryKey: ['pattern', name], queryFn: async () => getPatternByName(name)})
}
