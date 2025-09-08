import { Box, Typography } from "@mui/material";
import React from "react";


export const pythonRegexToJsRegex = (r: string): string => {
    // Only for named group handling
    return r.replace(/\(\?P</g, '(?<');
}


type RegexPreviewPropsType = {
    text: string;
    regex: string;
    ignoreCase: boolean;
}

type Highlight = {
    startIndex: number;
    endIndex: number;
    group: string;
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

    const jsRegex = pythonRegexToJsRegex(props.regex);

    const highlights: Array<Highlight> = [];
    try {
        const regexp = new RegExp(jsRegex, 'mdgsu' + (props.ignoreCase ? 'i' : '')); // TODO
        const regexpResult = props.text.matchAll(regexp);
        for (const r of regexpResult) {
            if (r.groups) {
                for (const groupName of Object.keys(r.groups)) {
                    const [groupStart, groupEnd] = r.indices!.groups![groupName];

                    highlights.push({ group: groupName, startIndex: groupStart, endIndex: groupEnd });
                }
            }
        }

    } catch (e) {
        /* empty */
        console.log(e);
    }

    const typographyProps = {
        component: 'span',
        sx: {
            fontSize: 'x-small'
        }
    };

    const nodes: Array<React.ReactNode> = [];
    if (highlights.length == 0) {
        nodes.push(<Typography key="allText" {...typographyProps}>{props.text}</Typography>);
    } else {
        const firstStart = highlights[0].startIndex;
        const lastEnd = highlights.slice(-1)[0].endIndex;

        const head = props.text.slice(0, firstStart);
        const tail = props.text.slice(lastEnd);

        if (head.length > 0) {
            nodes.push(<Typography key="head" {...typographyProps}>{head}</Typography>);
        }

        for (const [h, nextH] of pairWiseIteration(highlights)) {
            if (h) {
                const text = props.text.slice(h.startIndex, h.endIndex);
                if (text.length > 0) {
                    nodes.push(<Typography key={`${h.startIndex}-${h.endIndex}`} title={h.group} style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', borderBottom: '2px solid white' }} {...typographyProps}>{text}</Typography>);
                }

                if (nextH) {
                    // Add text between highlights
                    const textBetween = props.text.slice(h.endIndex, nextH.startIndex);
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
        <Box sx={{ whiteSpace: 'pre', overflow: 'auto', fontSize: 'x-small', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.23)', padding: '16.5px 14px', maxHeight: '30rem' }}>
            {nodes}
        </Box>
    );
};

export default RegexPreview;
