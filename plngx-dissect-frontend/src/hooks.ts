import { useQuery } from '@tanstack/react-query'
import { Pattern, PatternListEntry, Document } from './types';


async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.statusText);
    const obj = response.json();
    return obj as T;
}

const getPatternList = async () => {
    return await fetchJson<PatternListEntry[]>('/api/patterns');
}

export const usePatternList = () => {
    return useQuery({ queryKey: ['patternList'], queryFn: getPatternList });
}

const getPatternByName = async (name: string) => {
    return await fetchJson<Pattern>(`/api/pattern/${name}`);
}

export const usePattern = (name: string) => {
    return useQuery({queryKey: ['pattern', name], queryFn: async () => getPatternByName(name)});
}

const getDocumentById = async (id: number | null) => {
    if (!id) return null;
    return await fetchJson<Document>(`/api/document/${id}`);
}

export const useDocument = (id: number | null) => {
    return useQuery({queryKey: ['document', id], queryFn: async () => getDocumentById(id)});
}
