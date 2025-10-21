import { Box, Card, CardContent, CardHeader, List } from "@mui/material";
import React from "react";

type ListCardProps = {
    title: React.ReactNode;
    headerWidget?: React.ReactNode;
    children?: React.ReactNode;
}

const ListCard = (props: ListCardProps) => {
    // This component provides proper scrolling of list items

    const header = <Box sx={{ flexDirection: 'row', flexWrap: 'nowrap', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}><div>{props.title}</div>{props.headerWidget}</Box>;

    return (
        <Card sx={{ height: '100%', width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <CardHeader title={header} component='div' titleTypographyProps={{ component: 'div' }}></CardHeader>
            <CardContent sx={{ overflow: 'hidden', height: '100%' }}>
                <List sx={{ position: 'relative', overflow: 'auto', height: '100%' }} component="div">
                    {props.children}
                </List>
            </CardContent>
        </Card>        
    );
}

export default ListCard;
