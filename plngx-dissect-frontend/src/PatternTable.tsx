import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { Link, useNavigate } from 'react-router-dom';
import { useCreatePatternMutation, usePatternList } from "./hooks";
import { Pattern } from './types';
import InputDialogButton from './utils/InputDialogButton';
import PortalBox from './utils/PortalBox';


const PatternTable = () => {

    const { data: patterns, isLoading } = usePatternList();

    const createPatternMutation = useCreatePatternMutation();
    const navigate = useNavigate();

    const onCreatePatternConfirmed = (newPatternName: string) => {
        createPatternMutation.mutate(newPatternName, {
            onSuccess: (pattern: Pattern) => {
                navigate(`/pattern/${encodeURIComponent(pattern.name)}`);
            }
        })
    }

    return (
        <>
            <PortalBox>
                <InputDialogButton label="New" dialogTitle="Create new Pattern" dialogText="Enter new Pattern name" onConfirmed={onCreatePatternConfirmed}/>
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
