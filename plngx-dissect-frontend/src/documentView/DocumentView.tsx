import { ChevronLeft, ChevronRight, OpenInNew } from "@mui/icons-material";
import { Alert, Box, IconButton, Stack } from "@mui/material";
import Page from "./Page";
import { useContext } from "react";
import { PatternEditorContext } from "../PatternEditorContext";

const DocumentView = () => {

    const { document, pageNr, setPageNr, patternEvaluationResult } = useContext(PatternEditorContext);

    const anyCheckNotPassed = patternEvaluationResult?.checks.find(check_result => !check_result.passed) != undefined;    
    
    if (!document || pageNr === null || anyCheckNotPassed) {
        return (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Alert severity="info">Select a matching document</Alert>
            </Box>
        );
    }

    return (
        <Stack sx={{ height: '100%', width: '100%' }} spacing={2}>
            <Page/>
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', alignItems: 'center' }}>
                <IconButton disabled={pageNr == 0} onClick={() => setPageNr(pageNr - 1)}><ChevronLeft/></IconButton>
                <div>Page {pageNr + 1} / {document.pages.length }</div>
                <IconButton disabled={pageNr == document.pages.length - 1} onClick={() => setPageNr(pageNr + 1)}><ChevronRight/></IconButton>
                <a style={{ display: 'flex' }} href={document.paperless_url} target="_blank"><OpenInNew/></a>
            </Stack>
        </Stack>
    );
};

export default DocumentView;
