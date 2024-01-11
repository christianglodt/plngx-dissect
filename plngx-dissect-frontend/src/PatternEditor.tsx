import { useParams } from "react-router-dom";
import { usePattern } from "./hooks";
import { LinearProgress, Stack } from "@mui/material";

import ChecksCard from "./ChecksCard";
import MatchingDocsCard from "./MatchingDocsCard";
import RegionsCard from "./RegionsCard";
import FieldsCard from "./FieldsCard";
import DocumentView from "./DocumentView";


export default function PatternEditor() {

    const { patternId } = useParams();

    const { data: pattern, isLoading } = usePattern(patternId!);

    if (!pattern || isLoading) {
        return (
            <LinearProgress/>
        );
    }

    const documentId = 708;

    return (
        <Stack direction="row" sx={{ width: '100%', height: '100%' }} spacing={2}>
            <Stack direction="column" spacing={2} sx={{ height: '100%', width: '20%' }}>
                <ChecksCard pattern={pattern}/>
                <MatchingDocsCard pattern={pattern}/>
            </Stack>

            <DocumentView documentId={documentId} pattern={pattern}/>

            <Stack direction="column" spacing={2} sx={{ height: '100%', width: '20%' }}>
                <RegionsCard pattern={pattern}/>
                <FieldsCard pattern={pattern}/>
            </Stack>
        </Stack>
    );
}
