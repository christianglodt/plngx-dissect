import { Box, Stack, Typography } from "@mui/material";
import { useContext } from "react";
import { PATH_PREFIX } from "./hooks";
import { PatternEditorContext } from "./PatternEditorContext";
import { Region, RegionResult } from "./types";

type RegionListItemPageNavigatorPropsType = {
    pageResults: Array<RegionResult> | null; // 1 result per page
    region: Region;
}

const RegionListItemPageNavigator = (props: RegionListItemPageNavigatorPropsType) => {

    const { pageResults, region } = props;
    const { document, setPageNr } = useContext(PatternEditorContext);

    return (
        <Stack direction="row" spacing={1} justifyContent="center">
            { document?.pages.map((page, index) =>
            <Stack direction="column" spacing={0.5} alignItems="center">
                <Box key={index} sx={{ padding: '2pt', border: '2pt solid', borderRadius: '5pt', borderColor: 'rgba(255, 255, 255, 0.16);' }}>
                    <img src={`${PATH_PREFIX}/api/document/${document.id}/svg?page_nr=${index}`} width="50px"/>
                </Box>
                <Typography sx={{ fontSize: 'smaller' }}>{index + 1}</Typography>
            </Stack>
            )}
        </Stack>
    );
};

export default RegionListItemPageNavigator;
