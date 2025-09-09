import { Chip, FormControl, InputLabel, ListItemText, MenuItem, Select, Stack, TextField, Tooltip } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import DialogListItem from "./utils/DialogListItem";
import { Region, RegionResult } from "./types";
import { ArrowRightAlt, Error, MyLocation, Search } from "@mui/icons-material";
import RegexPreview from "./utils/RegexPreview";
import { useEvaluateExpression } from "./hooks";

type RegionListItemPropsType = {
    nr: number;
    region: Region;
    result: RegionResult | null | undefined;
    onChange: (newRegion: Region) => void;
    onDelete: () => void;
}

const RegionListItem = (props: RegionListItemPropsType) => {

    const [x, setX] = useState(props.region.x);
    const [y, setY] = useState(props.region.y);
    const [x2, setX2] = useState(props.region.x2);
    const [y2, setY2] = useState(props.region.y2);
    const [kind, setKind] = useState(props.region.kind);
    const [regex_expr, setRegexExpr] = useState(props.region.regex_expr);
    const [simple_expr, setSimpleExpr] = useState(props.region.simple_expr);

    const previewRegion: Region = { x, y, x2, y2, kind, simple_expr, regex_expr };
    const regionResult = useEvaluateExpression(previewRegion, props.result?.text || '');

    const onChangeCanceled = () => {
        setX(props.region.x);
        setY(props.region.y);
        setX2(props.region.x2);
        setY2(props.region.y2);
        setKind(props.region.kind);
        setRegexExpr(props.region.regex_expr);
        setSimpleExpr(props.region.simple_expr);
    };

    const onChangeConfirmed = () => {
        props.onChange(produce(props.region, draft => {
            draft.x = x;
            draft.y = y;
            draft.x2 = x2;
            draft.y2 = y2;
            draft.regex_expr = regex_expr;
            draft.simple_expr = simple_expr;
            draft.kind = kind;
        }));
    };

    const primary = (
        <Stack direction="row" gap={1} alignItems="center" sx={{ marginBottom: '5px' }}>
            <span>Region {props.nr}</span>
        </Stack>
    );

    const propsExpr = props.region.kind === 'simple' ? props.region.simple_expr : props.region.regex_expr;

    const secondary = (
        <Stack gap={1} alignItems="flex-start">
            <Chip icon={<MyLocation/>} label={`${props.region.x}, ${props.region.y}, ${props.region.x2}, ${props.region.y2}`} color="primary"/>
            <Tooltip title={propsExpr}><Chip icon={<Search/>} label={propsExpr} color="primary"/></Tooltip>
            {!props.result &&
                <Stack direction="row">
                    <ArrowRightAlt/>
                    <Chip color="info" label="No matching document selected"/>
                </Stack>                
            }
            {props.result && Object.keys(props.result.group_values || {}).map((key) =>
                <Stack direction="row" key={key}>
                    <ArrowRightAlt/>
                    <Tooltip title={(props.result?.group_values || {})[key]}><Chip color="success" label={key + ': ' + (props.result?.group_values || {})[key]}/></Tooltip>
                </Stack>                
            )}
            {props.result?.error &&
            <Chip label={props.result.error} icon={<Error/>} color="error"/>
            }
        </Stack>
    );

    const exprError = regionResult?.error;

    const kindSelector = (
        <FormControl size="small">
            <InputLabel id="kind-select-label">Kind</InputLabel>
            <Select id="kind-select" labelId="kind-select-label" label="Kind" value={kind} onChange={event => setKind(event.target.value === 'simple' ? 'simple' : 'regex')}>
                <MenuItem value="simple">Simple</MenuItem>
                <MenuItem value="regex">RegEx</MenuItem>
            </Select>
        </FormControl>
    );

    return (
        <DialogListItem dialogTitle="Region" onChangeConfirmed={onChangeConfirmed} onChangeCanceled={onChangeCanceled} onDelete={props.onDelete} dialogExtraTitle={kindSelector}>
            <DialogListItem.DialogContent>
                <Stack gap={2}>
                    <Stack direction="row" gap={2}>
                        <TextField size="small" label="X" type="number" value={x} onChange={(event) => setX(Number(event.target.value))}></TextField>
                        <TextField size="small" label="Y" type="number" value={y} onChange={(event) => setY(Number(event.target.value))}></TextField>
                        <TextField size="small" label="X2" type="number" value={x2} onChange={(event) => setX2(Number(event.target.value))}></TextField>
                        <TextField size="small" label="Y2" type="number" value={y2} onChange={(event) => setY2(Number(event.target.value))}></TextField>
                    </Stack>
                    { regionResult &&
                    <RegexPreview regionResult={regionResult}/>
                    }
                    { kind === 'simple' &&
                    <TextField label="Simple Expression" value={simple_expr || ''} multiline onChange={(event) => setSimpleExpr(event.target.value)} error={exprError != null} helperText={exprError || <div style={{ height: '2lh' }}></div>}></TextField>
                    }
                    { kind === 'regex' &&
                    <TextField label="Regular Expression" value={regex_expr || ''} multiline onChange={(event) => setRegexExpr(event.target.value)} error={exprError != null} helperText={exprError || <div style={{ height: '2lh' }}></div>}></TextField>
                    }
                </Stack>
            </DialogListItem.DialogContent>
            <DialogListItem.ItemContent>
                <ListItemText sx={{ whiteSpace: 'pre-wrap' }} primary={primary} secondary={secondary} secondaryTypographyProps={{ component: 'div' }}></ListItemText>
            </DialogListItem.ItemContent>
        </DialogListItem>
    );
};

export default RegionListItem;
