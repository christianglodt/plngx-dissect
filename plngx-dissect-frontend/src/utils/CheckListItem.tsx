import { ListItem } from "@mui/material";
import React, { PropsWithChildren, useState } from "react";

import { Box, Button, Dialog, DialogActions, DialogContent as MuiDialogContent, DialogTitle, Stack } from "@mui/material";
import ConfirmButton from "./ConfirmButton";

export type CheckListItemPropsType = {
    onChangeConfirmed: () => void;
    onDelete: () => void;
    dialogTitle: string | React.JSX.Element;
    dialogExtraTitle?: React.ReactNode | null;
    children: React.ReactElement[] | React.ReactElement;
}

const ItemContent = (props: PropsWithChildren) => {
    return <>{props.children}</>
}

const DialogContent = (props: PropsWithChildren) => {
    return <>{props.children}</>
}

const CheckListItem = (props: CheckListItemPropsType) => {
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
            <Dialog open={dialogOpen} onClose={onDialogClose}>
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
            
            <ListItem onClick={() => setDialogOpen(true)} sx={{ cursor: 'pointer' }}>
                {itemContent}
            </ListItem>
        </>
    );
}

CheckListItem.ItemContent = ItemContent;
CheckListItem.DialogContent = DialogContent;

export default CheckListItem;
