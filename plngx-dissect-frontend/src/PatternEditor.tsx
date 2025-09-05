import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDeletePatternMutation, usePattern, usePatternEvaluationResult, useProcessDocumentWithPatternMutation, useSavePatternMutation } from "./hooks";
import { Alert, Button, LinearProgress, Stack } from "@mui/material";

import ChecksCard from "./ChecksCard";
import MatchingDocsCard from "./MatchingDocsCard";
import RegionsCard from "./RegionsCard";
import FieldsCard from "./FieldsCard";
import DocumentView from "./documentView/DocumentView";
import { useState } from "react";
import { Pattern } from "./types";
import PatternPageCard from "./PatternPageCard";
import PortalBox from "./utils/PortalBox";
import ConfirmButton from "./utils/ConfirmButton";
import RenamePatternButton from "./RenamePatternButton";


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
    const pageNr = searchParams.get('page') !== null ? Number(searchParams.get('page')) : 1;

    const pattern = modifiedPattern || savedPattern || null;

    const { data: patternEvaluationResult } = usePatternEvaluationResult(documentId, pattern, pageNr);
    
    if (isError) {
        return (
            <Alert severity="error">Error: {error.message}</Alert>
        );
    }

    if (!pattern || isLoading) {
        return (
            <LinearProgress/>
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

    return (
        <>
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
                    <PatternPageCard pattern={pattern} onChange={onChange}/>
                    <ChecksCard pattern={pattern} evalResult={patternEvaluationResult} onChange={onChange}/>
                    <MatchingDocsCard pattern={pattern}/>
                </Stack>

                <DocumentView documentId={documentId} pattern={pattern} onChange={onChange}/>

                <Stack direction="column" spacing={2} sx={{ height: '100%', width: '400px', minWidth: '400px' }}>
                    <RegionsCard pattern={pattern}  evalResult={patternEvaluationResult} onChange={onChange}/>
                    <FieldsCard pattern={pattern} evalResult={patternEvaluationResult} onChange={onChange}/>
                </Stack>
            </Stack>
        </>
    );
}

export default PatternEditor;
