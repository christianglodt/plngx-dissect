import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { usePatternExistsValidation, useRenamePatternMutation } from "../hooks";
import InputDialogButton from "../utils/InputDialogButton";

type RenameButtonPropsType = {
    name: string;
};

const RenameButton = (props: RenameButtonPropsType) => {

    const renamePatternMutation = useRenamePatternMutation();
    const navigate = useNavigate();
    const { patternId } = useParams();
    const [searchParams] = useSearchParams();
    const [existsError, validatePatternExists] = usePatternExistsValidation(props.name)

    if (!patternId) {
        return <></>;
    }

    const onRenameConfirmed = (newName: string) => {
        if (patternId === newName) return;

        renamePatternMutation.mutate({ oldName: patternId, newName }, {
            onSuccess: () => {
                navigate(`/pattern/${encodeURIComponent(newName)}?${searchParams.toString()}`);
            }
        })
    }

    const onDialogTextChanged = (value: string) => {
        validatePatternExists(value);
    }

    return (
        <InputDialogButton label="Rename" dialogTitle="Rename Pattern" dialogText="New name" value={props.name} onConfirmed={onRenameConfirmed} error={existsError} onTextChanged={onDialogTextChanged}/>
    );
};

export default RenameButton;
