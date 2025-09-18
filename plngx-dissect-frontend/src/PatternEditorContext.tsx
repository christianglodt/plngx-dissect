import { createContext, Dispatch } from 'react';
import { Document, Pattern, PatternEvaluationResult } from './types';

export type PatternEditorContextType = {
    pattern: Pattern;
    document: Document | null;
    pageNr: number | null;
    setPageNr: Dispatch<number>;
    patternEvaluationResult: PatternEvaluationResult | null;
    onPatternChange: Dispatch<Pattern>;
};

export const PatternEditorContext = createContext<PatternEditorContextType>({} as PatternEditorContextType);
