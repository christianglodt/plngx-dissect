import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { usePatternExistsValidation, useSaveAsPatternMutation } from "../hooks";
import InputDialogButton from "../utils/InputDialogButton";
import { SaveAs } from '@mui/icons-material';

type SaveAsButtonPropsType = {
    name: string;
};

const SaveAsButton = (props: SaveAsButtonPropsType) => {

    const saveAsMutation = useSaveAsPatternMutation();
    const navigate = useNavigate();
    const { patternId } = useParams();
    const [searchParams] = useSearchParams();
    const [existsError, validatePatternExists] = usePatternExistsValidation(props.name)

    if (!patternId) {
        return <></>;
    }

    const onSaveAsConfirmed = (newName: string) => {
        if (patternId === newName) return;

        saveAsMutation.mutate({ oldName: patternId, newName }, {
            onSuccess: () => {
                navigate(`/pattern/${encodeURIComponent(newName)}?${searchParams.toString()}`);
            }
        })
    }

    const onDialogTextChanged = (value: string) => {
        validatePatternExists(value);
    }

    return (
        <InputDialogButton label="Save As" icon={<SaveAs/>} dialogTitle="Save Pattern As" dialogText="New name" value={props.name} onConfirmed={onSaveAsConfirmed} onTextChanged={onDialogTextChanged} error={existsError}/>
    );
};

export default SaveAsButton;
