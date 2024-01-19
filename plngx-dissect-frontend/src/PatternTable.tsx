import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { useCreatePatternMutation, usePatternList } from "./hooks";
import { Link, useNavigate } from 'react-router-dom';
import PortalBox from './utils/PortalBox';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useState } from 'react';
import { Pattern } from './types';


const PatternTable = () => {

    const { data: patterns, isLoading } = usePatternList();

    const [addPatternDialogOpen, setAddPatternDialogOpen] = useState(false);
    const [newPatternName, setNewPatternName] = useState('');
    const createPatternMutation = useCreatePatternMutation();
    const navigate = useNavigate();

    const onCreatePatternClosed = () => {
        setAddPatternDialogOpen(false);
        setNewPatternName('');
    }

    const onCreatePatternConfirmed = () => {
        createPatternMutation.mutate(newPatternName, {
            onSuccess: (pattern: Pattern) => {
                navigate(`/pattern/${encodeURIComponent(pattern.name)}`);
            }
        })
        onCreatePatternClosed();
    }

    const createPatternErrorMessage = newPatternName.trim() === '' ? 'Name can not be empty' : patterns?.find(p => p.name === newPatternName.trim()) ? 'Pattern already exists' : null;

    return (
        <>
            <Dialog open={addPatternDialogOpen} onClose={onCreatePatternClosed}>
                <DialogTitle>Create new Pattern</DialogTitle>
                <DialogContent>
                    <TextField autoFocus required label="Pattern Name" fullWidth value={newPatternName} onChange={(event) => setNewPatternName(event.target.value)} error={createPatternErrorMessage !== null} helperText={createPatternErrorMessage}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCreatePatternClosed}>Cancel</Button>
                    <Button onClick={onCreatePatternConfirmed}>Create</Button>
                </DialogActions>
            </Dialog>
            <PortalBox>
                <IconButton onClick={() => setAddPatternDialogOpen(true)}><Add/></IconButton>
            </PortalBox>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Pattern Name</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {!isLoading && patterns?.map(p =>
                            <TableRow key={p.name}>
                                <TableCell><Link to={`/pattern/${encodeURIComponent(p.name)}`}>{p.name}</Link></TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

export default PatternTable;
