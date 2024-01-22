import { ChevronLeft, ChevronRight, OpenInNew } from "@mui/icons-material";
import { Alert, AlertTitle, Box, IconButton, Skeleton, Stack } from "@mui/material";
import { useDocument } from "../hooks";
import { useState } from "react";
import { Pattern } from "../types";
import Page from "./Page";
import { useSearchParams } from "react-router-dom";

type DocumentPropsType = {
    documentId: number | null;
    pattern: Pattern;
    onChange: (newPattern: Pattern) => void;
};

const DocumentView = (props: DocumentPropsType) => {

    const { documentId, pattern } = props;
    const [searchParams, setSearchParams] = useSearchParams();
    const { data: document, error } = useDocument(documentId);

    if (!documentId) {
        return (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Alert severity="info">Select a matching document</Alert>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Alert severity="error">
                    <AlertTitle>An error occured</AlertTitle>
                    {error.toString()}
                </Alert>
            </Box>
        );
    }

    if (!document) {
        return <Skeleton variant="rectangular" sx={{ width: '100%', height: '100%' }}/>;
    }

    const pageNr = Number(searchParams.get('page') || '1') - 1;

    const setPageNr = (newNr: number) => {
        if (newNr == 0) {
            searchParams.delete('page');
        } else {
            searchParams.set('page', String(newNr + 1));
        }
        setSearchParams(searchParams);
    }

    return (
        <Stack sx={{ height: '100%', width: '100%' }} spacing={2}>
            <Page document={document} pageNr={pageNr} pattern={pattern} onChange={props.onChange}/>
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
