import { Box } from "@mui/material";
import { CheckTypeId, Region, RegionCheck } from "../../types";
import TextRunBox from "./TextRunBox";
import RegionBox from "./RegionBox";
import { produce } from "immer";
import { DragEvent, useContext } from "react";
import useResizeObserver from "use-resize-observer";
import { PATH_PREFIX } from "../../hooks";
import { PatternEditorContext } from "../PatternEditorContext";

const Page = () => {

    const { pattern, document, pageNr, onPatternChange } = useContext(PatternEditorContext);
    const { ref: boundingNode, width = 1, height = 1 } = useResizeObserver<HTMLDivElement>();

    if (document == null || pageNr == null || document.pages[pageNr] == undefined) {
        return <></>;
    }

    const pageWidth = document.pages[pageNr].width;
    const pageHeight = document.pages[pageNr].height;

    const onRegionCheckChange = (newRegion: RegionCheck, index: number) => {
        onPatternChange(produce(pattern, draft => {
            draft.checks[index] = newRegion;
        }));
    }

    const onRegionChange = (newRegion: Region, index: number) => {
        onPatternChange(produce(pattern, draft => {
            draft.regions[index] = newRegion;
        }));
    }

    const pageDimensions = [width, height];

    const onDragOver = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); };
    const onDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); };

    // This uses three DOM nodes to ensure the page is centered with a proper bounding element.
    return (
        <Box sx={{ height: '100%', position: 'relative' }}>
            <Box sx={{ position: 'relative', zIndex: 1, height: '100%', textAlign: 'center', minHeight: 0, backgroundImage: `url("${PATH_PREFIX}/api/document/${document!.id}/svg?page_nr=${pageNr}")`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', backgroundPosition: 'center' }}>
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
                marginRight: 'auto',
                backgroundColor: 'white'
            }}>
 
                { document!.pages[pageNr!].text_runs.map((tr, index) =>
                <TextRunBox key={index} textRun={tr} pageWidth={pageWidth} pageHeight={pageHeight}/>
                )}

                { pattern.checks.map((check, index) =>
                check.type === CheckTypeId.Region &&
                <RegionBox<RegionCheck> key={index} label={`Check ${index + 1}`} region={check} pageClientRectDimensions={pageDimensions} onChange={(newRegion: RegionCheck) => onRegionCheckChange(newRegion, index)} pageWidth={pageWidth} pageHeight={pageHeight}/>
                )}
                { pattern.regions.map((region, index) =>
                <RegionBox<Region> key={index} label={`Region ${index + 1}`} region={region} pageClientRectDimensions={pageDimensions} onChange={(newRegion: Region) => onRegionChange(newRegion, index)} pageWidth={pageWidth} pageHeight={pageHeight}/>
                )}
            </div>

        </Box>
    );
}

export default Page;
