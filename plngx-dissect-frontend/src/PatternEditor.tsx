import { useParams } from "react-router-dom";
import { usePattern } from "./hooks";
import { LinearProgress, Stack } from "@mui/material";

import ChecksCard from "./ChecksCard";
import MatchingDocsCard from "./MatchingDocsCard";
import RegionsCard from "./RegionsCard";
import FieldsCard from "./FieldsCard";
import DocumentView from "./DocumentView";
import { useState } from "react";
import { Pattern } from "./types";


export default function PatternEditor() {

    const { patternId } = useParams();

    const { data: pattern, isLoading } = usePattern(patternId!);

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

    return (
        <Stack direction="row" sx={{ width: '100%', height: '100%' }} spacing={2}>
            <Stack direction="column" spacing={2} sx={{ height: '100%', width: '20%', minWidth: 'fit-content'}}>
                <ChecksCard pattern={shownPattern} onChange={onChange}/>
                <MatchingDocsCard pattern={shownPattern}/>
            </Stack>

            <DocumentView documentId={documentId} pattern={shownPattern}/>

            <Stack direction="column" spacing={2} sx={{ height: '100%', width: '20%', minWidth: 'fit-content' }}>
                <RegionsCard pattern={shownPattern}/>
                <FieldsCard pattern={shownPattern}/>
            </Stack>
        </Stack>
    );
}
