import { Article, Error } from "@mui/icons-material";
import { Chip, CircularProgress, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useHistory } from "./hooks";
import ListCard from "./utils/ListCard";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import { HistoryItem } from "./types";

dayjs.extend(relativeTime);

const HistoryCard = () => {

    const { data: history, isLoading, error } = useHistory();

    const onDocumentClicked = (item: HistoryItem) => {
        window.open(item.paperless_url, "_blank");
    }

    // Sort most recent first
    history?.sort((a, b) => dayjs(b.datetime).valueOf() - dayjs(a.datetime).valueOf());

    return (
        <ListCard title={<span>History</span>} headerWidget={isLoading ? <CircularProgress/> : ''}>
            { history && !error && history.map((item) =>
            <ListItemButton key={`${item.paperless_id}-${item.datetime}-${item.operation}`} onClick={() => onDocumentClicked(item)} alignItems="flex-start">
                <ListItemIcon><Article/></ListItemIcon>
                <ListItemText primary={item.title} secondary={
                    <span>
                        <span title={dayjs(item.datetime).toString()}>{`${dayjs(item.datetime).fromNow()}`}</span><br/>
                        <span>{`${item.details}`}</span>
                    </span>
                }/>
            </ListItemButton>
            )}
            { error &&
            <Chip label={error.toString()} color="error" icon={<Error/>}/>
            }
        </ListCard>
    );
}

export default HistoryCard;
