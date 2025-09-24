import { FormControl, InputLabel, ListItemText, MenuItem, Select, Stack, TextField } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import { RegionCheck } from "../types";
import DialogListItem from "../utils/DialogListItem";
import { CheckItemPropsType } from "./types";
import CheckResultIcon from "../utils/CheckResultIcon";
import RegionPageSelector from "../utils/RegionPageSelector";

const RegionRegexCheckItem = (props: CheckItemPropsType<RegionCheck>) => {

    const [x, setX] = useState(props.check.x);
    const [y, setY] = useState(props.check.y);
    const [x2, setX2] = useState(props.check.x2);
    const [y2, setY2] = useState(props.check.y2);
    const [page, setPage] = useState(props.check.page);
    const [kind, setKind] = useState(props.check.kind);
    const [regexExpr, setRegexExpr] = useState(props.check.regex_expr);
    const [simpleExpr, setSimpleExpr] = useState(props.check.simple_expr);

    const onChangeCanceled = () => {
        setX(props.check.x);
        setY(props.check.y);
        setX2(props.check.x2);
        setY2(props.check.y2);
        setPage(props.check.page);
        setKind(props.check.kind);
        setRegexExpr(props.check.regex_expr);
        setSimpleExpr(props.check.simple_expr);
    };

    const onChangeConfirmed = () => {
        props.onChange(produce(props.check, draft => {
            draft.x = x;
            draft.y = y;
            draft.x2 = x2;
            draft.y2 = y2;
            draft.page = page;
            draft.kind = kind;
            draft.regex_expr = regexExpr;
            draft.simple_expr = simpleExpr;
        }));
    };

    const kind_desc = props.check.kind === 'simple' ? 'simple expression' : 'regular expression';
    const expr = props.check.kind === 'simple' ? props.check.simple_expr : props.check.regex_expr;

    // TODO Text match preview using RegexPreview component
    // TODO Reuse components from RegionListItem
    return (
        <DialogListItem dialogTitle="Check Region Text" onChangeConfirmed={onChangeConfirmed} onChangeCanceled={onChangeCanceled} onDelete={props.onDelete}>
            <DialogListItem.DialogContent>
                <Stack gap={2}>
                    <Stack direction="row" gap={2}>
                        <TextField size="small" label="X" type="number" value={x} onChange={(event) => setX(Number(event.target.value))}></TextField>
                        <TextField size="small" label="Y" type="number" value={y} onChange={(event) => setY(Number(event.target.value))}></TextField>
                        <TextField size="small" label="X2" type="number" value={x2} onChange={(event) => setX2(Number(event.target.value))}></TextField>
                        <TextField size="small" label="Y2" type="number" value={y2} onChange={(event) => setY2(Number(event.target.value))}></TextField>
                    </Stack>
                    <FormControl size="small">
                        <InputLabel id="kind-select-label">Kind</InputLabel>
                        <Select id="kind-select" labelId="kind-select-label" label="Kind" value={kind} onChange={event => setKind(event.target.value === 'simple' ? 'simple' : 'regex')}>
                            <MenuItem value="simple">Simple</MenuItem>
                            <MenuItem value="regex">RegEx</MenuItem>
                        </Select>
                    </FormControl>
                    <RegionPageSelector value={page} onChange={setPage}/>
                    { kind === 'simple' &&
                    <TextField label="Simple Expression" value={simpleExpr} onChange={(event) => setSimpleExpr(event.target.value)} error={props.result?.error != null} helperText={props.result?.error}></TextField>
                    }
                    { kind === 'regex' &&
                    <TextField label="Regular Expression" value={regexExpr} onChange={(event) => setRegexExpr(event.target.value)} error={props.result?.error != null} helperText={props.result?.error}></TextField>
                    }
                </Stack>
            </DialogListItem.DialogContent>
            <DialogListItem.ItemContent icon={<CheckResultIcon result={props.result}/>}>
                <ListItemText sx={{ whiteSpace: 'pre-wrap' }} primary="Region Text" secondary={`Must match ${kind_desc} "${expr}"\nin region [${props.check.x}, ${props.check.y}, ${props.check.x2}, ${props.check.y2}]`}></ListItemText>
            </DialogListItem.ItemContent>
        </DialogListItem>
    );
};

export default RegionRegexCheckItem;
