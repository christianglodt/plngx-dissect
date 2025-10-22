import { Article, Error } from "@mui/icons-material";
import { Chip, CircularProgress, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useProcessingResults } from "../hooks";
import ListCard from "../utils/ListCard";

const MultiMatchedDocumentsCard = () => {

    const { data: results, isLoading, error } = useProcessingResults();

    const multipleDocIds = results ? Object.keys(results.matched_patterns).filter(doc_id => results.matched_patterns[doc_id]!.length > 1) : [];

    return (
        <div style={{ display: 'flex', justifyContent: 'stretch', height: '25%' }}>
            <ListCard title={<span>Multiple Matches ({multipleDocIds.length})</span>} headerWidget={isLoading ? <CircularProgress/> : ''}>
                { results && !error && multipleDocIds.map(doc_id =>
                <ListItemButton key={doc_id} alignItems="flex-start">
                    <ListItemIcon><Article/></ListItemIcon>
                    <ListItemText primary={results.matched_document_titles[doc_id]} secondary={
                        <>
                        { results.matched_patterns[doc_id]!.length > 1 && results.matched_patterns[doc_id]!.map(pattern =>
                        <span key={pattern} style={{ display: 'block' }}>
                            <a href={`pattern/${pattern}?document=${doc_id[0]}`}>{pattern}</a>
                        </span>
                        )}
                        </>
                    }/>
                </ListItemButton>
                )}
                { error &&
                <Chip label={error.toString()} color="error" icon={<Error/>}/>
                }
            </ListCard>
        </div>
    );
}

export default MultiMatchedDocumentsCard;
