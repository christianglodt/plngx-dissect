import { CheckCircle, Error } from "@mui/icons-material";
import { CheckResult } from "../types";
import { Tooltip } from "@mui/material";

type CheckResultIconPropsType = {
    result?: CheckResult | null;
}

const CheckResultIcon = (props: CheckResultIconPropsType) => {
    if (props.result?.passed) return <CheckCircle color="success"/>;
    if (props.result?.error) return <Tooltip title={props.result.error}><Error color="error"/></Tooltip>;
    return '';
}

export default CheckResultIcon;
