import { Add } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState, MouseEvent } from 'react';
import { Check } from '../types';


type FactoryFuncType = () => Check;

type CheckItemFactoryType = {
    label: string;
    factory: FactoryFuncType;
}

// TODO Use type system to ensure that there is one factory function for every subtype of Check?
const CHECK_ITEM_FACTORIES: CheckItemFactoryType[] = [
    {
        label: 'Number of Pages Check',
        factory: () => { return { type: 'num_pages', num_pages: 1 }; }
    }
]

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
                {CHECK_ITEM_FACTORIES.map((factory, index) =>
                    <MenuItem key={index} onClick={() => onMenuItemClicked(factory.factory)}>{factory.label}</MenuItem>
                )}
            </Menu>
        </>
    );
}

export default CreateCheckItemButton;
