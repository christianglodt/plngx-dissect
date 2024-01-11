import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { usePatternList } from "./hooks";
import { Link } from 'react-router-dom';


const PatternTable = () => {

    const { data: patterns, isLoading } = usePatternList();

    return (
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
                            <TableCell><Link to={`/pattern/${p.name}`}>{p.name}</Link></TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default PatternTable;
