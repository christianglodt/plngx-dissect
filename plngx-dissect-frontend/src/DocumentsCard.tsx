import { Chip, CircularProgress, ListItemButton, ListItemIcon, ListItemText, Tab, Tabs } from "@mui/material";
import ListCard from "./utils/ListCard";
import { usePatternMatches } from "./hooks";
import { Error } from "@mui/icons-material";
import { useSearchParams } from "react-router-dom";
import { Article } from "@mui/icons-material";
import { useContext, useState } from "react";
import { PatternEditorContext } from "./PatternEditorContext";

const DocumentsCard = () => {

    const { pattern } = useContext(PatternEditorContext);

    const [showAllDocuments, setShowAllDocuments] = useState<'all' | 'pending'>('all');

    const { data: matches, isLoading, error } = usePatternMatches(pattern, showAllDocuments === 'all');

    const [searchParams, setSearchParams] = useSearchParams();

    const onDocumentClicked = (id: number) => {
        const p = new URLSearchParams();
        p.set('document', id.toString());
        setSearchParams(p);
    }

    const onTabClicked = (_event: React.SyntheticEvent, newValue: string) => {
        setShowAllDocuments(newValue === 'all' ? 'all' : 'pending');
    };

    return (
        <ListCard title="Documents" headerWidget={
            <>
                { isLoading ?
                    <CircularProgress/>
                :
                    <Tabs value={showAllDocuments} onChange={onTabClicked}>
                        <Tab label="All" value="all"/>
                        <Tab label="Pending" value="pending"/>
                    </Tabs>                
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
