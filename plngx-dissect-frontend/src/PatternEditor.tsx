import { useParams } from "react-router-dom";
import { usePattern } from "./hooks";
import { Card, CardHeader, Divider, Paper, Stack } from "@mui/material";


export default function PatternEditor() {

    const { patternId } = useParams();

    const { data: pattern } = usePattern(patternId!);

    return (
        <Stack direction="row" sx={{ width: '100%', height: '100%' }} spacing={2}>
            <Stack direction="column" spacing={2} divider={<Divider orientation="horizontal" flexItem />} sx={{ height: '100%', width: '20%' }}>
                <Card sx={{ height: '100%' }}>
                    <CardHeader title="Checks"></CardHeader>
                </Card>
                <Card sx={{ height: '100%' }}>
                    <CardHeader title="Matching Documents"></CardHeader>
                </Card>
            </Stack>

            <Stack direction="column" spacing={2} sx={{ width: '60%', height: '100%' }}>
                <div style={{ height: '100%' }}>Page</div>
                <div>Document Page Nav?</div>
            </Stack>

            <Stack direction="column" spacing={2} divider={<Divider orientation="horizontal" flexItem />} sx={{ height: '100%', width: '20%' }}>
                <Card sx={{ height: '100%' }}>
                    <CardHeader title="Regions"></CardHeader>
                </Card>
                <Card sx={{ height: '100%' }}>
                    <CardHeader title="Fields"></CardHeader>
                </Card>
            </Stack>
        </Stack>
    );
}
