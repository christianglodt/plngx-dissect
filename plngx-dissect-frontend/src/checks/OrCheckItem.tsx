import { List, ListItemText } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import { OrCheck, Check } from "../types";
import DialogListItem from "../utils/DialogListItem";
import CreateCheckItemButton from "./CreateCheckItemButton";
import { RecursiveCheckItemPropsType } from "./types";

const OrCheckItem = (props: RecursiveCheckItemPropsType<OrCheck>) => {

    const [checks, setChecks] = useState(props.check.checks);

    const onCheckCreated = (newCheck: Check) => {
        setChecks([...checks, newCheck]);
    }

    const onCheckChanged = (newCheck: Check, index: number) => {
        const newChecks = produce(checks, draft => {
            draft[index] = newCheck;
        });
        setChecks(newChecks);
    }

    const onCheckDeleted = (index: number) => {
        const newChecks = produce(checks, draft => {
            draft.splice(index, 1);
        });
        setChecks(newChecks);
    }

    const onChangeConfirmed = () => {
        props.onChange(produce(props.check, draft => {
            draft.checks = checks;
        }));
    }

    const subChecks = checks.map((check, index) => 
    props.factory({
        check,
        key: index,
        onChange: (newCheck: Check) => onCheckChanged(newCheck, index),
        onDelete: () => onCheckDeleted(index)
    })
);

    const pluralize = checks.length == 1 ? '' : 's';
    return (
        <DialogListItem dialogTitle="Or Check" dialogExtraTitle={<CreateCheckItemButton onCheckCreated={onCheckCreated}/>} onChangeConfirmed={onChangeConfirmed} onDelete={props.onDelete}>
            <DialogListItem.DialogContent>
                <List>
                    {subChecks}
                </List>
            </DialogListItem.DialogContent>
            <DialogListItem.ItemContent>
                <ListItemText primary="Or" secondary={`${checks.length} sub-check${pluralize}`}></ListItemText>
            </DialogListItem.ItemContent>
        </DialogListItem>
    );
};

export default OrCheckItem;
