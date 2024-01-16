import { List, ListItemText } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import { OrCheck, Check } from "../types";
import CheckListItem from "../utils/CheckListItem";
import CheckItemFactory from "./CheckItemFactory";
import CreateCheckItemButton from "./CreateCheckItemButton";
import { CheckItemPropsType } from "./types";

const OrCheckItem = (props: CheckItemPropsType<OrCheck>) => {

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
    return (
        <CheckListItem dialogTitle="Or Check" dialogExtraTitle={<CreateCheckItemButton onCheckCreated={onCheckCreated}/>} onChangeConfirmed={onChangeConfirmed} onDelete={props.onDelete}>
            <CheckListItem.DialogContent>
                <List>
                    {checks.map((check, index) =>
                        <CheckItemFactory key={index} check={check} onChange={(newCheck) => onCheckChanged(newCheck, index)} onDelete={() => onCheckDeleted(index)}/>
                    )}
                </List>
            </CheckListItem.DialogContent>
            <CheckListItem.ItemContent>
                <ListItemText primary="Or" secondary={`${checks.length} sub-check${pluralize}`}></ListItemText>
            </CheckListItem.ItemContent>
        </CheckListItem>
    );
};

export default OrCheckItem;
