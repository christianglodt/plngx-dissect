import { CircularProgress } from "@mui/material";
import { Pattern } from "./types";
import ListCard from "./utils/ListCard";

type MatchingDocsCardProps = {
    pattern: Pattern;
}

const MatchingDocsCard = (props: MatchingDocsCardProps) => {

    const { pattern } = props;

    return (
        <ListCard title={<span>Matching&nbsp;Documents</span>} headerWidget={<CircularProgress/>}>
        </ListCard>
    );
}

export default MatchingDocsCard;
