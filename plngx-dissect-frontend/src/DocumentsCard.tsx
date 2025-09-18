import { Chip, CircularProgress, ListItemButton, ListItemIcon, ListItemText, ToggleButton, ToggleButtonGroup } from "@mui/material";
import ListCard from "./utils/ListCard";
import { usePatternMatches } from "./hooks";
import { CheckCircle, Error, Pending } from "@mui/icons-material";
import { useSearchParams } from "react-router-dom";
import { Article } from "@mui/icons-material";
import { useContext, useState } from "react";
import { PatternEditorContext } from "./PatternEditorContext";

const DocumentsCard = () => {

    const { pattern } = useContext(PatternEditorContext);

    const [showAllDocuments, setShowAllDocuments] = useState(false);

    const { data: matches, isLoading, error } = usePatternMatches(pattern, showAllDocuments);

    const [searchParams, setSearchParams] = useSearchParams();

    const onDocumentClicked = (id: number) => {
        const p = new URLSearchParams();
        p.set('document', id.toString());
        setSearchParams(p);
    }

    return (
        <ListCard title={<span>Matching&nbsp;Documents</span>} headerWidget={
            <>
                { isLoading ?
                    <CircularProgress/>
                : 
                    <ToggleButtonGroup value={showAllDocuments} exclusive size="small">
                        <ToggleButton value={false} title="Show only unprocessed (pending) documents" onClick={() => setShowAllDocuments(false)}>
                            <Pending/>
                        </ToggleButton>
                        <ToggleButton value={true} title="Show all documents" onClick={() => setShowAllDocuments(true)}>
                            <CheckCircle/>
                        </ToggleButton>
                    </ToggleButtonGroup>
                }
            </>
            }>
            { matches && !error && matches.map((match) =>
            <ListItemButton key={match.id} selected={searchParams.get('document') == match.id.toString()} onClick={() => onDocumentClicked(match.id)} alignItems="flex-start">
                <ListItemIcon><Article/></ListItemIcon>
                <ListItemText primary={match.title} secondary={`${match.document_type}\n${match.correspondent}\n${new Date(match.date_created).toLocaleDateString()}`} sx={{ whiteSpace: 'pre' }}/>
            </ListItemButton>
            )}
            { error &&
            <Chip label={error.toString()} color="error" icon={<Error/>}/>
            }
        </ListCard>
    );
}

export default DocumentsCard;
