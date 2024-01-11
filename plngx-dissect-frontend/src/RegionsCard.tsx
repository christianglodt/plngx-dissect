import { IconButton } from "@mui/material";
import { Pattern } from "./hooks";
import { Add } from "@mui/icons-material";
import ListCard from "./utils/ListCard";

type RegionsCardProps = {
    pattern: Pattern;
}

const RegionsCard = (props: RegionsCardProps) => {

    const { pattern } = props;

    return (
        <ListCard title="Regions" headerWidget={<IconButton><Add/></IconButton>}/>
    );
}

export default RegionsCard;
