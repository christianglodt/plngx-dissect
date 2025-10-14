import { Button } from "@mui/material";

import { useContext } from "react";
import ConfirmButton from "../utils/ConfirmButton";
import { PatternEditorContext } from "./PatternEditorContext";
import RenameButton from "./RenameButton";
import SaveAsButton from "./SaveAsButton";


const PatternActionsButton = () => {

    const { pattern, document, isModified, isSaving, savePattern, deletePattern, processDocument } = useContext(PatternEditorContext);

    const onSaveClicked = () => {
        savePattern();
    }

    const onDeleteClicked = () => {
        deletePattern();
    }

    const onProcessDocumentConfirmed = () => {
        processDocument();
    }

    return (
        <>
            <ConfirmButton disabled={isSaving || isModified || pattern === null || document === null}  dialogTitle="Process Document?" dialogText="Process the current document with this pattern?" color="warning" onConfirmed={onProcessDocumentConfirmed}>Process</ConfirmButton>
            <RenameButton name={pattern.name}/>
            <ConfirmButton disabled={isSaving} dialogTitle="Delete Pattern?" dialogText="Are you sure to delete this pattern?" color="warning" onConfirmed={onDeleteClicked}>Delete</ConfirmButton>
            <Button disabled={!isModified || isSaving} color="success" onClick={onSaveClicked}>Save</Button>
            <SaveAsButton name={pattern.name}/>
        </>
    );
}

export default PatternActionsButton;
