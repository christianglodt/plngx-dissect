import { ListItemText, Stack, TextField } from "@mui/material";
import { DateCreatedCheck } from "../types";
import { useState } from "react";
import CheckItemDialog from "../utils/CheckItemDialog";
import CheckItem, { CheckItemDialogPropsType, CheckItemPropsType } from "../utils/CheckItem";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from "dayjs";


const DateCreatedCheckDialog = (props: CheckItemDialogPropsType<DateCreatedCheck>) => {

    const [before, setBefore] = useState(props.check.before);
    const [after, setAfter] = useState(props.check.after);
    const [year, setYear] = useState(props.check.year);

    const onChangeDraft = (draft: DateCreatedCheck) => {
        draft.before = before;
        draft.after = after;
        draft.year = year;
    }

    const afterSlotProps = {
        field: { clearable: true, onClear: () => setAfter(null) }
    };

    const beforeSlotProps = {
        field: { clearable: true, onClear: () => setBefore(null) }
    };

    return (
        <CheckItemDialog<DateCreatedCheck> title="Check Date Created" onChangeDraft={onChangeDraft} {...props}>
            <Stack gap={2}>
                <DatePicker<Dayjs> label="Date Is Before" value={dayjs(before)} onChange={(value) => setBefore(value ? value.toDate() : null)} format="D.M.YYYY" slotProps={afterSlotProps}/>
                <DatePicker<Dayjs> label="Date Is After"  value={dayjs(after)}  onChange={(value) => setAfter(value ? value.toDate() : null)} format="D.M.YYYY" slotProps={beforeSlotProps}/>
                <TextField type="number" label="Year is" value={year || ''} onChange={(event) => setYear(Number(event.target.value))}></TextField>
            </Stack>
        </CheckItemDialog>
    );
}

const DateCreatedCheckItem = (props: CheckItemPropsType<DateCreatedCheck>) => {

    const descriptionParts = [];
    if (props.check.before !== null) {
        descriptionParts.push(`before ${dayjs(props.check.before).format('D.M.YYYY')}`)
    }
    if (props.check.after) {
        descriptionParts.push(`after ${dayjs(props.check.after).format('D.M.YYYY')}`)
    }
    if (props.check.year) {
        descriptionParts.push(`year must be ${props.check.year}`)
    }

    const description = descriptionParts.length > 0 ? 'Must be ' + descriptionParts.join(', ') : '(no condition set)';

    return (
        <CheckItem<DateCreatedCheck> dialogComponent={DateCreatedCheckDialog} {...props}>
            <ListItemText primary="Date Created" secondary={description}></ListItemText>
        </CheckItem>
    );
};

export default DateCreatedCheckItem;
