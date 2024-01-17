import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Alert, AlertTitle, Box, IconButton, Skeleton, Stack } from "@mui/material";
import { useDocument } from "./hooks";
import React, { useState } from "react";
import { Pattern, Document, TextRun } from "./types";

import './TextRun.css';

type TextRunBoxPropsType = {
    textRun: TextRun;
    pageWidth: number;
    pageHeight: number;
}

const TextRunBox = (props: TextRunBoxPropsType) => {

    const { pageWidth, pageHeight } = props;

    const ptToPercentH = (pt: number) => (pt / pageWidth) * 100.0;
    const ptToPercentV = (pt: number) => (pt / pageHeight) * 100.0;

    const style: React.CSSProperties = {
        left: `${ptToPercentH(props.textRun.x)}%`,
        width: `${ptToPercentH(props.textRun.x2 - props.textRun.x)}%`,
        height: `${ptToPercentV(props.textRun.y2 - props.textRun.y)}%`,
        top: `${ptToPercentV(props.textRun.y)}%`,
    };

    return (
        <div style={style} className="TextRun">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox={`0 0 ${props.textRun.x2 - props.textRun.x} ${props.textRun.y2 - props.textRun.y}`} style={{ display: 'block' }} preserveAspectRatio="none">
                <text fontSize={props.textRun.y2 - props.textRun.y + 0.5} textLength={props.textRun.x2 - props.textRun.x + 0.5} lengthAdjust="spacing" x="0" y={props.textRun.y2 - props.textRun.y - 0.5}>
                    {props.textRun.text}
                </text>
            </svg>
        </div>
    );
}

type PagePropsType = {
    document: Document;
    pageNr: number;
}

const Page = (props: PagePropsType) => {

    const { document, pageNr } = props;
    const pageWidth = document.pages[pageNr].width;
    const pageHeight = document.pages[pageNr].height;

    // This uses three DOM nodes to ensure the page is centered with a proper bounding element.
    return (
        <Box sx={{ height: '100%', position: 'relative' }}>
            <Box sx={{ height: '100%', textAlign: 'center', minHeight: 0, backgroundImage: `url("/api/document/${document.id}/svg?page_nr=${pageNr}")`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', backgroundPosition: 'center' }}>
            </Box>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                minHeight: 0,
                height: '100%', 
                aspectRatio: `${pageWidth} / ${pageHeight}`,
                marginLeft: 'auto',
                marginRight: 'auto'
            }}>


            { document.pages[pageNr].text_runs.map((tr, index) =>
                <TextRunBox key={index} textRun={tr} pageWidth={pageWidth} pageHeight={pageHeight} />
            )}
            </div>

        </Box>
    );
}


type DocumentPropsType = {
    documentId: number | null;
    pattern: Pattern;
};

const DocumentView = (props: DocumentPropsType) => {

    const { documentId, pattern } = props;
    const [pageNr, setPageNr] = useState(0);
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

    return (
        <Stack sx={{ height: '100%', width: '100%' }} spacing={2}>
            <Page document={document} pageNr={pageNr}/>
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', alignItems: 'center' }}>
                <IconButton disabled={pageNr == 0} onClick={() => setPageNr(pageNr - 1)}><ChevronLeft/></IconButton>
                <div>Page {pageNr + 1} / {document.pages.length }</div>
                <IconButton disabled={pageNr == document.pages.length - 1} onClick={() => setPageNr(pageNr + 1)}><ChevronRight/></IconButton>
            </Stack>
        </Stack>
    );
};

export default DocumentView;
