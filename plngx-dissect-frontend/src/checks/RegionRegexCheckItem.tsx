import { Input, ListItemText, Stack, TextField } from "@mui/material";
import { RegionRegexCheck } from "../types";
import { useState } from "react";
import CheckItemDialog from "../utils/CheckItemDialog";
import CheckItem, { CheckItemDialogPropsType } from "../utils/CheckItem";


const RegionRegexCheckDialog = (props: CheckItemDialogPropsType<RegionRegexCheck>) => {

    const [x, setX] = useState(props.check.region.x);
    const [y, setY] = useState(props.check.region.y);
    const [x2, setX2] = useState(props.check.region.x2);
    const [y2, setY2] = useState(props.check.region.y2);
    const [regex, setRegex] = useState(props.check.regex);

    const onChangeDraft = (draft: RegionRegexCheck) => {
        draft.region.x = x;
        draft.region.y = y;
        draft.region.x2 = x2;
        draft.region.y2 = y2;
        draft.regex = regex;
    }

    return (
        <CheckItemDialog<RegionRegexCheck> title="Check Number of Pages" onChangeDraft={onChangeDraft} {...props}>
            <Stack gap={2} sx={{ marginTop: '0.5rem' }}>
                <TextField label="Top Left X Coordinate" type="number" value={x} onChange={(event) => setX(Number(event.target.value))}></TextField>
                <TextField label="Top Left Y Coordinate" type="number" value={y} onChange={(event) => setY(Number(event.target.value))}></TextField>
                <TextField label="Bottom Right X Coordinate" type="number" value={x2} onChange={(event) => setX2(Number(event.target.value))}></TextField>
                <TextField label="Bottom Right Y Coordinate" type="number" value={y2} onChange={(event) => setY2(Number(event.target.value))}></TextField>
                <TextField label="Regular Expression" value={regex} onChange={(event) => setRegex(event.target.value)}></TextField>
            </Stack>
        </CheckItemDialog>
    );
}

type RegionRegexCheckPropsType = {
    check: RegionRegexCheck;
    onChange: (newCheck: RegionRegexCheck) => void;
    onDelete: () => void;
}

const RegionRegexCheckItem = (props: RegionRegexCheckPropsType) => {

    const { check, onChange, onDelete } = props;

    return (
        <CheckItem<RegionRegexCheck> dialogComponent={RegionRegexCheckDialog} check={check} onChange={onChange} onDelete={onDelete}>
            <ListItemText sx={{ whiteSpace: 'pre-wrap' }} primary="Region Text Match" secondary={`Must match "${check.regex}"\nin region [${check.region.x}, ${check.region.y}, ${check.region.x2}, ${check.region.y2}]`}></ListItemText>
        </CheckItem>
    );
};

export default RegionRegexCheckItem;
