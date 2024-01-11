import { Box, Card, CardContent, CardHeader, CircularProgress } from "@mui/material";
import { Pattern } from "./hooks";

type MatchingDocsCardProps = {
    pattern: Pattern;
}

const MatchingDocsCard = (props: MatchingDocsCardProps) => {

    const { pattern } = props;

    const header = <Box sx={{ flexDirection: 'row', flexWrap: 'nowrap', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}><div>Matching&nbsp;Documents</div><CircularProgress/></Box>;

    return (
        <Card sx={{ height: '100%' }}>
            <CardHeader title={header}></CardHeader>
            <CardContent>
                
            </CardContent>
        </Card>        
    );
}

export default MatchingDocsCard;