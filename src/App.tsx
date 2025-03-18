import { useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { darkTheme } from './theme/theme';
import AppRoutes from './routes';
import AppLayout from './components/layout/AppLayout';
import DataSyncProvider from './components/DataSyncProvider';

function App() {
    // Use the dark theme for better VisionOS appearance
    const theme = useMemo(() => darkTheme, []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <BrowserRouter>
                    <DataSyncProvider>
                        <AppLayout>
                            <AppRoutes />
                        </AppLayout>
                    </DataSyncProvider>
                </BrowserRouter>
            </LocalizationProvider>
        </ThemeProvider>
    );
}

export default App;
