import { useParams } from "react-router-dom";
import { usePattern, useSavePatternMutation } from "./hooks";
import { Alert, Button, LinearProgress, Stack } from "@mui/material";

import ChecksCard from "./ChecksCard";
import MatchingDocsCard from "./MatchingDocsCard";
import RegionsCard from "./RegionsCard";
import FieldsCard from "./FieldsCard";
import DocumentView from "./DocumentView";
import { useState } from "react";
import { Pattern } from "./types";
import PatternPageCard from "./PatternPageCard";
import PortalBox from "./utils/PortalBox";


const PatternEditor = () => {

    const { patternId } = useParams();

    const { data: pattern, isLoading } = usePattern(patternId!);
    const savePatternMutation = useSavePatternMutation();

    const [modifiedPattern, setModifiedPattern] = useState<Pattern|null>(null);

    if (!pattern || isLoading) {
        return (
            <LinearProgress/>
        );
    }

    const documentId = 708;

    const shownPattern = modifiedPattern || pattern;

    const onChange = (newPattern: Pattern) => {
        setModifiedPattern(newPattern);
    }

    const onSaveClicked = () => {
        savePatternMutation.mutate(modifiedPattern!);
    }

    return (
        <>
            <PortalBox>
                <Stack direction="row" gap={2}>
                    { savePatternMutation.isError &&
                    <Alert severity="error">Error: {savePatternMutation.error.message}</Alert>
                    }
                    <Button disabled={modifiedPattern === null || savePatternMutation.isPending} color="success" onClick={onSaveClicked}>Save</Button>
                </Stack>
            </PortalBox>
            <Stack direction="row" sx={{ width: '100%', height: '100%' }} spacing={2}>
                <Stack direction="column" spacing={2} sx={{ height: '100%', width: '20%', minWidth: 'fit-content' }}>
                    <PatternPageCard pattern={shownPattern} onChange={onChange}/>
                    <ChecksCard pattern={shownPattern} onChange={onChange}/>
                    <MatchingDocsCard pattern={shownPattern}/>
                </Stack>

                <DocumentView documentId={documentId} pattern={shownPattern}/>

                <Stack direction="column" spacing={2} sx={{ height: '100%', width: '20%', minWidth: 'fit-content' }}>
                    <RegionsCard pattern={shownPattern} onChange={onChange}/>
                    <FieldsCard pattern={shownPattern} onChange={onChange}/>
                </Stack>
            </Stack>
        </>
    );
}

export default PatternEditor;
