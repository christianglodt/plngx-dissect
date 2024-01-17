import { MutableRefObject, PropsWithChildren, createContext, useContext } from "react";
import { createPortal } from "react-dom";


export const PortalBoxContext = createContext<MutableRefObject<HTMLElement|null>|null>(null);

const PortalBox = (props: PropsWithChildren) => {

    const domNodeRef = useContext(PortalBoxContext);

    if (domNodeRef === null || domNodeRef.current === null) return <></>;

    return createPortal(props.children, domNodeRef.current);

}

export default PortalBox;
