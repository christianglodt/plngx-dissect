import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDeletePatternMutation, useDocument, usePattern, usePatternEvaluationResult, useProcessDocumentWithPatternMutation, useSavePatternMutation } from "../hooks";
import { Alert, AlertTitle, Box, FormControl, InputLabel, LinearProgress, MenuItem, Select, Stack, Switch } from "@mui/material";

import ChecksCard from "./ChecksSidebar/ChecksCard";
import DocumentsCard from "./DocumentsSidebar/DocumentsCard";
import RegionsCard from "./RegionsSidebar/RegionsCard";
import FieldsCard from "./FieldsSidebar/FieldsCard";
import DocumentView from "./DocumentView/DocumentView";
import React, { useState } from "react";
import { Pattern, PreprocessType } from "../types";
import PortalBox from "../utils/PortalBox";
import { PatternEditorContext, PatternEditorContextType } from "./PatternEditorContext";
import { produce } from "immer";
import PatternActionsButton from "./PatternActionsButton";


const PatternEditor = () => {

    const { patternId } = useParams();

    const { data: savedPattern, isLoading, isError, error } = usePattern(patternId!);
    const [modifiedPattern, setModifiedPattern] = useState<Pattern|null>(null);

    const savePatternMutation = useSavePatternMutation(patternId!);
    const deletePatternMutation = useDeletePatternMutation();
    const processDocumentWithPatternMutation = useProcessDocumentWithPatternMutation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const documentId = searchParams.get('document') !== null ? Number(searchParams.get('document')) : null;
    const [pageNr, setPageNr] = useState<number>(0);

    const pattern = modifiedPattern || savedPattern || null;
    const { data: document, error: documentError } = useDocument(documentId, pattern?.preprocess || null);

    const { data: patternEvaluationResult } = usePatternEvaluationResult(documentId, pattern);

    if (isError) {
        return (
            <Alert severity="error">
                <AlertTitle>Error: {error.message}</AlertTitle>
            </Alert>
        );
    }

    if (!pattern || isLoading) {
        return (
            <LinearProgress/>
        );
    }

    if (documentError) {
        return (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Alert severity="error">
                    <AlertTitle>An error occured</AlertTitle>
                    {documentError.toString()}
                </Alert>
            </Box>
        );
    }

    const onChange = (newPattern: Pattern) => {
        setModifiedPattern(newPattern);
    }

    const onPreprocessChange = (newValue: string | null) => {
        const newPattern = produce(pattern, draft => {
            const value = newValue === '' ? null : newValue;
            draft.preprocess = value as PreprocessType;
        });
        onChange(newPattern);
    }

    const onEnabledChange = (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        const newPattern = produce(pattern, draft => {
            draft.enabled = checked;
        });
        onChange(newPattern);
    }

    const contextValue: PatternEditorContextType = {
        pattern,
        isModified: modifiedPattern !== null,
        isSaving: savePatternMutation.isPending,
        savePattern: () => savePatternMutation.mutate(pattern!, {
            onSuccess: () => {
                setModifiedPattern(null);
            }
        }),
        deletePattern: () => deletePatternMutation.mutate(pattern, {
            onSuccess: () => {
                navigate('/');
            }
        }),
        processDocument: () => processDocumentWithPatternMutation.mutate({ document_id: documentId!, pattern_name: pattern.name }),

        document: document || null,
        pageNr,
        setPageNr,
        onPatternChange: onChange,
        patternEvaluationResult: patternEvaluationResult || null
    };

    return (
        <PatternEditorContext.Provider value={contextValue}>
            <PortalBox>
                <Stack direction="row" gap={2}>
                    <Switch checked={pattern.enabled} onChange={onEnabledChange} title="Enable this pattern for automatic processing"/>

                    <FormControl size="small" sx={{ minWidth: '200px' }}>
                        <InputLabel id="preprocess-select-label">Preprocess</InputLabel>
                        <Select id="preprocess-select" labelId="preprocess-select-label" label="Preprocess" value={pattern.preprocess || ''} onChange={event => onPreprocessChange(event.target.value)}>
                            <MenuItem value="">No preprocessing</MenuItem>
                            <MenuItem value="force-ocr">Force OCR</MenuItem>
                        </Select>
                    </FormControl>
                    { (savePatternMutation.isError || deletePatternMutation.isError) &&
                    <Alert severity="error">Error: {(savePatternMutation.error! || deletePatternMutation.error!).message }</Alert>
                    }

                    <PatternActionsButton/>

                </Stack>
            </PortalBox>
            <Stack direction="row" sx={{ width: '100%', height: '100%' }} spacing={2}>
                <Stack direction="column" spacing={2} sx={{ height: '100%', width: '400px', minWidth: '400px' }}>
                    <ChecksCard/>
                    <DocumentsCard/>
                </Stack>

                <DocumentView/>

                <Stack direction="column" spacing={2} sx={{ height: '100%', width: '400px', minWidth: '400px' }}>
                    <RegionsCard/>
                    <FieldsCard/>
                </Stack>
            </Stack>
        </PatternEditorContext.Provider>
    );
}

export default PatternEditor;
