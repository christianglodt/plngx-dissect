import { Box, Card, CardContent, CardHeader, IconButton } from "@mui/material";
import { Pattern } from "./hooks";
import { Add } from "@mui/icons-material";

type RegionsCardProps = {
    pattern: Pattern;
}

const RegionsCard = (props: RegionsCardProps) => {

    const { pattern } = props;

    const header = <Box sx={{ flexDirection: 'row', flexWrap: 'nowrap', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}><div>Regions</div><IconButton><Add/></IconButton></Box>;

    return (
        <Card sx={{ height: '100%' }}>
            <CardHeader title={header}></CardHeader>
            <CardContent>
                
            </CardContent>
        </Card>        
    );
}

export default RegionsCard;