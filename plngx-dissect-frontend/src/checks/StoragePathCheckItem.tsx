import { ListItemText } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import { StoragePathCheck } from "../types";
import DialogListItem from "../utils/DialogListItem";
import { CheckItemPropsType } from "./types";
import PaperlessElementSelector from "../utils/PaperlessElementSelector";

const StoragePathCheckItem = (props: CheckItemPropsType<StoragePathCheck>) => {
    const [value, setValue] = useState(props.check.name);

    const onChangeConfirmed = () => {
        props.onChange(produce(props.check, draft => {
            draft.name = value;
        }));
    }

    return (
        <DialogListItem dialogTitle="Check Storage Path" onChangeConfirmed={onChangeConfirmed} onDelete={props.onDelete}>
            <DialogListItem.DialogContent>
                <PaperlessElementSelector value={value} onChange={setValue} label="Storage Path" slug="storage_paths"/>
            </DialogListItem.DialogContent>
            <DialogListItem.ItemContent>
                <ListItemText primary="Storage Path" secondary={`Must be "${props.check.name}"`}></ListItemText>
            </DialogListItem.ItemContent>
        </DialogListItem>
    );
};

export default StoragePathCheckItem;
