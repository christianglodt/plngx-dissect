import { useState } from 'react';
import { Region } from '../../types';
import './RegionBox.css';
import { produce } from 'immer';
import { useDrag } from '@use-gesture/react';

type RegionBoxPropsType<RegionType> = {
    label: string;
    region: RegionType;
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

    const [moveX, setMoveX] = useState(0);
    const [moveY, setMoveY] = useState(0);
    const [resizeX, setResizeX] = useState(0);
    const [resizeY, setResizeY] = useState(0);

    const width = props.region.x2 - props.region.x;
    const height = props.region.y2 - props.region.y;

    const style: React.CSSProperties = {
        left: `${ptToPercentH(props.region.x)}%`,
        top: `${ptToPercentV(props.region.y)}%`,
        width: `calc(${ptToPercentH(width)}% + ${resizeX}px)`,
        height: `calc(${ptToPercentV(height)}% + ${resizeY}px)`,
        transform: `translate(${moveX}px, ${moveY}px)`,
        touchAction: 'none'
    };

    const dragBind = useDrag((state) => {
        if (state.type == 'pointermove') {
            setMoveX(state.movement[0]);
            setMoveY(state.movement[1]);
        }
        if (state.type == 'pointerup') {
            const mx = moveX;
            const my = moveY;
            setMoveX(0);
            setMoveY(0);
            props.onChange(produce(props.region, draft => {
                draft.x = Math.round(draft.x + pxToPtH(mx));
                draft.y = Math.round(draft.y + pxToPtV(my));
                draft.x2 = Math.round(draft.x2 + pxToPtH(mx));
                draft.y2 = Math.round(draft.y2 + pxToPtV(my));
            }));
        }
    }, { preventDefault: true });

    const resizeBind = useDrag((state) => {
        state.event.stopPropagation(); // Necessary to ensure move handler of parent element is not invoked
        if (state.type == 'pointermove') {
            setResizeX(state.movement[0]);
            setResizeY(state.movement[1]);
        }
        if (state.type == 'pointerup') {
            const rx = resizeX;
            const ry= resizeY;
            setResizeX(0);
            setResizeY(0);
            props.onChange(produce(props.region, draft => {
                draft.x2 = Math.round(draft.x2 + pxToPtH(rx));
                draft.y2 = Math.round(draft.y2 + pxToPtV(ry));
            }));
        }
    }, { preventDefault: true });

    return (
        <div className="RegionBox" style={style} {...dragBind()}>
            <div className="Label">{props.label}</div>
            <div className="ResizeHandle" {...resizeBind()} style={{ touchAction: 'none' }}/>
        </div>
    );
}

export default RegionBox;
