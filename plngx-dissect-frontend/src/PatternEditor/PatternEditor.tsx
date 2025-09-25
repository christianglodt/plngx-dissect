import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDeletePatternMutation, useDocument, usePattern, usePatternEvaluationResult, useProcessDocumentWithPatternMutation, useSavePatternMutation } from "../hooks";
import { Alert, AlertTitle, Box, Button, LinearProgress, Stack } from "@mui/material";

import ChecksCard from "./ChecksSidebar/ChecksCard";
import DocumentsCard from "./DocumentsSidebar/DocumentsCard";
import RegionsCard from "./RegionsSidebar/RegionsCard";
import FieldsCard from "./FieldsSidebar/FieldsCard";
import DocumentView from "./DocumentView/DocumentView";
import { useState } from "react";
import { Pattern } from "../types";
import PortalBox from "../utils/PortalBox";
import ConfirmButton from "../utils/ConfirmButton";
import RenamePatternButton from "./RenamePatternButton";
import { PatternEditorContext, PatternEditorContextType } from "./PatternEditorContext";


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
    const { data: document, error: documentError } = useDocument(documentId);

    const pattern = modifiedPattern || savedPattern || null;

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

    const onSaveClicked = () => {
        savePatternMutation.mutate(pattern!, {
            onSuccess: () => {
                setModifiedPattern(null);
            }
        });
    }

    const onDeleteClicked = () => {
        deletePatternMutation.mutate(pattern, {
            onSuccess: () => {
                navigate('/');
            }
        });
    }

    const onProcessDocumentConfirmed = () => {
        processDocumentWithPatternMutation.mutate({ document_id: documentId!, pattern_name: pattern.name });
    }

    const contextValue: PatternEditorContextType = {
        pattern,
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
                    { (savePatternMutation.isError || deletePatternMutation.isError) &&
                    <Alert severity="error">Error: {(savePatternMutation.error! || deletePatternMutation.error!).message }</Alert>
                    }
                    <ConfirmButton disabled={savePatternMutation.isPending || modifiedPattern !== null || documentId === null}  dialogTitle="Process Document?" dialogText="Process the current document with this pattern?" color="warning" onConfirmed={onProcessDocumentConfirmed}>Process</ConfirmButton>
                    <RenamePatternButton name={pattern.name}/>
                    <ConfirmButton disabled={savePatternMutation.isPending} dialogTitle="Delete Pattern?" dialogText="Are you sure to delete this pattern?" color="warning" onConfirmed={onDeleteClicked}>Delete</ConfirmButton>
                    <Button disabled={modifiedPattern === null || savePatternMutation.isPending} color="success" onClick={onSaveClicked}>Save</Button>
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
