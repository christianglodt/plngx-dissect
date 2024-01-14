import { FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Stack } from "@mui/material";

import Select, { SelectChangeEvent } from '@mui/material/Select';
import { TagCheck } from "../types";
import { useState } from "react";
import CheckItemDialog from "../utils/CheckItemDialog";
import CheckItem, { CheckItemDialogPropsType, CheckItemPropsType } from "../utils/CheckItem";
import { useTagList } from "../hooks";


const TagCheckDialog = (props: CheckItemDialogPropsType<TagCheck>) => {

    const [includes, setIncludes] = useState(props.check.includes);
    const [excludes, setExcludes] = useState(props.check.excludes);

    const onChangeDraft = (draft: TagCheck) => {
        draft.includes = includes;
        draft.excludes = excludes;
    }

    const onChangeIncludes = (event: SelectChangeEvent<string[]>) => {
        setIncludes(event.target.value as string[]);
    };

    const onChangeExcludes = (event: SelectChangeEvent<string[]>) => {
        setExcludes(event.target.value as string[]);
    };

    const {data: tagList } = useTagList();

    return (
        <CheckItemDialog<TagCheck> title="Check Tags" onChangeDraft={onChangeDraft} {...props}>
            <Stack gap={2}>
                <FormControl>
                    <InputLabel id="includes-label">Must Include</InputLabel>
                    <Select labelId="includes-label" value={includes} multiple onChange={onChangeIncludes} input={<OutlinedInput label="Must Include" />}>
                        {tagList?.map(t =>
                            <MenuItem key={t.name} value={t.name}>{t.name}</MenuItem>
                        )}
                    </Select>
                </FormControl>
                <FormControl>
                    <InputLabel id="excludes-label">Must Exclude</InputLabel>
                    <Select labelId="excludes-label" value={excludes} multiple onChange={onChangeExcludes} input={<OutlinedInput label="Must Exclude" />}>
                        {tagList?.map(t =>
                            <MenuItem key={t.name} value={t.name}>{t.name}</MenuItem>
                        )}
                    </Select>
                </FormControl>
            </Stack>
        </CheckItemDialog>
    );
}

const TagCheckItem = (props: CheckItemPropsType<TagCheck>) => {

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
        <CheckItem<TagCheck> dialogComponent={TagCheckDialog} {...props}>
            <ListItemText primary="Tag Match" secondary={secondaryText}></ListItemText>
        </CheckItem>
    );
};

export default TagCheckItem;
