import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pattern, PatternListEntry, Document, PaperlessTag, PaperlessNamedElement, DocumentBase, PatternEvaluationResult } from './types';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';


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

async function postRequest<T, R>(url: string, object: T): Promise<R> {
    const response = await fetch(url, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(object)
    });
    if (!response.ok) throw new Error(response.statusText);
    return response.json();
}

async function deleteRequest(url: string): Promise<void> {
    const response = await fetch(url, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error(response.statusText);
}

const getPatternList = async () => {
    return await fetchJson<PatternListEntry[]>('/api/patterns');
}

export const usePatternList = () => {
    return useQuery({ queryKey: ['patternList'], queryFn: getPatternList });
}

const getPatternByName = async (name: string) => {
    return await fetchJson<Pattern>(`/api/pattern/${encodeURIComponent(name)}`);
}

export const usePattern = (name: string) => {
    return useQuery({queryKey: ['pattern', name], queryFn: async () => getPatternByName(name)});
}

type CreatePatternRequestBody = { name: string }

export const useCreatePatternMutation = () => {
    const queryClient = useQueryClient();
    const [patternName, setPatternName] = useState<string|null>(null);
    return useMutation({
        mutationFn: (name: string) => {
            setPatternName(name);
            return postRequest<CreatePatternRequestBody, Pattern>('/api/patterns', { name });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pattern', patternName] });
            queryClient.invalidateQueries({ queryKey: ['patternList'] });
        }
    });
}

export const useSavePatternMutation = (patternId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (pattern: Pattern) => putJson<Pattern>(`/api/pattern/${patternId}`, pattern),
        onSuccess: (data) => queryClient.setQueryData(['pattern', data.name], data)
    });
}

export const useDeletePatternMutation = () => {
    const queryClient = useQueryClient();
    const [patternName, setPatternName] = useState<string|null>(null);
    return useMutation({
        mutationFn: (pattern: Pattern) => {
            setPatternName(pattern.name);
            return deleteRequest(`/api/pattern/${pattern.name}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pattern', patternName] });
            queryClient.invalidateQueries({ queryKey: ['patternList'] });
        }
    });
}

export const useRenamePatternMutation = () => {
    const queryClient = useQueryClient();
    const [newName, setNewName] = useState<string|null>(null);
    const [oldName, setOldName] = useState<string|null>(null);
    return useMutation({
        mutationFn: ({ oldName, newName }: { oldName: string, newName: string }) => {
            setNewName(newName);
            setOldName(oldName);
            return postRequest(`/api/pattern/${encodeURIComponent(oldName)}/rename?new_name=${encodeURIComponent(newName)}`, undefined);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pattern', newName] });
            queryClient.invalidateQueries({ queryKey: ['pattern', oldName] });
            queryClient.invalidateQueries({ queryKey: ['patternList'] });
        }
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
    return useQuery({queryKey: ['tagList'], queryFn: async () => fetchJson<PaperlessTag[]>('/api/tags')});
}

export const usePaperlessElement = <T extends PaperlessNamedElement,>(slug: string) => {
    return useQuery({queryKey: ['list', slug], queryFn: async () => fetchJson<T[]>(`/api/paperless_element/${encodeURIComponent(slug)}`)});
}

export const usePatternMatches = (pattern: Pattern) => {
    const [debouncedPattern] = useDebounce(pattern, 1000);
    return useQuery({queryKey: ['matches', debouncedPattern], queryFn: async () => postRequest<Pattern, Array<DocumentBase>>('/api/documents/matching_pattern', debouncedPattern) });
}

export const usePatternEvaluationResult = (docId: number|null, pattern: Pattern|null, pageNr: number) => {
    const [debouncedPattern] = useDebounce(pattern, 1000);
    const [debouncedPageNr] = useDebounce(pageNr, 1000);

    const qfn = async() => {
        if (debouncedPattern === null) return null;
        return postRequest<Pattern, PatternEvaluationResult|null>(`/api/document/${docId}/${pageNr-1}/evaluate_pattern`, debouncedPattern);
    }
    return useQuery({queryKey: ['evaluate', docId, debouncedPattern, debouncedPageNr], queryFn: qfn });
}
