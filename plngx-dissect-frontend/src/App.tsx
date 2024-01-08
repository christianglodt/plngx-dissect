import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Outlet, useParams } from 'react-router-dom';

export default function App() {

  const params = useParams();
  
  const icon = params.patternId ? <ChevronLeftIcon/> : <MenuIcon/>

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            { icon }
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Patterns
          </Typography>
        </Toolbar>
      </AppBar>
      <Outlet/>
    </Box>
  );
}
