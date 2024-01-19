import { useNavigate, useParams } from "react-router-dom";
import { useDeletePatternMutation, usePattern, useSavePatternMutation } from "./hooks";
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
    const navigate = useNavigate();

    if (isError) {
        return (
            <Alert severity="error">Error: {error.message}</Alert>
        );
    }

    if (!savedPattern || isLoading) {
        return (
            <LinearProgress/>
        );
    }

    const pattern = modifiedPattern || savedPattern;

    const documentId = 708;

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

    return (
        <>
            <PortalBox>
                <Stack direction="row" gap={2}>
                    { (savePatternMutation.isError || deletePatternMutation.isError) &&
                    <Alert severity="error">Error: {(savePatternMutation.error! || deletePatternMutation.error!).message }</Alert>
                    }
                    <RenamePatternButton/>
                    <ConfirmButton disabled={savePatternMutation.isPending} dialogTitle="Delete Pattern?" dialogText="Are you sure to delete this pattern?" color="warning" onConfirmed={onDeleteClicked}>Delete</ConfirmButton>
                    <Button disabled={modifiedPattern === null || savePatternMutation.isPending} color="success" onClick={onSaveClicked}>Save</Button>
                </Stack>
            </PortalBox>
            <Stack direction="row" sx={{ width: '100%', height: '100%' }} spacing={2}>
                <Stack direction="column" spacing={2} sx={{ height: '100%', width: '20%', minWidth: 'fit-content' }}>
                    <PatternPageCard pattern={pattern} onChange={onChange}/>
                    <ChecksCard pattern={pattern} onChange={onChange}/>
                    <MatchingDocsCard pattern={pattern}/>
                </Stack>

                <DocumentView documentId={documentId} pattern={pattern} onChange={onChange}/>

                <Stack direction="column" spacing={2} sx={{ height: '100%', width: '20%', minWidth: 'fit-content' }}>
                    <RegionsCard pattern={pattern} onChange={onChange}/>
                    <FieldsCard pattern={pattern} onChange={onChange}/>
                </Stack>
            </Stack>
        </>
    );
}

export default PatternEditor;
