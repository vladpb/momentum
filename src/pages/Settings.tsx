import {
    Box, Typography, FormControlLabel, Select, MenuItem,
    Divider, FormControl, InputLabel, useTheme as useMuiTheme, alpha,
    SelectChangeEvent
} from '@mui/material';
import { useSettingsStore } from '../store/settingsStore';
import DataManagement from '../components/settings/DataManagement';
import GlassSurface from '../components/ui/GlassSurface';

const Settings = () => {
    const { settings, updateTheme } = useSettingsStore();
    const muiTheme = useMuiTheme();

    const handleThemeChange = (event: SelectChangeEvent) => {
        updateTheme(event.target.value as 'light' | 'dark' | 'system');
    };

    return (
        <Box sx={{ p: 3 }}>
                        <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                    fontWeight: 700,
                    color: theme => theme.palette.text.primary,
                    mb: 4
                }}
            >
                Settings
            </Typography>

            <GlassSurface sx={{ p: 3, mb: 3 }} depth={1} opacity={0.3}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Appearance
                </Typography>
                
                <FormControl fullWidth sx={{ my: 2 }}>
                    <InputLabel>Theme</InputLabel>
                    <Select
                        value={settings.theme}
                        label="Theme"
                        onChange={handleThemeChange}
                        sx={{
                            backdropFilter: 'blur(10px)',
                            background: alpha(muiTheme.palette.background.paper, 0.3),
                        }}
                    >
                        <MenuItem value="light">Light</MenuItem>
                        <MenuItem value="dark">Dark</MenuItem>
                        <MenuItem value="system">System Default</MenuItem>
                    </Select>
                </FormControl>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Choose your preferred theme. Dark mode is enabled by default.
                </Typography>
                
                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Notifications
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                        control={
                            <FormControl 
                                component="fieldset" 
                                sx={{ mt: 1, mb: 2 }}
                            >
                                <Select
                                    value={settings.notifications.enabled ? "on" : "off"}
                                    onChange={(e: SelectChangeEvent) => 
                                        useSettingsStore.getState().updateNotifications({
                                            enabled: e.target.value === "on"
                                        })
                                    }
                                    size="small"
                                    sx={{
                                        minWidth: 100,
                                        backdropFilter: 'blur(10px)',
                                        background: alpha(muiTheme.palette.background.paper, 0.3),
                                    }}
                                >
                                    <MenuItem value="on">Enabled</MenuItem>
                                    <MenuItem value="off">Disabled</MenuItem>
                                </Select>
                            </FormControl>
                        }
                        label="Due date reminders"
                        labelPlacement="start"
                        sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            width: '100%',
                            mr: 0
                        }}
                    />

                    <FormControlLabel
                        control={
                            <FormControl 
                                component="fieldset" 
                                sx={{ mt: 1, mb: 2 }}
                            >
                                <Select
                                    value={settings.notifications.deadlineReminders ? "on" : "off"}
                                    onChange={(e: SelectChangeEvent) => 
                                        useSettingsStore.getState().updateNotifications({
                                            deadlineReminders: e.target.value === "on"
                                        })
                                    }
                                    size="small"
                                    sx={{
                                        minWidth: 100,
                                        backdropFilter: 'blur(10px)',
                                        background: alpha(muiTheme.palette.background.paper, 0.3),
                                    }}
                                >
                                    <MenuItem value="on">Enabled</MenuItem>
                                    <MenuItem value="off">Disabled</MenuItem>
                                </Select>
                            </FormControl>
                        }
                        label="Task completion notifications"
                        labelPlacement="start"
                        sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            width: '100%',
                            mr: 0
                        }}
                    />
                </Box>
            </GlassSurface>

            {/* Data Management Section */}
            <DataManagement />
        </Box>
    );
};

export default Settings;
