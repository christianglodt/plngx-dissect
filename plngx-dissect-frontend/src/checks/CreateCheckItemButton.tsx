import { Add } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState, MouseEvent } from 'react';
import { Check, CheckTypeId } from '../types';


type FactoryFuncType = () => Check;

type FactoryEntry = {
    label: string;
    factory: FactoryFuncType;
}

const CHECK_ITEM_FACTORIES: Record<CheckTypeId, FactoryEntry> = { // Typescript "Record" ensures every kind of CheckItem has an entry
    [CheckTypeId.NumPages]: {
        label: 'Number of Pages Check',
        factory: () => { return { type: CheckTypeId.NumPages, num_pages: 1 }; }
    }
}

type CreateCheckItemButtonPropsType = {
    onCheckCreated: (newCheck: Check) => void;
}

const CreateCheckItemButton = (props: CreateCheckItemButtonPropsType) => {
    const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);

    const onCreateClicked = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorElement(event.currentTarget);
    }

    const onMenuItemClicked = (factoryFunction: FactoryFuncType) => {
        props.onCheckCreated(factoryFunction());
        setAnchorElement(null);
    }

    return (
        <>
            <IconButton onClick={onCreateClicked}><Add/></IconButton>
            <Menu anchorEl={anchorElement} open={anchorElement !== null} onClose={() => setAnchorElement(null)}>
                {Object.values(CHECK_ITEM_FACTORIES).map((factory, index) =>
                    <MenuItem key={index} onClick={() => onMenuItemClicked(factory.factory)}>{factory.label}</MenuItem>
                )}
            </Menu>
        </>
    );
}

export default CreateCheckItemButton;
