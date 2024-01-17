import { FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Stack } from "@mui/material";

import Select from '@mui/material/Select';
import { produce } from "immer";
import { useState } from "react";
import { useTagList } from "../hooks";
import { TagCheck } from "../types";
import DialogListItem from "../utils/DialogListItem";
import { CheckItemPropsType } from "./types";

const TagCheckItem = (props: CheckItemPropsType<TagCheck>) => {

    const [includes, setIncludes] = useState(props.check.includes);
    const [excludes, setExcludes] = useState(props.check.excludes);

    const {data: tagList } = useTagList();

    const onChangeConfirmed = () => {
        props.onChange(produce(props.check, draft => {
            draft.includes = includes;
            draft.excludes = excludes;
        }));
    }

    const included = props.check.includes.join(", ");
    const excluded = props.check.excludes.join(", ");

    const descriptionParts = [];
    if (included) {
        descriptionParts.push('include ' + included);
    }
    if (excluded) {
        descriptionParts.push('exclude ' + excluded);
    }

    const description = descriptionParts.join(' and ');
    const secondaryText = description ? `Must ${description}` : '(no condition set)';
    return (
        <DialogListItem dialogTitle="Check Document Tags" onChangeConfirmed={onChangeConfirmed} onDelete={props.onDelete}>
            <DialogListItem.DialogContent>
                <Stack gap={2}>
                    <FormControl>
                        <InputLabel id="includes-label">Must Include</InputLabel>
                        <Select labelId="includes-label" value={includes} multiple onChange={(event) => setIncludes(event.target.value as string[])} input={<OutlinedInput label="Must Include" />}>
                            {tagList?.map(t =>
                                <MenuItem key={t.name} value={t.name}>{t.name}</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                    <FormControl>
                        <InputLabel id="excludes-label">Must Exclude</InputLabel>
                        <Select labelId="excludes-label" value={excludes} multiple onChange={(event) => setExcludes(event.target.value as string[])} input={<OutlinedInput label="Must Exclude" />}>
                            {tagList?.map(t =>
                                <MenuItem key={t.name} value={t.name}>{t.name}</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                </Stack>
            </DialogListItem.DialogContent>
            <DialogListItem.ItemContent>
                <ListItemText primary="Tags" secondary={secondaryText}></ListItemText>
            </DialogListItem.ItemContent>
        </DialogListItem>
    );
};

export default TagCheckItem;
