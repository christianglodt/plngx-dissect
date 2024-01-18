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
    const pxToPtH = (px: number) => px / props.pageClientRectDimensions[0] * props.pageWidth;
    const pxToPtV = (px: number) => px / props.pageClientRectDimensions[1] * props.pageHeight;

    const [widthDuringResize, setWidthDuringResize] = useState<number|null>(null);
    const [heightDuringResize, setHeightDuringResize] = useState<number|null>(null);
    const initialWidth = props.region.x2 - props.region.x;
    const initialHeight = props.region.y2 - props.region.y;
    const width = widthDuringResize !== null ? widthDuringResize : initialWidth;
    const height = heightDuringResize !== null ? heightDuringResize : initialHeight;

    const style: React.CSSProperties = {
        top: `${ptToPercentV(props.region.y)}%`,
        left: `${ptToPercentH(props.region.x)}%`,
        width: `${ptToPercentH(width)}%`,
        height: `${ptToPercentV(height)}%`,
    };

    const [dragStart, setDragStart] = useState<Array<number>>([0, 0]);

    const onMoveDragStart = (event: DragEvent<HTMLDivElement>) => {
        setDragStart([event.pageX, event.pageY]);
        event.dataTransfer.setData('text/plain', 'dummy data'); // required to prevent "drag aborted" animation

    };

    const onMoveDragEnd = (event: DragEvent<HTMLDivElement>) => {
        const dragXPx = (event.pageX - dragStart[0]);
        const dragYPx = (event.pageY - dragStart[1]);
        const dragXPt = pxToPtH(dragXPx);
        const dragYPt = pxToPtV(dragYPx);

        props.onChange(produce(props.region, draft => {
            draft.x = Math.round(draft.x + dragXPt);
            draft.y = Math.round(draft.y + dragYPt);
            draft.x2 = Math.round(draft.x2 + dragXPt);
            draft.y2 = Math.round(draft.y2 + dragYPt);
        }));
    };

    const onResizeDragStart = (event: DragEvent<HTMLDivElement>) => {
        setDragStart([event.pageX, event.pageY]);
        event.dataTransfer.setData('text/plain', 'dummy data'); // required to prevent "drag aborted" animation
        event.stopPropagation();
    };

    const onResizeDragEnd = (event: DragEvent<HTMLDivElement>) => {
        event.stopPropagation();
        const dX = pxToPtH(event.pageX - dragStart[0]);
        const dY = pxToPtV(event.pageY - dragStart[1]);
        props.onChange(produce(props.region, draft => {
            draft.x2 = Math.round(draft.x2 + dX);
            draft.y2 = Math.round(draft.y2 + dY);
        }));
        setWidthDuringResize(null);
        setHeightDuringResize(null);
    };
    
    const onResizeDrag = (event: DragEvent<HTMLDivElement>) => {
        event.stopPropagation();
        const dX = pxToPtH(event.pageX - dragStart[0]);
        const dY = pxToPtV(event.pageY - dragStart[1]);
        setWidthDuringResize(initialWidth + dX);
        setHeightDuringResize(initialHeight + dY);
    };

    return (
        <div className="RegionBox" style={style} draggable="true" onDragStart={onMoveDragStart} onDragEnd={onMoveDragEnd}>
            {props.text}
            <div className="ResizeHandle" draggable="true" onDragStart={onResizeDragStart} onDragEnd={onResizeDragEnd} onDrag={onResizeDrag}/>
        </div>
    );
}

export default RegionBox;
