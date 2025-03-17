import { useState, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { lightTheme, darkTheme } from './theme/theme';
import AppRoutes from './routes';
import AppLayout from './components/layout/AppLayout';
import DataSyncProvider from './components/DataSyncProvider';

function App() {
    const [darkMode, setDarkMode] = useState(
        window.matchMedia('(prefers-color-scheme: dark)').matches
    );

    const theme = useMemo(() => darkMode ? darkTheme : lightTheme, [darkMode]);

    const toggleDarkMode = () => setDarkMode(!darkMode);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <BrowserRouter>
                    <DataSyncProvider>
                        <AppLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                            <AppRoutes />
                        </AppLayout>
                    </DataSyncProvider>
                </BrowserRouter>
            </LocalizationProvider>
        </ThemeProvider>
    );
}

export default App;
