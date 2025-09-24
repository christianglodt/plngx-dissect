import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import App from './App.tsx'
import ErrorPage from './ErrorPage.tsx'
import PatternEditor from './PatternEditor.tsx'
import PatternTable from './PatternTable'


import './index.css'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { PATH_PREFIX } from './hooks.ts';

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <ErrorPage />,
        children: [
            { path: 'pattern/:patternId', element: <PatternEditor /> },
            { path: '/', element: <PatternTable /> },
        ]
    },
], { basename: PATH_PREFIX });

const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
    components: {
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: '4pt'
                }
            }
        },
        MuiFormHelperText: {
            styleOverrides: {
                root: {
                    marginTop: 0,
                    height: 0
                }
            }
        }
    }
  });
  
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider theme={darkTheme}>
                    <CssBaseline />
                    <RouterProvider router={router} />
                </ThemeProvider>
            </QueryClientProvider>
        </LocalizationProvider>
    </React.StrictMode>,
)
