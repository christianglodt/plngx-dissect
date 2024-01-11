import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Link, Outlet, useParams } from 'react-router-dom';

export default function App() {

    const params = useParams();

    const icon = params.patternId ? <ChevronLeftIcon /> : <MenuIcon />
    const title = params.patternId ? `Pattern “${params.patternId}”` : 'Patterns';

    return (
        <Box sx={{ maxHeight: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <AppBar position="relative">
                <Toolbar>
                    <Link to={'/'}>
                        <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
                            {icon}
                        </IconButton>
                    </Link>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {title}
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box sx={{ padding: '1rem', height: '100%' }}>
                <Outlet />
            </Box>
        </Box>
    );
}
