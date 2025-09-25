import { ListItemText } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import { DocumentTypeCheck } from "../../../types";
import DialogListItem from "../../../utils/DialogListItem";
import { CheckItemPropsType } from "./types";
import PaperlessElementSelector from "../../../utils/PaperlessElementSelector";
import CheckResultIcon from "../../../utils/CheckResultIcon";

const DocumentTypeCheckItem = (props: CheckItemPropsType<DocumentTypeCheck>) => {
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
        <DialogListItem dialogTitle="Check Document Type" onChangeConfirmed={onChangeConfirmed} onChangeCanceled={onChangeCanceled} onDelete={props.onDelete}>
            <DialogListItem.DialogContent>
                <PaperlessElementSelector value={value} onChange={setValue} label="Document Type" slug="document_types"/>
            </DialogListItem.DialogContent>
            <DialogListItem.ItemContent icon={<CheckResultIcon result={props.result}/>}>
                <ListItemText primary="Document Type" secondary={`Must be "${props.check.name}"`}></ListItemText>
            </DialogListItem.ItemContent>
        </DialogListItem>
    );
};

export default DocumentTypeCheckItem;
