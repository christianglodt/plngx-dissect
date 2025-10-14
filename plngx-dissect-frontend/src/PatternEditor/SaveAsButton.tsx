import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePatternExistsValidation, useSaveAsPatternMutation } from "../hooks";
import InputDialogButton from "../utils/InputDialogButton";
import { SaveAs } from '@mui/icons-material';
import { useContext } from 'react';
import { PatternEditorContext } from './PatternEditorContext';
import { produce } from 'immer';

type SaveAsButtonPropsType = {
    name: string;
};

const SaveAsButton = (props: SaveAsButtonPropsType) => {

    const saveAsMutation = useSaveAsPatternMutation();
    const navigate = useNavigate();
    const {pattern} = useContext(PatternEditorContext);
    const [searchParams] = useSearchParams();
    const [existsError, validatePatternExists] = usePatternExistsValidation(props.name)

    if (!pattern) {
        return <></>;
    }

    const onSaveAsConfirmed = (newName: string) => {
        if (pattern.name === newName) return;

        const renamedPattern = produce(pattern, draft => {
            draft.name = newName;
        });

        saveAsMutation.mutate({ pattern: renamedPattern, newName }, {
            onSuccess: () => {
                navigate(`/pattern/${encodeURIComponent(newName)}?${searchParams.toString()}`);
            }
        })
    }

    const onDialogTextChanged = (value: string) => {
        validatePatternExists(value);
    }

    return (
        <InputDialogButton style={{ borderColor: '#666' }} color="inherit" variant="outlined" label="Save As" icon={<SaveAs/>} dialogTitle="Save Pattern As" value={props.name} onConfirmed={onSaveAsConfirmed} onTextChanged={onDialogTextChanged} error={existsError}/>
    );
};

export default SaveAsButton;
