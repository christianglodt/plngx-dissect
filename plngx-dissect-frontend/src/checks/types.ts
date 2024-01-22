import React from "react";

export type CheckItemPropsType<CheckType> = {
    check: CheckType;
    matches?: boolean | null;
    onChange: (newCheck: CheckType) => void;
    onDelete: () => void;
}

export type RecursiveCheckItemPropsType<CheckType> = CheckItemPropsType<CheckType> & {
    factory: (props: any) => React.JSX.Element;
}
