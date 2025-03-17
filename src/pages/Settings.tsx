import {
    Box, Typography, Paper, Switch, FormControlLabel,
    Divider
} from '@mui/material';
import { useTheme } from '../store/themeStore';
import DataManagement from '../components/settings/DataManagement';

const Settings = () => {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Settings</Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Appearance</Typography>
                <FormControlLabel
                    control={
                        <Switch
                            checked={darkMode}
                            onChange={toggleDarkMode}
                        />
                    }
                    label="Dark Mode"
                />
                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>Notifications</Typography>
                <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Enable due date reminders"
                />

                <FormControlLabel
                    control={<Switch />}
                    label="Task completion notifications"
                />
            </Paper>

            {/* Data Management Section */}
            <DataManagement />
        </Box>
    );
};

export default Settings;
