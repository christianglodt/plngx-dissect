import { Alert, AlertTitle, Box } from "@mui/material";
import { useRouteError, isRouteErrorResponse } from "react-router-dom";

function errorMessage(error: unknown): string {
    if (isRouteErrorResponse(error)) {
        return `${error.status} ${error.statusText}`
    } else if (error instanceof Error) {
        return error.message
    } else if (typeof error === 'string') {
        return error
    } else {
        console.error(error)
        return 'Unknown error'
    }
}

export default function ErrorPage() {
    const error = useRouteError();
    console.error(error);

    return (
        <Box sx={{ display: 'flex', width: '100%', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
            <Alert severity="error">
                <AlertTitle>
                    Error
                </AlertTitle>
                {errorMessage(error)}
            </Alert>
        </Box>
    );
}
