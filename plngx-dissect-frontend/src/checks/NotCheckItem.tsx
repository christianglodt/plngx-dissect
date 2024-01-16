import { List, ListItemText } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import { Check, NotCheck } from "../types";
import CheckListItem from "../utils/CheckListItem";
import CheckItemFactory from "./CheckItemFactory";
import CreateCheckItemButton from "./CreateCheckItemButton";
import { CheckItemPropsType } from "./types";

const NotCheckItem = (props: CheckItemPropsType<NotCheck>) => {

    const [check, setCheck] = useState(props.check.check);

    const onCheckCreated = (newCheck: Check) => {
        setCheck(newCheck);
    }

    const onChangeConfirmed = () => {
        props.onChange(produce(props.check, draft => {
            draft.check = check;
        }));
    }

    return (
        <CheckListItem dialogTitle="Not Check" dialogExtraTitle={<CreateCheckItemButton onCheckCreated={onCheckCreated} disabled={check !== null}/>} onChangeConfirmed={onChangeConfirmed} onDelete={props.onDelete}>
            <CheckListItem.DialogContent>
                { check &&
                <List>
                    <CheckItemFactory check={check} onChange={(newCheck) => setCheck(newCheck)} onDelete={() => setCheck(null)}/>
                </List>
                }
                </CheckListItem.DialogContent>
            <CheckListItem.ItemContent>
                <ListItemText primary="Not" secondary={check ? "1 sub-check" : "(no condition set)"}></ListItemText>
            </CheckListItem.ItemContent>
        </CheckListItem>
    );
};

export default NotCheckItem;
