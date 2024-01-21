import { Card, CardContent, CardHeader, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, TextField } from "@mui/material";
import { Pattern } from "./types";
import { produce } from "immer";

type PatternPageCardPropsType = {
    pattern: Pattern;
    onChange: (newPattern: Pattern) => void;
}

const PatternPageCard = (props: PatternPageCardPropsType) => {

    const pageNr = props.pattern.page;

    const selectValue = pageNr === 0 ? 'first' : (pageNr === -1 ? 'last' : 'exact');

    const onPageNrChange = (newPageNr: number) => {
        const newPattern = produce(props.pattern, draft => {
            draft.page = newPageNr;
        });
        props.onChange(newPattern);
    }

    const onSelectChange = (event: SelectChangeEvent) => {
        if (event.target.value === 'first') {
            onPageNrChange(0);
        }
        if (event.target.value === 'last') {
            onPageNrChange(-1);
        }
        if (event.target.value === 'exact') {
            onPageNrChange(1);
        }
    }

    return (
        <Card sx={{ flexShrink: 0 }}>
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
                        <TextField sx={{ width: '100%' }} type="number" value={pageNr + 1} onChange={(event) => onPageNrChange(Number(event.target.value) - 1)}/>
                        }
                    </Stack>
                </FormControl>
            </CardContent>
        </Card>
    );
}

export default PatternPageCard;
