import { ListItemText, Stack, TextField } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import { RegionRegexCheck } from "../types";
import CheckListItem from "../utils/CheckListItem";
import { CheckItemPropsType } from "./types";

const RegionRegexCheckItem = (props: CheckItemPropsType<RegionRegexCheck>) => {

    const [x, setX] = useState(props.check.region.x);
    const [y, setY] = useState(props.check.region.y);
    const [x2, setX2] = useState(props.check.region.x2);
    const [y2, setY2] = useState(props.check.region.y2);
    const [regex, setRegex] = useState(props.check.regex);

    const onChangeConfirmed = () => {
        props.onChange(produce(props.check, draft => {
            draft.region.x = x;
            draft.region.y = y;
            draft.region.x2 = x2;
            draft.region.y2 = y2;
            draft.regex = regex;
            }));
    }

    return (
        <CheckListItem dialogTitle="Check Region Text" onChangeConfirmed={onChangeConfirmed} onDelete={props.onDelete}>
            <CheckListItem.DialogContent>
                <Stack gap={2}>
                    <TextField label="Top Left X Coordinate" type="number" value={x} onChange={(event) => setX(Number(event.target.value))}></TextField>
                    <TextField label="Top Left Y Coordinate" type="number" value={y} onChange={(event) => setY(Number(event.target.value))}></TextField>
                    <TextField label="Bottom Right X Coordinate" type="number" value={x2} onChange={(event) => setX2(Number(event.target.value))}></TextField>
                    <TextField label="Bottom Right Y Coordinate" type="number" value={y2} onChange={(event) => setY2(Number(event.target.value))}></TextField>
                    <TextField label="Regular Expression" value={regex} onChange={(event) => setRegex(event.target.value)}></TextField>
                </Stack>
            </CheckListItem.DialogContent>
            <CheckListItem.ItemContent>
                <ListItemText sx={{ whiteSpace: 'pre-wrap' }} primary="Region Text" secondary={`Must match "${props.check.regex}"\nin region [${props.check.region.x}, ${props.check.region.y}, ${props.check.region.x2}, ${props.check.region.y2}]`}></ListItemText>
            </CheckListItem.ItemContent>
        </CheckListItem>
    );
};

export default RegionRegexCheckItem;
