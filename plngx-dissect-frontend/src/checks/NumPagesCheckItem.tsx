import { ListItem, ListItemText } from "@mui/material";
import { NumPagesCheck } from "../hooks";

type NumPagesCheckPropsType = {
    check: NumPagesCheck;
}

const NumPagesCheckItem = (props: NumPagesCheckPropsType) => {

    const { check } = props;
    const pluralize = check.num_pages > 1 ? 's' : '';

    return (
        <ListItem>
            <ListItemText primary="Nr. of Pages" secondary={`Must have ${check.num_pages} page${pluralize}`}></ListItemText>
        </ListItem>
    );
};

export default NumPagesCheckItem;
