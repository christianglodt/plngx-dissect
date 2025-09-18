import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, TextField } from "@mui/material";
import { useState } from "react";

type PageValue = number | 'first_match' | 'last_match';

type RegionPageSelectorPropsType = {
    value: PageValue;
    onChange: (newValue: PageValue) => void;
}

const RegionPageSelector = (props: RegionPageSelectorPropsType) => {

    const { value, onChange } = props;

    let initialExactPageNr = 2;
    let selectorValue = 'last_match';
    if (typeof value == 'number') {
        if (value == 0) {
            selectorValue = 'first_page';
        } else if (value == -1) {
            selectorValue = 'last_page';
        } else {
            selectorValue = 'exact_page';
            initialExactPageNr = Number(value) + 1;
        }
    } else if (value == 'last_match') {
        selectorValue = 'last_match';
    } else if (value == 'first_match') {
        selectorValue = 'first_match';
    }

    const [exactPageNr, setExactPageNr] = useState<string>(new String(initialExactPageNr).toString());

    const onSelectorChange = (event: SelectChangeEvent) => {
        const newValue = event.target.value;
        if (newValue == 'first_page') onChange(0);
        if (newValue == 'last_page') onChange(-1);
        if (newValue == 'exact_page') onChange(1);
        if (newValue == 'first_match') onChange('first_match');
        if (newValue == 'last_match') onChange('last_match');
    };

    const isNumber = (s: string) => /^-?\d+$/.test(s);

    const onExactPageNrChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const value = event.target.value;
        setExactPageNr(value);
        const n = Number(value);
        if (isNumber(value)) {
            onChange(n - 1);
        }
    };

    const exactPageNrError = !isNumber(exactPageNr) ? 'Must be an integer' : null;

    return (
        <>
            <Stack spacing={2} direction="row" alignItems="baseline" sx={{ width: '100%' }}>
                <FormControl size="small" sx={{ width: '100%' }}>
                    <InputLabel id="match-label">Retain Value From</InputLabel>
                    <Select id="match-select" labelId="match-label" label="Retain Value From" value={selectorValue} onChange={onSelectorChange}>
                        <MenuItem value="first_page">First Page</MenuItem>
                        <MenuItem value="last_page">Last Page</MenuItem>
                        <MenuItem value="exact_page">Exact Page Nr</MenuItem>
                        <MenuItem value="first_match">First Match</MenuItem>
                        <MenuItem value="last_match">Last Match</MenuItem>
                    </Select>
                </FormControl>
                { selectorValue === 'exact_page' &&
                <TextField size="small" label="Page Nr" error={exactPageNrError !== null} helperText={exactPageNrError} value={exactPageNr} onChange={onExactPageNrChange} sx={{ width: '100%' }}/>
                }
            </Stack>
        </>
    );
}

export default RegionPageSelector;
