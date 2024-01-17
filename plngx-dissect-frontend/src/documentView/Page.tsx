import { Box } from "@mui/material";
import { Document } from "../types";
import TextRunBox from "./TextRunBox";

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

export default Page;
