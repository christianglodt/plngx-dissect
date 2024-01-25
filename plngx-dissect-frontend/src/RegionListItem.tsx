import { Chip, ListItemText, Stack, TextField, Tooltip } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import DialogListItem from "./utils/DialogListItem";
import { RegionRegex, RegionResult } from "./types";
import { ArrowRightAlt, Error, MyLocation, Search } from "@mui/icons-material";
import RegexPreview, { pythonRegexToJsRegex } from "./utils/RegexPreview";

type RegionListItemPropsType = {
    nr: number;
    region: RegionRegex;
    result: RegionResult | null | undefined;
    onChange: (newRegion: RegionRegex) => void;
    onDelete: () => void;
}

const RegionListItem = (props: RegionListItemPropsType) => {

    const [x, setX] = useState(props.region.x);
    const [y, setY] = useState(props.region.y);
    const [x2, setX2] = useState(props.region.x2);
    const [y2, setY2] = useState(props.region.y2);
    const [regex, setRegex] = useState(props.region.regex);

    const onChangeConfirmed = () => {
        props.onChange(produce(props.region, draft => {
            draft.x = x;
            draft.y = y;
            draft.x2 = x2;
            draft.y2 = y2;
            draft.regex = regex;
        }));
    }

    const primary = (
        <Stack direction="row" gap={1} alignItems="center" sx={{ marginBottom: '5px' }}>
            <span>Region {props.nr}</span>
            <Chip size="small" icon={<MyLocation/>} label={`${props.region.x}, ${props.region.y}, ${props.region.x2}, ${props.region.y2}`}/>
        </Stack>
    );

    const secondary = (
        <Stack gap={1} alignItems="flex-start">
            <Tooltip title={props.region.regex}><Chip icon={<Search/>} label={props.region.regex} color="primary"/></Tooltip>
            {!props.result &&
                <Stack direction="row">
                    <ArrowRightAlt/>
                    <Chip color="info" label="No matching document selected"/>
                </Stack>                
            }
            {props.result && Object.keys(props.result.group_values).map((key) =>
                <Stack direction="row" key={key}>
                    <ArrowRightAlt/>
                    <Tooltip title={props.result?.group_values[key]}><Chip color="success" label={key + ': ' + props.result?.group_values[key]}/></Tooltip>
                </Stack>                
            )}
            {props.result?.error &&
            <Chip label={props.result.error} icon={<Error/>} color="error"/>
            }
        </Stack>
    );

    let regexError = null;
    try {
        new RegExp(pythonRegexToJsRegex(regex), 'dgs');
    } catch (error) {
        regexError = String(error);
    }

    return (
        <DialogListItem dialogTitle="Region" onChangeConfirmed={onChangeConfirmed} onDelete={props.onDelete}>
            <DialogListItem.DialogContent>
                <Stack gap={2}>
                    <TextField label="Top Left X Coordinate" type="number" value={x} onChange={(event) => setX(Number(event.target.value))}></TextField>
                    <TextField label="Top Left Y Coordinate" type="number" value={y} onChange={(event) => setY(Number(event.target.value))}></TextField>
                    <TextField label="Bottom Right X Coordinate" type="number" value={x2} onChange={(event) => setX2(Number(event.target.value))}></TextField>
                    <TextField label="Bottom Right Y Coordinate" type="number" value={y2} onChange={(event) => setY2(Number(event.target.value))}></TextField>
                    <RegexPreview regex={regex} text={props.result?.text || ''}/>
                    <TextField label="Regular Expression" value={regex} multiline onChange={(event) => setRegex(event.target.value)} error={regexError != null} helperText={regexError}></TextField>
                </Stack>
            </DialogListItem.DialogContent>
            <DialogListItem.ItemContent>
                <ListItemText sx={{ whiteSpace: 'pre-wrap' }} primary={primary} secondary={secondary} secondaryTypographyProps={{ component: 'div' }}></ListItemText>
            </DialogListItem.ItemContent>
        </DialogListItem>
    );
};

export default RegionListItem;
