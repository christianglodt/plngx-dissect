import { IconButton } from "@mui/material";
import { Pattern } from "./hooks";
import { Add } from "@mui/icons-material";
import ListCard from "./utils/ListCard";

type FieldsCardProps = {
    pattern: Pattern;
}

const FieldsCard = (props: FieldsCardProps) => {

    const { pattern } = props;

    return (
        <ListCard title="Fields" headerWidget={<IconButton><Add/></IconButton>}>
        </ListCard>
    );
}

export default FieldsCard;
