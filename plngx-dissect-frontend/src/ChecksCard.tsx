import { IconButton } from "@mui/material";
import { Pattern, AnyCheck } from "./hooks";
import { Add } from "@mui/icons-material";
import NumPagesCheckItem from "./checks/NumPagesCheckItem";
import ListCard from "./utils/ListCard";


type CheckFactoryProps = {
    check: AnyCheck;
}

const CheckFactory = (props: CheckFactoryProps) => {

    if (props.check.type == 'num_pages') {
        return <NumPagesCheckItem check={props.check}/>
    }
};

type ChecksCardProps = {
    pattern: Pattern;
}

const ChecksCard = (props: ChecksCardProps) => {

    const { pattern } = props;

    return (
        <ListCard title="Checks" headerWidget={<IconButton><Add/></IconButton>}>
            { pattern.checks.map((check, index) =>
                <CheckFactory key={index} check={check}/>
            )}
        </ListCard>
    );
}

export default ChecksCard;
