import { ListItemText } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import { Check, NotCheck } from "../types";
import CheckListItem from "../utils/CheckListItem";
import CreateCheckItemButton from "./CreateCheckItemButton";
import { RecursiveCheckItemPropsType } from "./types";

const NotCheckItem = (props: RecursiveCheckItemPropsType<NotCheck>) => {

    const [check, setCheck] = useState(props.check.check);

    const onCheckCreated = (newCheck: Check) => {
        setCheck(newCheck);
    }

    const onChangeConfirmed = () => {
        props.onChange(produce(props.check, draft => {
            draft.check = check;
        }));
    }

    const subCheck = check && props.factory({
        check,
        onChange: (newCheck: Check) => setCheck(newCheck),
        onDelete: () => setCheck(null)
    });

    return (
        <CheckListItem dialogTitle="Not Check" dialogExtraTitle={<CreateCheckItemButton onCheckCreated={onCheckCreated} disabled={check !== null}/>} onChangeConfirmed={onChangeConfirmed} onDelete={props.onDelete}>
            <CheckListItem.DialogContent>
                { subCheck }
                </CheckListItem.DialogContent>
            <CheckListItem.ItemContent>
                <ListItemText primary="Not" secondary={check ? "1 sub-check" : "(no condition set)"}></ListItemText>
            </CheckListItem.ItemContent>
        </CheckListItem>
    );
};

export default NotCheckItem;
