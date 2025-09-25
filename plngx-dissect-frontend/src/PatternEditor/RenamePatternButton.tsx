import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useRenamePatternMutation } from "../hooks";
import InputDialogButton from "../utils/InputDialogButton";

type RenamePatternButtonPropsType = {
    name: string;
};

const RenamePatternButton = (props: RenamePatternButtonPropsType) => {

    const renamePatternMutation = useRenamePatternMutation();
    const navigate = useNavigate();
    const { patternId } = useParams();
    const [searchParams] = useSearchParams();
    if (!patternId) {
        return <></>;
    }

    const onRenamePatternConfirmed = (newName: string) => {
        if (patternId === newName) return;

        renamePatternMutation.mutate({ oldName: patternId, newName }, {
            onSuccess: () => {
                navigate(`/pattern/${encodeURIComponent(newName)}?${searchParams.toString()}`);
            }
        })
    }

    return (
        <InputDialogButton label="Rename" dialogTitle="Rename Pattern" dialogText="New name" value={props.name} onConfirmed={onRenamePatternConfirmed}/>
    );
};

export default RenamePatternButton;
