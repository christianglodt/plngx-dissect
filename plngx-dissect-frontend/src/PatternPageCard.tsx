import { Card, CardContent, CardHeader, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, TextField } from "@mui/material";
import { Pattern } from "./types";
import { useState } from "react";

type PatternPageCardPropsType = {
    pattern: Pattern;
    onChange: (newPattern: Pattern) => void;
}

const PatternPageCard = (props: PatternPageCardPropsType) => {

    const [pageNr, setPageNr] = useState(props.pattern.page);

    const selectValue = pageNr === 0 ? 'first' : (pageNr === -1 ? 'last' : 'exact');

    const onSelectChange = (event: SelectChangeEvent) => {
        if (event.target.value === 'first') {
            setPageNr(0);
        }
        if (event.target.value === 'last') {
            setPageNr(-1);
        }
        if (event.target.value === 'exact') {
            setPageNr(1);
        }
    }

    return (
        <Card sx={{ height: '27%' }}>
            <CardHeader title="Page"></CardHeader>
            <CardContent>
                <FormControl fullWidth>
                    <Stack direction="row" gap={2}>
                        <InputLabel id="pattern-page-select-label">Page Number</InputLabel>
                        <Select sx={{ width: '100%' }}
                            labelId="pattern-page-select-label"
                            value={selectValue}
                            label="Page Number"
                            onChange={onSelectChange}
                        >
                            <MenuItem value="first">First</MenuItem>
                            <MenuItem value="exact">Exact</MenuItem>
                            <MenuItem value="last">Last</MenuItem>
                        </Select>
                        
                        { pageNr !== 0 && pageNr !== -1 &&
                        <TextField sx={{ width: '100%' }} type="number" value={pageNr + 1} onChange={(event) => setPageNr(Number(event.target.value) - 1)}/>
                        }
                    </Stack>
                </FormControl>
            </CardContent>
        </Card>
    );
}

export default PatternPageCard;
