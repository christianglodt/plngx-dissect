import { Chip, FormControl, InputLabel, ListItemText, MenuItem, Select, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { produce } from "immer";
import { useContext, useState } from "react";
import DialogListItem from "./utils/DialogListItem";
import { Region, RegionResult } from "./types";
import { Error } from "@mui/icons-material";
import RegexPreview from "./utils/RegexPreview";
import { useEvaluateExpression } from "./hooks";
import { PatternEditorContext } from "./PatternEditorContext";
import RegionPageSelector from "./utils/RegionPageSelector";

type RegionListItemPropsType = {
    nr: number;
    region: Region;
    result: Array<RegionResult> | null; // 1 result per page
    onChange: (newRegion: Region) => void;
    onDelete: () => void;
}

const RegionListItem = (props: RegionListItemPropsType) => {

    const { pageNr, patternEvaluationResult, document, setPageNr } = useContext(PatternEditorContext);

    const [x, setX] = useState(props.region.x);
    const [y, setY] = useState(props.region.y);
    const [x2, setX2] = useState(props.region.x2);
    const [y2, setY2] = useState(props.region.y2);
    const [page, setPage] = useState(props.region.page);
    const [kind, setKind] = useState(props.region.kind);
    const [regex_expr, setRegexExpr] = useState(props.region.regex_expr);
    const [simple_expr, setSimpleExpr] = useState(props.region.simple_expr);

    const selectedPageResult = pageNr !== null ? (props.result || []).at(pageNr) : null;

    const previewRegion: Region = { x, y, x2, y2, page, kind, simple_expr, regex_expr };
    const regionResult = useEvaluateExpression(previewRegion, selectedPageResult?.text || '');

    const onChangeCanceled = () => {
        setX(props.region.x);
        setY(props.region.y);
        setX2(props.region.x2);
        setY2(props.region.y2);
        setPage(props.region.page);
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
            draft.page = page;
            draft.regex_expr = regex_expr;
            draft.simple_expr = simple_expr;
            draft.kind = kind;
        }));
    };

    const getPageResultClasses = (pageResult: RegionResult, pageNr: number) => {
        const res = [];

        if (pageResult.error) {
            res.push('hasError');
        }
        if (pageResult.group_values !== null) {
            res.push('hasValue');
            if ((props.region.page === 0 && pageNr === 0) ||
                (document !== null && props.region.page === -1 && pageNr === document.pages.length - 1) ||
                (typeof props.region.page === 'number' && props.region.page === pageNr)
            ) {
                res.push('isRetainedValue');
            }

            const thisRegionPageResults = patternEvaluationResult!.regions[props.nr - 1];
            if (props.region.page === 'first_match') {
                const firstMatchingIndex = thisRegionPageResults.findIndex(r => r.group_values !== null);
                if (pageNr == firstMatchingIndex) {
                    res.push('isRetainedValue');
                }
            }
            if (props.region.page === 'last_match') {
                const lastMatchingIndex = thisRegionPageResults.findLastIndex(r => r.group_values !== null);
                if (pageNr == lastMatchingIndex) {
                    res.push('isRetainedValue');
                }
            }
        }

        return res.join(' ');
    };

    const onPageResultBubbleClicked = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, pageNr: number) => {
        event.stopPropagation();
        setPageNr(pageNr);
    };

    const primary = (
        <Stack direction="row" gap={1} alignItems="center" sx={{ marginBottom: '5px' }}>
            <Typography sx={{ width: '100%' }}>Region {props.nr}</Typography>
            <Stack direction="row" gap={0.5}>
                { patternEvaluationResult && patternEvaluationResult.regions[props.nr - 1].map((pageResult, pageNr) => 
                    <div key={pageNr} className={`pageResultBubble ${getPageResultClasses(pageResult, pageNr)}`} onClick={(event) => onPageResultBubbleClicked(event, pageNr)}/>
                ) }
            </Stack>
        </Stack>
    );

    const secondary = (
        <Stack gap={1} alignItems="flex-start">
            {!props.result &&
                <Stack direction="column">
                    <Chip color="info" label="No matching document selected"/>
                </Stack>                
            }
            {props.result && Object.keys(selectedPageResult?.group_values || {}).map((key) =>
                <Stack direction="column" key={key}>
                    <Tooltip title={(selectedPageResult?.group_values || {})[key]}>
                        <Chip color="success" label={key + ': ' + (selectedPageResult?.group_values || {})[key]}/>
                    </Tooltip>
                </Stack>                
            )}
            {selectedPageResult?.error &&
            <Chip label={selectedPageResult.error} icon={<Error/>} color="error"/>
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
                    <RegionPageSelector value={page} onChange={setPage}/>
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
