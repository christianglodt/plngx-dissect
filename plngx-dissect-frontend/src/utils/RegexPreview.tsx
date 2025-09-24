import { Box, Typography } from "@mui/material";
import React from "react";
import { RegionResult } from "../types";


type RegexPreviewPropsType = {
    regionResult: RegionResult;
}

function* pairWiseIteration<T>(a: Array<T>) {
    if (a.length == 0) {
        return;
    }

    if (a.length == 1) {{
        yield [a[0], null];
        return;
    }}

    let previous = a[0];
    for (const t of a.slice(1)) {
        yield [previous, t];
        previous = t;
    }
    yield [previous, null];
}

const RegexPreview = (props: RegexPreviewPropsType) => {

    const { regionResult } = props;

    const typographyProps = {
        component: 'span',
        // sx: {
        //     fontSize: 'x-small'
        // }
    };

    const nodes: Array<React.ReactNode> = [];

    if (!regionResult?.group_positions || !regionResult?.group_values || regionResult.group_positions.length === 0 || Object.keys(regionResult.group_values).length === 0) {
        if (regionResult.text !== '') {
            nodes.push(<Typography key="allText" {...typographyProps}>{regionResult.text}</Typography>);
        }
    } else {
        const positionsWithNames = [];
        for (let i = 0; i < Object.keys(regionResult.group_values).length; i++) {
            positionsWithNames.push({
                name: Object.keys(regionResult.group_values)[i],
                startIndex: regionResult.group_positions[i][0],
                endIndex: regionResult.group_positions[i][1],
            });
        }

        const firstStart = positionsWithNames[0].startIndex;
        const lastEnd = positionsWithNames.slice(-1)[0].endIndex;

        const head = regionResult.text.slice(0, firstStart);
        const tail = regionResult.text.slice(lastEnd);

        if (head.length > 0) {
            nodes.push(<Typography key="head" {...typographyProps}>{head}</Typography>);
        }

        for (const [h, nextH] of pairWiseIteration(positionsWithNames)) {
            if (h) {
                const text = regionResult.text.slice(h.startIndex, h.endIndex);
                if (text.length > 0) {
                    nodes.push(<Typography key={`${h.startIndex}-${h.endIndex}`} title={h.name} style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', borderBottom: '2px solid white' }} {...typographyProps}>{text}</Typography>);
                }

                if (nextH) {
                    // Add text between highlights
                    const textBetween = regionResult.text.slice(h.endIndex, nextH.startIndex);
                    if (textBetween.length > 0) {
                        nodes.push(<Typography key={`${h.endIndex}-${nextH.startIndex}`} {...typographyProps}>{textBetween}</Typography>);
                    }
                }
            }
        }

        if (tail.length > 0) {
            nodes.push(<Typography key="tail" {...typographyProps}>{tail}</Typography>);
        }
    }

    return (
        <Box sx={{ whiteSpace: 'pre', overflow: 'auto', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.23)', padding: '8.5px 14px', maxHeight: '30rem', minHeight: '23px', position: 'relative' }}>
            {nodes}
            { regionResult.text === '' &&
            <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)', fontStyle: 'italic' }}>No text found in this region on the selected page.</div>
            }
        </Box>
    );
};

export default RegexPreview;
