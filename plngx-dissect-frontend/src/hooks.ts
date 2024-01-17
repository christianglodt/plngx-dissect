import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pattern, PatternListEntry, Document, PaperlessTag } from './types';


async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.statusText);
    const obj = response.json();
    return obj as T;
}

async function putJson<T>(url: string, object: T): Promise<T> {
    const response = await fetch(url, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(object)
    });
    if (!response.ok) throw new Error(response.statusText);
    return response.json();
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

export const useSavePatternMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (pattern: Pattern) => putJson<Pattern>(`/api/pattern/${pattern.name}`, pattern),
        onSuccess: (data) => queryClient.setQueryData(['pattern', data.name], data)
    });
}

const getDocumentById = async (id: number | null) => {
    if (!id) return null;
    return await fetchJson<Document>(`/api/document/${id}`);
}

export const useDocument = (id: number | null) => {
    return useQuery({queryKey: ['document', id], queryFn: async () => getDocumentById(id)});
}

export const useTagList = () => {
    return useQuery({queryKey: ['tagList'], queryFn: async () => fetchJson<PaperlessTag[]>('/api/tags')})
}
