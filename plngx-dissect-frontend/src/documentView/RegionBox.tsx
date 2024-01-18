import { DragEvent, useState } from 'react';
import { Region } from '../types';
import './RegionBox.css';
import { produce } from 'immer';

type RegionBoxPropsType<RegionType> = {
    region: RegionType;
    text: string;
    pageWidth: number;
    pageHeight: number;
    pageClientRectDimensions: Array<number>;
    onChange: (newRegion: RegionType) => void;
}

const RegionBox = <RegionType extends Region,>(props: RegionBoxPropsType<RegionType>) => {

    const ptToPercentH = (pt: number) => (pt / props.pageWidth) * 100.0;
    const ptToPercentV = (pt: number) => (pt / props.pageHeight) * 100.0;

    const style: React.CSSProperties = {
        left: `${ptToPercentH(props.region.x)}%`,
        width: `${ptToPercentH(props.region.x2 - props.region.x)}%`,
        height: `${ptToPercentV(props.region.y2 - props.region.y)}%`,
        top: `${ptToPercentV(props.region.y)}%`,
    };

    const [dragStart, setDragStart] = useState<Array<number>>([0, 0]);

    const onDragStart = (event: DragEvent<HTMLDivElement>) => {
        setDragStart([event.pageX, event.pageY]);
        event.dataTransfer.setData('text/plain', 'dummy data'); // required to prevent "drag aborted" animation

    };

    const onDragEnd = (event: DragEvent<HTMLDivElement>) => {
        const dragXPx = (event.pageX - dragStart[0]);
        const dragYPx = (event.pageY - dragStart[1]);

        const dragXPxRatio = dragXPx / props.pageClientRectDimensions[0];
        const dragYPxRatio = dragYPx / props.pageClientRectDimensions[1];

        const dragXPt = dragXPxRatio * props.pageWidth;
        const dragYPt = dragYPxRatio * props.pageHeight;

        props.onChange(produce(props.region, draft => {
            draft.x += dragXPt;
            draft.y += dragYPt;
            draft.x2 += dragXPt;
            draft.y2 += dragYPt;
        }));
    };

    return (
        <div className="RegionBox" style={style} draggable="true" onDragStart={onDragStart} onDragEnd={onDragEnd}>
            {props.text}
        </div>
    );
}

export default RegionBox;
