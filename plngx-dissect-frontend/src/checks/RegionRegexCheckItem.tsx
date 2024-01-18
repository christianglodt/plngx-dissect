import { ListItemText, Stack, TextField } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import { RegionRegexCheck } from "../types";
import DialogListItem from "../utils/DialogListItem";
import { CheckItemPropsType } from "./types";

const RegionRegexCheckItem = (props: CheckItemPropsType<RegionRegexCheck>) => {

    const [x, setX] = useState(props.check.x);
    const [y, setY] = useState(props.check.y);
    const [x2, setX2] = useState(props.check.x2);
    const [y2, setY2] = useState(props.check.y2);
    const [regex, setRegex] = useState(props.check.regex);

    const onChangeConfirmed = () => {
        props.onChange(produce(props.check, draft => {
            draft.x = x;
            draft.y = y;
            draft.x2 = x2;
            draft.y2 = y2;
            draft.regex = regex;
            }));
    }

    return (
        <DialogListItem dialogTitle="Check Region Text" onChangeConfirmed={onChangeConfirmed} onDelete={props.onDelete}>
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
                <ListItemText sx={{ whiteSpace: 'pre-wrap' }} primary="Region Text" secondary={`Must match "${props.check.regex}"\nin region [${Math.round(props.check.x)}, ${Math.round(props.check.y)}, ${Math.round(props.check.x2)}, ${Math.round(props.check.y2)}]`}></ListItemText>
            </DialogListItem.ItemContent>
        </DialogListItem>
    );
};

export default RegionRegexCheckItem;
