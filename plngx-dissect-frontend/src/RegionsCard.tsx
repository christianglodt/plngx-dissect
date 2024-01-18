import { IconButton } from "@mui/material";
import { Pattern, RegionRegex } from "./types";
import { Add } from "@mui/icons-material";
import ListCard from "./utils/ListCard";
import RegionListItem from "./RegionListItem";
import { produce } from "immer";

type RegionsCardProps = {
    pattern: Pattern;
    onChange: (newPattern: Pattern) => void;
}

const RegionsCard = (props: RegionsCardProps) => {

    const { pattern, onChange } = props;

    const onRegionChange = (newRegion: RegionRegex, index: number) => {
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
                x2: 100,
                y2: 75,
                regex: '(?P<name>.*)'
            });
        }));
    }

    // The RegionListItem key is set to the JSON representation of the region below to ensure
    // the RegionListItem is remounted when the region is changed. This is necessary because the RegionRegex is
    // changed via drag-and-drop, which does not synchronize the state in the RegionListItem dialog.

    return (
        <ListCard title="Regions" headerWidget={<IconButton onClick={onAddRegionClick}><Add/></IconButton>}>
            { pattern.regions.map((region, index) =>
            <RegionListItem key={JSON.stringify(region) + index} nr={index + 1} region={region} onChange={(newRegion: RegionRegex) => onRegionChange(newRegion, index)} onDelete={() => onRegionDelete(index)}/>
            )}
        </ListCard>
    );
}

export default RegionsCard;
