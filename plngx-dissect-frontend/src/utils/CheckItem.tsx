import { ListItem } from "@mui/material";
import React, { useState } from "react";

export type CheckItemDialogPropsType<CheckType> = {
    check: CheckType;
    open: boolean;
    onClose: () => void;
    onChange: (newCheck: CheckType) => void;
    onDelete: () => void;
}

export type CheckItemPropsType<CheckType> = {
    check: CheckType;
    onChange: (newCheck: CheckType) => void;
    onDelete: () => void;
    dialogComponent: React.FunctionComponent<CheckItemDialogPropsType<CheckType>>;
    children: React.ReactNode[] | React.ReactNode | null;
}

const CheckItem = <CheckType,>(props: CheckItemPropsType<CheckType>) => {
    const { check, onChange, onDelete } = props;

    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <>
            <props.dialogComponent check={check} open={dialogOpen} onClose={() => setDialogOpen(false)} onChange={onChange} onDelete={onDelete}/>
            <ListItem onClick={() => setDialogOpen(true)} sx={{ cursor: 'pointer' }}>
                {props.children}
            </ListItem>
        </>
    );
}

export default CheckItem;
