import { IconButton } from "@mui/material";
import { Pattern, PatternEvaluationResult, Region } from "./types";
import { Add } from "@mui/icons-material";
import ListCard from "./utils/ListCard";
import RegionListItem from "./RegionListItem";
import { produce } from "immer";

type RegionsCardProps = {
    pattern: Pattern;
    evalResult: PatternEvaluationResult | null | undefined;
    onChange: (newPattern: Pattern) => void;
}

const RegionsCard = (props: RegionsCardProps) => {

    const { pattern, onChange } = props;

    const onRegionChange = (newRegion: Region, index: number) => {
        onChange(produce(pattern, draft => {
            draft.regions[index] = newRegion;
        }));
    }

    const onRegionDelete = (index: number) => {
        onChange(produce(pattern, draft => {
            draft.regions.splice(index, 1);
        }));
    }

    const onAddRegionClick = () => {
        onChange(produce(pattern, draft => {
            draft.regions.push({
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
            <RegionListItem key={JSON.stringify(region) + index} nr={index + 1} region={region} result={props.evalResult?.regions[index]} onChange={(newRegion: Region) => onRegionChange(newRegion, index)} onDelete={() => onRegionDelete(index)}/>
            )}
        </ListCard>
    );
}

export default RegionsCard;
