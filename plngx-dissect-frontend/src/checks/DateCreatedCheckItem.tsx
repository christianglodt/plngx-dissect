import { ListItemText, Stack, TextField } from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from "dayjs";
import { produce } from "immer";
import { useState } from "react";
import { DateCreatedCheck } from "../types";
import DialogListItem from "../utils/DialogListItem";
import { CheckItemPropsType } from "./types";

const DateCreatedCheckItem = (props: CheckItemPropsType<DateCreatedCheck>) => {

    const [before, setBefore] = useState(props.check.before);
    const [after, setAfter] = useState(props.check.after);
    const [year, setYear] = useState(props.check.year);

    const afterSlotProps = {
        field: { clearable: true, onClear: () => setAfter(null) }
    };

    const beforeSlotProps = {
        field: { clearable: true, onClear: () => setBefore(null) }
    };

    const onChangeConfirmed = () => {
        props.onChange(produce(props.check, draft => {
            draft.before = before;
            draft.after = after;
            draft.year = year;
            }));
    }

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
        <DialogListItem dialogTitle="Check Date Created" onChangeConfirmed={onChangeConfirmed} onDelete={props.onDelete}>
            <DialogListItem.DialogContent>
                <Stack gap={2}>
                    <DatePicker<Dayjs> label="Date Is Before" value={dayjs(before)} onChange={(value) => setBefore(value ? value.toDate() : null)} format="D.M.YYYY" slotProps={afterSlotProps}/>
                    <DatePicker<Dayjs> label="Date Is After"  value={dayjs(after)}  onChange={(value) => setAfter(value ? value.toDate() : null)} format="D.M.YYYY" slotProps={beforeSlotProps}/>
                    <TextField type="number" label="Year is" value={year || ''} onChange={(event) => setYear(Number(event.target.value))}></TextField>
                </Stack>
            </DialogListItem.DialogContent>
            <DialogListItem.ItemContent>
                <ListItemText primary="Date Created" secondary={description}></ListItemText>
            </DialogListItem.ItemContent>
        </DialogListItem>
    );
};

export default DateCreatedCheckItem;
