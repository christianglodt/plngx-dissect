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
    },
    [CheckTypeId.Region]: {
        label: 'Text in Region Check',
        factory: () => { return { type: CheckTypeId.Region, x: 50, y: 50, x2: 200, y2: 75, regex: 'Regex' }; }
    },
    [CheckTypeId.Title]: {
        label: 'Title Check',
        factory: () => { return { type: CheckTypeId.Title, regex: '.*' }; }
    },
    [CheckTypeId.Correspondent]: {
        label: 'Correspondent Check',
        factory: () => { return { type: CheckTypeId.Correspondent, name: '' }; }
    },
    [CheckTypeId.DocumentType]: {
        label: 'Document Type Check',
        factory: () => { return { type: CheckTypeId.DocumentType, name: 'Bill' }; }
    },
    [CheckTypeId.StoragePath]: {
        label: 'Storage Path Check',
        factory: () => { return { type: CheckTypeId.StoragePath, name: '/storage/path' }; }
    },
    [CheckTypeId.Tag]: {
        label: 'Tag Check',
        factory: () => { return { type: CheckTypeId.Tag, includes: [], excludes: [] }; }
    },
    [CheckTypeId.DateCreated]: {
        label: 'Date created Check',
        factory: () => { return { type: CheckTypeId.DateCreated, before: null, after: null, year: null }; }
    },
    [CheckTypeId.And]: {
        label: 'And Check',
        factory: () => { return { type: CheckTypeId.And, checks: [] }; }
    },
    [CheckTypeId.Or]: {
        label: 'Or Check',
        factory: () => { return { type: CheckTypeId.Or, checks: [] }; }
    },
    [CheckTypeId.Not]: {
        label: 'Not Check',
        factory: () => { return { type: CheckTypeId.Not, check: null }; }
    },
}

type CreateCheckItemButtonPropsType = {
    onCheckCreated: (newCheck: Check) => void;
    disabled?: boolean;
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
            <IconButton onClick={onCreateClicked} disabled={props.disabled}><Add/></IconButton>
            <Menu anchorEl={anchorElement} open={anchorElement !== null} onClose={() => setAnchorElement(null)}>
                {Object.values(CHECK_ITEM_FACTORIES).map((factory, index) =>
                    <MenuItem key={index} onClick={() => onMenuItemClicked(factory.factory)}>{factory.label}</MenuItem>
                )}
            </Menu>
        </>
    );
}

export default CreateCheckItemButton;
