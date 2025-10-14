import { Button, ButtonGroup, ClickAwayListener, Paper, Popper } from "@mui/material";

import { useContext, useRef, useState } from "react";
import ConfirmButton from "../utils/ConfirmButton";
import { PatternEditorContext } from "./PatternEditorContext";
import RenameButton from "./RenameButton";
import SaveAsButton from "./SaveAsButton";
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import { DeleteForever, Save, Sync } from "@mui/icons-material";


const PatternActionsButton = () => {

    const { pattern, document, isModified, isSaving, savePattern, deletePattern, processDocument } = useContext(PatternEditorContext);
    const anchorRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    const onSaveClicked = () => {
        savePattern();
    }

    const onDeleteClicked = () => {
        deletePattern();
    }

    const onProcessDocumentConfirmed = () => {
        processDocument();
    }

    const onPopupClose = (event: Event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
            return;
        }
        setOpen(false);
    };

    return (
        <>
            <ButtonGroup variant="contained" ref={anchorRef} sx={{ borderColor: '#666' }}>
                <Button disabled={!isModified || isSaving} variant="outlined" color="inherit" onClick={onSaveClicked} startIcon={<Save/>} style={{ borderColor: '#121212' }}>Save</Button>
                <Button size="small" color="inherit" variant="outlined" onClick={() => setOpen(!open)} style={{ borderColor: '#121212' }}><ArrowDropDownIcon/></Button>
            </ButtonGroup>

            <Popper sx={{ zIndex: 1 }} open={open} anchorEl={anchorRef.current} role={undefined} disablePortal>
                <Paper>
                    <ClickAwayListener onClickAway={onPopupClose}>
                        <ButtonGroup orientation="vertical" variant="contained">
                            <SaveAsButton name={pattern.name}/>
                            <RenameButton name={pattern.name}/>
                            <ConfirmButton style={{ borderColor: '#666' }} variant="outlined" icon={<Sync/>} disabled={isSaving || isModified || pattern === null || document === null}  dialogTitle="Process Document?" dialogText="Process the current document with this pattern?" color="warning" onConfirmed={onProcessDocumentConfirmed}>Process</ConfirmButton>
                            <ConfirmButton style={{ borderColor: '#666' }} variant="outlined" icon={<DeleteForever/>} disabled={isSaving} dialogTitle="Delete Pattern?" dialogText="Are you sure to delete this pattern?" color="error" onConfirmed={onDeleteClicked}>Delete</ConfirmButton>                        
                        </ButtonGroup>
                    </ClickAwayListener>
                </Paper>
            </Popper>
        </>
    );
}

export default PatternActionsButton;
