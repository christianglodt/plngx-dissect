import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { Link, useNavigate } from 'react-router-dom';
import { useCreatePatternMutation, usePatternList, useProcessAllMutation } from "../hooks";
import { Pattern } from '../types';
import InputDialogButton from '../utils/InputDialogButton';
import PortalBox from '../utils/PortalBox';
import { Card, CardContent, CardHeader, Stack } from '@mui/material';
import HistoryCard from './HistoryCard';
import ConfirmButton from '../utils/ConfirmButton';
import UnmatchedDocumentsCard from './UnmatchedDocumentsCard';
import ErroredDocumentsCard from './ErroredDocumentsCard';
import MultiMatchedDocumentsCard from './MultiMatchedDocumentsCard copy';


const PatternTable = () => {

    const { data: patterns, isLoading } = usePatternList();

    const createPatternMutation = useCreatePatternMutation();
    const processAllMutation = useProcessAllMutation();
    const navigate = useNavigate();

    const onCreatePatternConfirmed = (newPatternName: string) => {
        createPatternMutation.mutate(newPatternName, {
            onSuccess: (pattern: Pattern) => {
                navigate(`/pattern/${encodeURIComponent(pattern.name)}`);
            }
        })
    }

    const onProcessAllConfirmed = () => {
        processAllMutation.mutate();
    }

    return (
        <>
            <PortalBox>
                <ConfirmButton dialogTitle="Process all Documents" dialogText="Process all pending documents in Background?" color="warning" onConfirmed={onProcessAllConfirmed}>Process All</ConfirmButton>
                <InputDialogButton label="New" dialogTitle="Create new Pattern" dialogText="Enter new Pattern name" color="success" onConfirmed={onCreatePatternConfirmed}/>
            </PortalBox>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', height: '100%' }}>
                <Card sx={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <CardHeader title="Patterns"></CardHeader>
                    <CardContent sx={{ overflow: 'hidden', height: '100%' }}>
                        <TableContainer component={Paper} sx={{ position: 'relative', overflow: 'auto', height: '100%' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
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
                    </CardContent>
                </Card>
                <Stack direction="column" gap={2} minWidth="400px" height="100%" maxHeight="100%" overflow="hidden">
                    <UnmatchedDocumentsCard/>
                    <ErroredDocumentsCard/>
                    <MultiMatchedDocumentsCard/>
                    <HistoryCard/>
                </Stack>
            </Stack>
        </>
    );
};

export default PatternTable;
