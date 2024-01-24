import { CircularProgress, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Pattern } from "./types";
import ListCard from "./utils/ListCard";
import { usePatternMatches } from "./hooks";
import { useSearchParams } from "react-router-dom";
import { Article } from "@mui/icons-material";

type MatchingDocsCardProps = {
    pattern: Pattern;
}

const MatchingDocsCard = (props: MatchingDocsCardProps) => {

    const { pattern } = props;

    const { data: matches, isLoading } = usePatternMatches(pattern);

    const [searchParams, setSearchParams] = useSearchParams();

    const onDocumentClicked = (id: number) => {
        const p = new URLSearchParams();
        p.set('document', id.toString());
        setSearchParams(p);
    }

    return (
        <ListCard title={<span>Matching&nbsp;Documents</span>} headerWidget={isLoading ? <CircularProgress/> : ''}>
            { matches && matches.map((match) =>
            <ListItemButton key={match.id} selected={searchParams.get('document') == match.id.toString()} onClick={() => onDocumentClicked(match.id)}>
                <ListItemIcon><Article/></ListItemIcon>
                <ListItemText primary={match.title} secondary={`${match.date_created.toString()}`}/>
            </ListItemButton>
            )}
        </ListCard>
    );
}

export default MatchingDocsCard;
