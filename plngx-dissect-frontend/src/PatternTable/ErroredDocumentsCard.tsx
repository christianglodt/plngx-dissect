import { Article, Error } from "@mui/icons-material";
import { Chip, CircularProgress, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useProcessingResults } from "../hooks";
import ListCard from "../utils/ListCard";
import { ProcessingError } from "../types";
import { useNavigate } from "react-router-dom";

const ErroredDocumentsCard = () => {

    const { data: results, isLoading, error } = useProcessingResults();
    const navigate = useNavigate();

    const onErrorClicked = (error: ProcessingError) => {
        navigate(`pattern/${error.pattern_name}?document=${error.document.id}`);
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'stretch', height: '25%' }}>
            <ListCard title={<span>Errors</span>} headerWidget={isLoading ? <CircularProgress/> : ''}>
                { results && !error && results.errors.map((error) =>
                <ListItemButton key={`${error.document.id}-${error.pattern_name}-${error.error}`} onClick={() => onErrorClicked(error)} alignItems="flex-start">
                    <ListItemIcon><Article/></ListItemIcon>
                    <ListItemText primary={error.document.title} secondary={<span style={{ whiteSpace: 'pre' }}>{error.error}</span>}/>
                </ListItemButton>
                )}
                { error &&
                <Chip label={error.toString()} color="error" icon={<Error/>}/>
                }
            </ListCard>
        </div>
    );
}

export default ErroredDocumentsCard;
