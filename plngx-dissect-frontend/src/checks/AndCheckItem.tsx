import { List, ListItemText } from "@mui/material";
import { AndCheck, Check } from "../types";
import { useState } from "react";
import CheckItemDialog from "../utils/CheckItemDialog";
import CheckItem, { CheckItemDialogPropsType, CheckItemPropsType } from "../utils/CheckItem";
import CreateCheckItemButton from "./CreateCheckItemButton";
import CheckItemFactory from "./CheckItemFactory";
import { produce } from "immer";


const AndCheckDialog = (props: CheckItemDialogPropsType<AndCheck>) => {

    const [checks, setChecks] = useState(props.check.checks);

    const onChangeDraft = (draft: AndCheck) => {
        draft.checks = checks;
    }

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

    return (
        <CheckItemDialog<AndCheck> title="And Check" onChangeDraft={onChangeDraft} extraTitle={<CreateCheckItemButton onCheckCreated={onCheckCreated}/>} {...props}>
            <List>
                {checks.map((check, index) =>
                    <CheckItemFactory key={index} check={check} onChange={(newCheck) => onCheckChanged(newCheck, index)} onDelete={() => onCheckDeleted(index)}/>
                )}
            </List>
        </CheckItemDialog>
    );
}

const AndCheckItem = (props: CheckItemPropsType<AndCheck>) => {

    const pluralize = props.check.checks.length == 1 ? '' : 's';
    return (
        <CheckItem<AndCheck> dialogComponent={AndCheckDialog} {...props}>
            <ListItemText primary="And" secondary={`${props.check.checks.length} sub-check${pluralize}`}></ListItemText>
        </CheckItem>
    );
};

export default AndCheckItem;
