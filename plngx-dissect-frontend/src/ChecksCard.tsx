import { Box, Card, CardContent, CardHeader, IconButton } from "@mui/material";
import { Pattern } from "./hooks";
import { Add } from "@mui/icons-material";

type ChecksCardProps = {
    pattern: Pattern;
}

const ChecksCard = (props: ChecksCardProps) => {

    const { pattern } = props;

    const header = <Box sx={{ flexDirection: 'row', flexWrap: 'nowrap', display: 'flex', justifyContent: 'space-between' }}><div>Checks</div><IconButton><Add/></IconButton></Box>;

    return (
        <Card sx={{ height: '100%' }}>
            <CardHeader title={header}></CardHeader>
            <CardContent>
                
            </CardContent>
        </Card>        
    );
}

export default ChecksCard;