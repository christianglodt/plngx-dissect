import { ListItemText, Stack, TextField } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import DialogListItem from "./utils/DialogListItem";
import { RegionRegex, RegionResult } from "./types";

type RegionListItemPropsType = {
    nr: number;
    region: RegionRegex;
    result: RegionResult | null | undefined;
    onChange: (newRegion: RegionRegex) => void;
    onDelete: () => void;
}

const RegionListItem = (props: RegionListItemPropsType) => {

    const [x, setX] = useState(props.region.x);
    const [y, setY] = useState(props.region.y);
    const [x2, setX2] = useState(props.region.x2);
    const [y2, setY2] = useState(props.region.y2);
    const [regex, setRegex] = useState(props.region.regex);

    const onChangeConfirmed = () => {
        props.onChange(produce(props.region, draft => {
            draft.x = x;
            draft.y = y;
            draft.x2 = x2;
            draft.y2 = y2;
            draft.regex = regex;
        }));
    }

    let groupsText = '';
    if (props.result) {
        for (const key of Object.keys(props.result.group_values)) {
            groupsText += ` - ${key}: ${props.result.group_values[key]}\n`;
        }
    }

    return (
        <DialogListItem dialogTitle="Region" onChangeConfirmed={onChangeConfirmed} onDelete={props.onDelete}>
            <DialogListItem.DialogContent>
                <Stack gap={2}>
                    <TextField label="Top Left X Coordinate" type="number" value={x} onChange={(event) => setX(Number(event.target.value))}></TextField>
                    <TextField label="Top Left Y Coordinate" type="number" value={y} onChange={(event) => setY(Number(event.target.value))}></TextField>
                    <TextField label="Bottom Right X Coordinate" type="number" value={x2} onChange={(event) => setX2(Number(event.target.value))}></TextField>
                    <TextField label="Bottom Right Y Coordinate" type="number" value={y2} onChange={(event) => setY2(Number(event.target.value))}></TextField>
                    <TextField label="Regular Expression" value={regex} onChange={(event) => setRegex(event.target.value)}></TextField>
                </Stack>
            </DialogListItem.DialogContent>
            <DialogListItem.ItemContent>
                <ListItemText sx={{ whiteSpace: 'pre-wrap' }} primary={`Region ${props.nr}`} secondary={`[${props.region.x}, ${props.region.y}, ${props.region.x2}, ${props.region.y2}] - ${props.region.regex}\n${groupsText}`}></ListItemText>
            </DialogListItem.ItemContent>
        </DialogListItem>
    );
};

export default RegionListItem;
