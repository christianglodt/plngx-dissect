import { List, ListItemText } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import { AndCheck, Check } from "../types";
import CheckListItem from "../utils/CheckListItem";
import CreateCheckItemButton from "./CreateCheckItemButton";
import { RecursiveCheckItemPropsType } from "./types";

const AndCheckItem = (props: RecursiveCheckItemPropsType<AndCheck>) => {

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

    const pluralize = checks.length == 1 ? '' : 's';

    const subChecks = checks.map((check, index) => 
        props.factory({
            check,
            key: index,
            onChange: (newCheck: Check) => onCheckChanged(newCheck, index),
            onDelete: () => onCheckDeleted(index)
        })
    );

    return (
        <CheckListItem dialogTitle="And Check" dialogExtraTitle={<CreateCheckItemButton onCheckCreated={onCheckCreated}/>} onChangeConfirmed={onChangeConfirmed} onDelete={props.onDelete}>
            <CheckListItem.DialogContent>
                <List>
                    {subChecks}
                </List>
            </CheckListItem.DialogContent>
            <CheckListItem.ItemContent>
                <ListItemText primary="And" secondary={`${checks.length} sub-check${pluralize}`}></ListItemText>
            </CheckListItem.ItemContent>
        </CheckListItem>
    );
};

export default AndCheckItem;
