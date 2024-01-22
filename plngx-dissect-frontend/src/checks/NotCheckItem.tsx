import { ListItemText } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import { Check, NotCheck } from "../types";
import DialogListItem from "../utils/DialogListItem";
import CreateCheckItemButton from "./CreateCheckItemButton";
import { RecursiveCheckItemPropsType } from "./types";
import { CheckCircle } from "@mui/icons-material";

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
        <DialogListItem dialogTitle="Not Check" dialogExtraTitle={<CreateCheckItemButton onCheckCreated={onCheckCreated} disabled={check !== null}/>} onChangeConfirmed={onChangeConfirmed} onDelete={props.onDelete}>
            <DialogListItem.DialogContent>
                { subCheck }
                </DialogListItem.DialogContent>
            <DialogListItem.ItemContent icon={props.matches && <CheckCircle/>}>
                <ListItemText primary="Not" secondary={check ? "1 sub-check" : "(no condition set)"}></ListItemText>
            </DialogListItem.ItemContent>
        </DialogListItem>
    );
};

export default NotCheckItem;
