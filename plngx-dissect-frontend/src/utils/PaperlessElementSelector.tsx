import { Autocomplete, TextField } from "@mui/material";
import { PaperlessElementBase } from "../types";
import { usePaperlessElement } from "../hooks";
import { SyntheticEvent } from "react";


type PaperlessElementSelectorPropsType = {
    slug: string;
    label: string;
    value: string;
    onChange: (newValue: string) => void;
}

const PaperlessElementSelector = <T extends PaperlessElementBase,>(props: PaperlessElementSelectorPropsType) => {

    const { data } = usePaperlessElement<T>(props.slug);

    const options = data ? data.map(d => { return { label: d.name }; }) : [];

    const onAutocompleteChange = (_event: SyntheticEvent, value: string | { label: string } | null) => {
        if (value === null) {
            props.onChange('');
        } else if (value instanceof String) {
            props.onChange(value as string);
        } else if (value instanceof Object) {
            props.onChange(value.label);
        }
    };

    return (
        <Autocomplete
            value={props.value}
            freeSolo
            onChange={onAutocompleteChange}
            options={options}
            sx={{ width: '400px'}}
            renderInput={(params) => <TextField {...params} label={props.label} />}
        />
    );
}

export default PaperlessElementSelector;
