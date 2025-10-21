import { Article, Error } from "@mui/icons-material";
import { Chip, CircularProgress, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useProcessingResults } from "../hooks";
import ListCard from "../utils/ListCard";
import { ProcessedDocument } from "../types";

const UnmatchedDocumentsCard = () => {

    const { data: results, isLoading, error } = useProcessingResults();

    const onDocumentClicked = (doc: ProcessedDocument) => {
        window.open(doc.paperless_url, "_blank");
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'stretch', height: '25%' }}>
            <ListCard title={<span>Unmatched</span>} headerWidget={isLoading ? <CircularProgress/> : ''}>
                { results && !error && results.unmatched.map((doc) =>
                <ListItemButton key={doc.id} onClick={() => onDocumentClicked(doc)} alignItems="flex-start">
                    <ListItemIcon><Article/></ListItemIcon>
                    <ListItemText primary={doc.title}/>
                </ListItemButton>
                )}
                { error &&
                <Chip label={error.toString()} color="error" icon={<Error/>}/>
                }
            </ListCard>
        </div>
    );
}

export default UnmatchedDocumentsCard;
