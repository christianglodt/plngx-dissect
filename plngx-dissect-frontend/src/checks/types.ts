import React from "react";

export type CheckItemPropsType<CheckType> = {
    check: CheckType;
    onChange: (newCheck: CheckType) => void;
    onDelete: () => void;
}

export type RecursiveCheckItemPropsType<CheckType> = CheckItemPropsType<CheckType> & {
    factory: (props: any) => React.JSX.Element;
}
