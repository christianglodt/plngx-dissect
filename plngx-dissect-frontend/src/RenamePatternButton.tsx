import { useNavigate, useParams } from 'react-router-dom';
import { useRenamePatternMutation } from "./hooks";
import InputDialogButton from "./utils/InputDialogButton";


const RenamePatternButton = () => {

    const renamePatternMutation = useRenamePatternMutation();
    const navigate = useNavigate();
    const { patternId } = useParams();
    if (!patternId) {
        return <></>;
    }

    const onRenamePatternConfirmed = (newName: string) => {
        renamePatternMutation.mutate({ oldName: patternId, newName }, {
            onSuccess: () => {
                navigate(`/pattern/${encodeURIComponent(newName)}`);
            }
        })
    }

    return (
        <InputDialogButton label="Rename" dialogTitle="Rename Pattern" dialogText="New name" onConfirmed={onRenamePatternConfirmed}/>
    );
};

export default RenamePatternButton;
