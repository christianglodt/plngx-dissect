import { Chip, CircularProgress, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Pattern } from "./types";
import ListCard from "./utils/ListCard";
import { usePatternMatches } from "./hooks";
import { Error } from "@mui/icons-material";
import { useSearchParams } from "react-router-dom";
import { Article } from "@mui/icons-material";

type MatchingDocsCardProps = {
    pattern: Pattern;
}

const MatchingDocsCard = (props: MatchingDocsCardProps) => {

    const { pattern } = props;

    const { data: matches, isLoading, error } = usePatternMatches(pattern);

    const [searchParams, setSearchParams] = useSearchParams();

    const onDocumentClicked = (id: number) => {
        const p = new URLSearchParams();
        p.set('document', id.toString());
        setSearchParams(p);
    }

    return (
        <ListCard title={<span>Matching&nbsp;Documents</span>} headerWidget={isLoading ? <CircularProgress/> : ''}>
            { matches && !error && matches.map((match) =>
            <ListItemButton key={match.id} selected={searchParams.get('document') == match.id.toString()} onClick={() => onDocumentClicked(match.id)} alignItems="flex-start">
                <ListItemIcon><Article/></ListItemIcon>
                <ListItemText primary={match.title} secondary={`${match.document_type}\n${match.correspondent}\n${new Date(match.datetime_created).toLocaleDateString()}`} sx={{ whiteSpace: 'pre' }}/>
            </ListItemButton>
            )}
            { error &&
            <Chip label={error.toString()} color="error" icon={<Error/>}/>
            }
        </ListCard>
    );
}

export default MatchingDocsCard;
