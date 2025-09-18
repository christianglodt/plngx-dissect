import { IconButton } from "@mui/material";
import { Region } from "./types";
import { Add } from "@mui/icons-material";
import ListCard from "./utils/ListCard";
import RegionListItem from "./RegionListItem";
import { produce } from "immer";
import { useContext } from "react";
import { PatternEditorContext } from "./PatternEditorContext";

const RegionsCard = () => {

    const { pattern, onPatternChange, patternEvaluationResult } = useContext(PatternEditorContext);

    const onRegionChange = (newRegion: Region, index: number) => {
        onPatternChange(produce(pattern, draft => {
            draft.regions[index] = newRegion;
        }));
    }

    const onRegionDelete = (index: number) => {
        onPatternChange(produce(pattern, draft => {
            draft.regions.splice(index, 1);
        }));
    }

    const onAddRegionClick = () => {
        onPatternChange(produce(pattern, draft => {
            draft.regions.push({
                page: 'last_match',
                x: 50,
                y: 50,
                x2: 200,
                y2: 75,
                kind: 'simple',
                simple_expr: '<name:word>'
            });
        }));
    }

    // The RegionListItem key is set to the JSON representation of the region below to ensure
    // the RegionListItem is remounted when the region is changed. This is necessary because the Region is
    // changed via drag-and-drop, which does not synchronize the state in the RegionListItem dialog.

    return (
        <ListCard title="Regions" headerWidget={<IconButton onClick={onAddRegionClick}><Add/></IconButton>}>
            { pattern.regions.map((region, index) =>
            <RegionListItem key={JSON.stringify(region) + index} nr={index + 1} region={region} pageResults={patternEvaluationResult?.regions[index] || null} onChange={(newRegion: Region) => onRegionChange(newRegion, index)} onDelete={() => onRegionDelete(index)}/>
            )}
        </ListCard>
    );
}

export default RegionsCard;
