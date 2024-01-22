import { ListItemText } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import { CorrespondentCheck } from "../types";
import DialogListItem from "../utils/DialogListItem";
import { CheckItemPropsType } from "./types";
import PaperlessElementSelector from "../utils/PaperlessElementSelector";
import { CheckCircle } from "@mui/icons-material";


const CorrespondentCheckItem = (props: CheckItemPropsType<CorrespondentCheck>) => {
    const [value, setValue] = useState(props.check.name);

    const onChangeConfirmed = () => {
        props.onChange(produce(props.check, draft => {
            draft.name = value;
        }));
    }

    return (
        <DialogListItem dialogTitle="Check Correspondent" onChangeConfirmed={onChangeConfirmed} onDelete={props.onDelete}>
            <DialogListItem.DialogContent>
                <PaperlessElementSelector label="Correspondent" slug="correspondents" value={value} onChange={setValue}/>
            </DialogListItem.DialogContent>
            <DialogListItem.ItemContent icon={props.matches && <CheckCircle/>}>
                <ListItemText primary="Correspondent" secondary={`Must be "${props.check.name}"`}></ListItemText>
            </DialogListItem.ItemContent>
        </DialogListItem>
    );
};

export default CorrespondentCheckItem;
