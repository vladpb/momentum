import { useState, useRef, useEffect } from 'react';
import { 
    Box, Button, Typography, Paper, Alert, 
    Divider, Grid, Tooltip, Switch, FormControlLabel
} from '@mui/material';
import { 
    FileDownload as ExportIcon,
    FileUpload as ImportIcon,
    DeleteForever as DeleteIcon
} from '@mui/icons-material';
import { exportData, importData } from '../../utils/dataExport';
import { useTaskStore } from '../../store/taskStore';
import { useProjectStore } from '../../store/projectStore';
import { useSettingsStore } from '../../store/settingsStore';

const DataManagement = () => {
    const [importStatus, setImportStatus] = useState<{
        success?: boolean;
        message?: string;
    }>({});
    
    const { settings, updateSettings } = useSettingsStore();
    const [useIndexedDB, setUseIndexedDB] = useState(settings.storage.useIndexedDB);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Sync local state with settings store
    useEffect(() => {
        setUseIndexedDB(settings.storage.useIndexedDB);
    }, [settings.storage.useIndexedDB]);
    
    const handleStorageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.checked;
        setUseIndexedDB(newValue);
        updateSettings({
            storage: {
                ...settings.storage,
                useIndexedDB: newValue
            }
        });
    };
    
    const handleExportData = async () => {
        await exportData(useIndexedDB);
        setImportStatus({
            success: true,
            message: 'Data exported successfully!'
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
            setImportStatus({});
        }, 3000);
    };
    
    const handleImportClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target?.result;
            if (typeof content === 'string') {
                const result = await importData(content, useIndexedDB);
                setImportStatus(result);
                
                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };
        reader.readAsText(file);
    };
    
    const clearAllData = () => {
        if (window.confirm('Are you sure you want to delete all application data? This action cannot be undone.')) {
            useTaskStore.setState({ tasks: [] });
            useProjectStore.setState({ projects: [] });
            useSettingsStore.getState().resetToDefaults();
            setImportStatus({
                success: true,
                message: 'All data has been cleared successfully.'
            });
        }
    };
    
    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Data Management</Typography>
            <Divider sx={{ mb: 3 }} />
            
            {importStatus.message && (
                <Alert 
                    severity={importStatus.success ? 'success' : 'error'}
                    sx={{ mb: 3 }}
                    onClose={() => setImportStatus({})}
                >
                    {importStatus.message}
                </Alert>
            )}
            
            <Box sx={{ mb: 3 }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={useIndexedDB}
                            onChange={handleStorageChange}
                        />
                    }
                    label={
                        <Typography variant="body2">
                            Use IndexedDB for data storage (more robust than localStorage)
                        </Typography>
                    }
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 2 }}>
                    Recommended for larger datasets and better performance
                </Typography>
            </Box>
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>Export Data</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Export all your tasks, projects, and settings as a JSON file. Use this to backup your data or transfer it to another device.
                        </Typography>
                        <Button 
                            variant="contained" 
                            startIcon={<ExportIcon />}
                            onClick={handleExportData}
                        >
                            Export All Data
                        </Button>
                    </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>Import Data</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Import data from a previously exported JSON file. This will replace all your current data.
                        </Typography>
                        <Button 
                            variant="outlined" 
                            startIcon={<ImportIcon />}
                            onClick={handleImportClick}
                        >
                            Import Data
                        </Button>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept=".json"
                            onChange={handleFileChange}
                        />
                    </Box>
                </Grid>
                
                <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" color="error" gutterBottom>Danger Zone</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="body1">Clear All Data</Typography>
                            <Typography variant="body2" color="text.secondary">
                                This will permanently delete all your tasks, projects, and settings. This action cannot be undone.
                            </Typography>
                        </Box>
                        <Tooltip title="We recommend exporting your data before clearing it">
                            <Button 
                                variant="outlined" 
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={clearAllData}
                            >
                                Clear All Data
                            </Button>
                        </Tooltip>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default DataManagement; 