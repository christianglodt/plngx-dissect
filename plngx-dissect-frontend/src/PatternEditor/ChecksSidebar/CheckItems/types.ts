import React from "react";
import { CheckResult } from "../../../types";

export type CheckItemPropsType<CheckType> = {
    check: CheckType;
    result?: CheckResult | null;
    onChange: (newCheck: CheckType) => void;
    onDelete: () => void;
}

export type RecursiveCheckItemPropsType<CheckType> = CheckItemPropsType<CheckType> & {
    factory: (props: any) => React.JSX.Element;
}
