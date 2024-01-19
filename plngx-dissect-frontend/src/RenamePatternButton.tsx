import { useRenamePatternMutation } from "./hooks";
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useState } from 'react';


const RenamePatternButton = () => {

    const [renamePatternDialogOpen, setRenamePatternDialogOpen] = useState(false);
    const [newPatternName, setNewPatternName] = useState('');
    const renamePatternMutation = useRenamePatternMutation();
    const navigate = useNavigate();
    const { patternId } = useParams();
    if (!patternId) {
        return <></>;
    }

    const onRenamePatternClosed = () => {
        setRenamePatternDialogOpen(false);
        setNewPatternName('');
    }

    const onRenamePatternConfirmed = () => {
        renamePatternMutation.mutate({ oldName: patternId, newName: newPatternName }, {
            onSuccess: () => {
                navigate(`/pattern/${encodeURIComponent(newPatternName)}`);
            }
        })
        onRenamePatternClosed();
    }

    const renamePatternErrorMessage = newPatternName.trim() === '' ? 'Name can not be empty' : null;

    return (
        <>
            <Dialog open={renamePatternDialogOpen} onClose={onRenamePatternClosed}>
                <DialogTitle>Rename Pattern</DialogTitle>
                <DialogContent>
                    <TextField autoFocus required label="New Pattern Name" fullWidth value={newPatternName} onChange={(event) => setNewPatternName(event.target.value)} error={renamePatternErrorMessage !== null} helperText={renamePatternErrorMessage}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onRenamePatternClosed}>Cancel</Button>
                    <Button onClick={onRenamePatternConfirmed}>Rename</Button>
                </DialogActions>
            </Dialog>
            <Button onClick={() => setRenamePatternDialogOpen(true)}>Rename</Button>
        </>
    );
};

export default RenamePatternButton;
