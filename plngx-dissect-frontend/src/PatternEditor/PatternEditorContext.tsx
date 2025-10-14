import { createContext, Dispatch } from 'react';
import { Document, Pattern, PatternEvaluationResult } from '../types';

export type PatternEditorContextType = {
    pattern: Pattern;
    isModified: boolean;
    isSaving: boolean;
    document: Document | null;
    pageNr: number | null;
    setPageNr: Dispatch<number>;
    patternEvaluationResult: PatternEvaluationResult | null;
    onPatternChange: Dispatch<Pattern>;
    savePattern: () => void;
    deletePattern: () => void;
    processDocument: () => void;
};

export const PatternEditorContext = createContext<PatternEditorContextType>({} as PatternEditorContextType);
