import { useMemo, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { darkTheme, lightTheme } from './theme/theme';
import AppRoutes from './routes';
import AppLayout from './components/layout/AppLayout';
import DataSyncProvider from './components/DataSyncProvider';
import { useSettingsStore } from './store/settingsStore';

function App() {
    const { settings } = useSettingsStore();
    
    // Determine which theme to use based on settings
    const theme = useMemo(() => {
        if (settings.theme === 'light') {
            return lightTheme;
        } else if (settings.theme === 'dark') {
            return darkTheme;
        } else {
            // For 'system', check preferred color scheme
            const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            return prefersDarkMode ? darkTheme : lightTheme;
        }
    }, [settings.theme]);

    // Listen for system theme changes when using 'system' theme
    useEffect(() => {
        if (settings.theme !== 'system') return;
        
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            // Force a re-render by updating the settings
            useSettingsStore.getState().updateTheme('system');
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [settings.theme]);

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
