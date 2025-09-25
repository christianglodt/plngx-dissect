import { ListItemText } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import { CorrespondentCheck } from "../../../types";
import DialogListItem from "../../../utils/DialogListItem";
import { CheckItemPropsType } from "./types";
import PaperlessElementSelector from "../../../utils/PaperlessElementSelector";
import CheckResultIcon from "../../../utils/CheckResultIcon";


const CorrespondentCheckItem = (props: CheckItemPropsType<CorrespondentCheck>) => {
    const [value, setValue] = useState(props.check.name);

    const onChangeCanceled = () => {
        setValue(props.check.name);
    };

    const onChangeConfirmed = () => {
        props.onChange(produce(props.check, draft => {
            draft.name = value;
        }));
    };

    return (
        <DialogListItem dialogTitle="Check Correspondent" onChangeConfirmed={onChangeConfirmed} onChangeCanceled={onChangeCanceled} onDelete={props.onDelete}>
            <DialogListItem.DialogContent>
                <PaperlessElementSelector label="Correspondent" slug="correspondents" value={value} onChange={setValue}/>
            </DialogListItem.DialogContent>
            <DialogListItem.ItemContent icon={<CheckResultIcon result={props.result}/>}>
                <ListItemText primary="Correspondent" secondary={`Must be "${props.check.name}"`}></ListItemText>
            </DialogListItem.ItemContent>
        </DialogListItem>
    );
};

export default CorrespondentCheckItem;
