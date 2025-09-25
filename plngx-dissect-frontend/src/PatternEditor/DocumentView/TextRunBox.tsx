import React from "react";
import { TextRun } from "../../types";

import './TextRunBox.css';

type TextRunBoxPropsType = {
    textRun: TextRun;
    pageWidth: number;
    pageHeight: number;
}

const TextRunBox = (props: TextRunBoxPropsType) => {

    const { pageWidth, pageHeight } = props;

    const ptToPercentH = (pt: number) => (pt / pageWidth) * 100.0;
    const ptToPercentV = (pt: number) => (pt / pageHeight) * 100.0;

    const style: React.CSSProperties = {
        left: `${ptToPercentH(props.textRun.x)}%`,
        width: `${ptToPercentH(props.textRun.x2 - props.textRun.x)}%`,
        height: `${ptToPercentV(props.textRun.y2 - props.textRun.y)}%`,
        top: `${ptToPercentV(props.textRun.y)}%`,
    };

    return (
        <div style={style} className="TextRun">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox={`0 0 ${props.textRun.x2 - props.textRun.x} ${props.textRun.y2 - props.textRun.y}`} style={{ display: 'block' }} preserveAspectRatio="none">
                <text fontSize={props.textRun.y2 - props.textRun.y + 0.5} textLength={props.textRun.x2 - props.textRun.x + 0.5} lengthAdjust="spacing" x="0" y={props.textRun.y2 - props.textRun.y - 0.5}>
                    {props.textRun.text}
                </text>
            </svg>
        </div>
    );
}

export default TextRunBox;
