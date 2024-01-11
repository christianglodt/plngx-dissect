import { Box, Card, CardContent, CardHeader, List } from "@mui/material";
import React from "react";

type ListCardProps = {
    title: string | React.JSX.Element;
    headerWidget?: React.JSX.Element;
    children?: string | React.JSX.Element[];
}

const ListCard = (props: ListCardProps) => {
    // This component provides proper scrolling of list items

    const header = <Box sx={{ flexDirection: 'row', flexWrap: 'nowrap', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}><div>{props.title}</div>{props.headerWidget}</Box>;

    return (
        <Card sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <CardHeader title={header}></CardHeader>
            <CardContent sx={{ overflow: 'hidden', height: '100%' }}>
                <List sx={{ position: 'relative', overflow: 'auto', height: '100%' }}>
                    {props.children}
                </List>
            </CardContent>
        </Card>        
    );
}

export default ListCard;
