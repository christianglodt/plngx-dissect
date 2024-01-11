import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Alert, Box, IconButton, Skeleton, Stack } from "@mui/material";
import { useDocument, Document, Pattern } from "./hooks";
import { useState } from "react";

type PagePropsType = {
    document: Document;
    pageNr: number;
}


const Page = (props: PagePropsType) => {

    const { document, pageNr } = props;
    const aspectRatio = document.pages[pageNr].aspect_ratio;


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
                aspectRatio: aspectRatio,
                marginLeft: 'auto',
                marginRight: 'auto'
            }}>

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
    const { data: document } = useDocument(documentId);

    if (!documentId) {
        return (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Alert severity="info">Select a matching document</Alert>
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
