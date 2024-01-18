import { Box } from "@mui/material";
import { CheckTypeId, Document, Pattern, RegionRegex, RegionRegexCheck } from "../types";
import TextRunBox from "./TextRunBox";
import RegionBox from "./RegionBox";
import { produce } from "immer";
import { DragEvent } from "react";
import useResizeObserver from "use-resize-observer";

type PagePropsType = {
    document: Document;
    pageNr: number;
    pattern: Pattern;
    onChange: (newPattern: Pattern) => void;
}

const Page = (props: PagePropsType) => {

    const { pattern, document, pageNr } = props;
    const pageWidth = document.pages[pageNr].width;
    const pageHeight = document.pages[pageNr].height;

    //const regionChecks = pattern.checks.filter(r => r.type === CheckTypeId.Region) as Array<RegionRegexCheck>;

    const onRegionCheckChange = (newRegion: RegionRegexCheck, index: number) => {
        props.onChange(produce(pattern, draft => {
            draft.checks[index] = newRegion;
        }));
    }

    const onRegionChange = (newRegion: RegionRegex, index: number) => {
        props.onChange(produce(pattern, draft => {
            draft.regions[index] = newRegion;
        }));
    }

    const { ref: boundingNode, width = 1, height = 1 } = useResizeObserver<HTMLDivElement>();
    const pageDimensions = [width, height];

    const onDragOver = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); };
    const onDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); };

    // This uses three DOM nodes to ensure the page is centered with a proper bounding element.
    return (
        <Box sx={{ height: '100%', position: 'relative' }}>
            <Box sx={{ height: '100%', textAlign: 'center', minHeight: 0, backgroundImage: `url("/api/document/${document.id}/svg?page_nr=${pageNr}")`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', backgroundPosition: 'center' }}>
            </Box>
            <div ref={boundingNode} onDragOver={onDragOver} onDrop={onDrop} style={{
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
                <TextRunBox key={index} textRun={tr} pageWidth={pageWidth} pageHeight={pageHeight}/>
                )}

                { pattern.checks.map((check, index) =>
                check.type === CheckTypeId.Region &&
                <RegionBox<RegionRegexCheck> key={index} region={check} text={check.regex} pageClientRectDimensions={pageDimensions} onChange={(newRegion: RegionRegexCheck) => onRegionCheckChange(newRegion, index)} pageWidth={pageWidth} pageHeight={pageHeight}/>
                )}
                { pattern.regions.map((region, index) =>
                <RegionBox<RegionRegex> key={index} region={region} text={region.regex} pageClientRectDimensions={pageDimensions} onChange={(newRegion: RegionRegex) => onRegionChange(newRegion, index)} pageWidth={pageWidth} pageHeight={pageHeight}/>
                )}
            </div>

        </Box>
    );
}

export default Page;
