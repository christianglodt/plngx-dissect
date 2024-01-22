import { ListItemButton, ListItemIcon } from "@mui/material";
import React, { PropsWithChildren, useState } from "react";

import { Box, Button, Dialog, DialogActions, DialogContent as MuiDialogContent, DialogTitle, Stack } from "@mui/material";
import ConfirmButton from "./ConfirmButton";

export type DialogListItemPropsType = {
    onChangeConfirmed: () => void;
    onDelete: () => void;
    dialogTitle: string | React.JSX.Element;
    dialogExtraTitle?: React.ReactNode | null;
    children: React.ReactElement[] | React.ReactElement;
}

export type ItemContentPropsType = PropsWithChildren & {
    icon?: React.ReactNode;
}

const ItemContent = (props: ItemContentPropsType) => {
    return (
        <>
            {props.children}
            {props.icon &&
            <ListItemIcon>{props.icon}</ListItemIcon>
            }
        </>
    );
}

const DialogContent = (props: PropsWithChildren) => {
    return <>{props.children}</>
}

const DialogListItem = (props: DialogListItemPropsType) => {
    const { onChangeConfirmed, onDelete } = props;

    const [dialogOpen, setDialogOpen] = useState(false);

    const onDialogClose = () => {
        setDialogOpen(false);
    }

    const onDialogConfirmed = () => {
        onChangeConfirmed();
        onDialogClose();
    }

    const onDeleteConfirmed = () => {
        onDelete();
        onDialogClose();
    };


    const dialogContent = React.Children.toArray(props.children).filter(c => (c as React.ReactElement).type === DialogContent)[0];
    const itemContent = React.Children.toArray(props.children).filter(c => (c as React.ReactElement).type === ItemContent)[0];

    return (
        <>
            <Dialog open={dialogOpen} onClose={onDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Stack direction="row" gap={2} alignItems="center" justifyContent="space-between">
                        {props.dialogTitle}
                        {props.dialogExtraTitle}
                    </Stack>
                </DialogTitle>
                <MuiDialogContent>
                    <Box sx={{ paddingTop: '0.5rem' }}>
                        {dialogContent}
                    </Box>
                </MuiDialogContent>
                <DialogActions>
                    <ConfirmButton variant="text" color="warning" sx={{ marginRight: 'auto' }} dialogTitle="Delete Check?" dialogText="Are you sure to delete this check?" onConfirmed={onDeleteConfirmed}>Delete</ConfirmButton>
                    <Button variant="outlined" onClick={onDialogClose}>Cancel</Button>
                    <Button variant="contained" onClick={onDialogConfirmed}>Ok</Button>
                </DialogActions>
            </Dialog>
            
            <ListItemButton onClick={() => setDialogOpen(true)} sx={{ cursor: 'pointer' }}>
                {itemContent}
            </ListItemButton>
        </>
    );
}

DialogListItem.ItemContent = ItemContent;
DialogListItem.DialogContent = DialogContent;

export default DialogListItem;
