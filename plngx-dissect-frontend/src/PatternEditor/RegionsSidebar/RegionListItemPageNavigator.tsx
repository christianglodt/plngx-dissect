import { Box, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useContext } from "react";
import { PATH_PREFIX } from "../../hooks";
import { PatternEditorContext } from "../PatternEditorContext";
import { Region, RegionResult } from "../../types";

type RegionListItemPageNavigatorPropsType = {
    pageResults: Array<RegionResult> | null; // 1 result per page
    region: Region;
}

const BASE_BOX_STYLE = { display: 'block', padding: '3pt', border: '2pt solid', borderRadius: '5pt', borderColor: 'rgba(255, 255, 255, 0.16)', opacity: 1 };

const getBoxStyle = (pageResult: RegionResult) => {
    const res = Object.assign({}, BASE_BOX_STYLE);
    if (pageResult.is_retained) {                       // Final retained value
        res.borderColor = '#66bb6a';
    } else if (pageResult.text === '') {                // No text on page in region
        res.borderColor = 'transparent';
        res.opacity = 0.1;
    } else if (pageResult.group_values !== null) {      // Has value, but not retained
        res.borderColor = 'rgba(255, 255, 255, 1)';
    } else if (pageResult.text !== '') {                // Has text, but no values produced
        res.borderColor = 'rgba(255, 255, 255, 0.16)';
    }
    return res;
};

const getTooltipText = (pageResult: RegionResult) => {
    if (pageResult.is_retained) {                       // Final retained value
        return 'Expression values from this page are retained';
    } else if (pageResult.text === '') {                // No text on page in region
        return 'Page has no text in this region';
    } else if (pageResult.group_values !== null) {      // Has value, but not retained
        return 'Expression produces values that are not retained';
    } else if (pageResult.text !== '') {                // Has text, but no values produced
        return 'Expression produces no values fron this page';
    }
    return '';
};

const RegionListItemPageNavigator = (props: RegionListItemPageNavigatorPropsType) => {

    const { pageResults } = props;
    const { document, pageNr, setPageNr } = useContext(PatternEditorContext);

    const onTabClicked = (_event: React.SyntheticEvent, newValue: number) => {
        setPageNr(newValue);
    };

    return (
        <Stack direction="row" justifyContent="center">
            <Tabs value={pageNr} onChange={onTabClicked}>
                { pageResults?.map((pageResult, index) =>
                    <Tab key={index} label={
                        <Stack key={index} direction="column" spacing={0.5} alignItems="center">
                            <Box sx={getBoxStyle(pageResult)}>
                                <img src={`${PATH_PREFIX}/api/document/${document!.id}/svg?page_nr=${index}`} width="50px" style={{ backgroundColor: 'white', display: 'block' }}/>
                            </Box>
                            <Typography sx={{ fontSize: 'smaller' }}>{index + 1}</Typography>
                        </Stack>
                    } value={index} title={getTooltipText(pageResult)}/>
                )}
            </Tabs>
        </Stack>
    );
};

export default RegionListItemPageNavigator;
