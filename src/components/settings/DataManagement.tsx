import { useState, useRef, useEffect } from 'react';
import { 
    Box, Typography, Alert, 
    Divider, Grid, Tooltip, FormControlLabel,
    useTheme, alpha, SelectChangeEvent, Select, MenuItem, FormControl
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
import GlassSurface from '../../components/ui/GlassSurface';
import VisionButton from '../../components/ui/VisionButton';

const DataManagement = () => {
    const [importStatus, setImportStatus] = useState<{
        success?: boolean;
        message?: string;
    }>({});
    
    const { settings, updateSettings } = useSettingsStore();
    const [useIndexedDB, setUseIndexedDB] = useState(settings.storage.useIndexedDB);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const theme = useTheme();
    
    // Sync local state with settings store
    useEffect(() => {
        setUseIndexedDB(settings.storage.useIndexedDB);
    }, [settings.storage.useIndexedDB]);
    
    const handleStorageChange = (e: SelectChangeEvent) => {
        const newValue = e.target.value === 'indexeddb';
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
        <GlassSurface sx={{ p: 3, mb: 3 }} depth={1} opacity={0.3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Data Management
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {importStatus.message && (
                <Alert 
                    severity={importStatus.success ? 'success' : 'error'}
                    sx={{ 
                        mb: 3,
                        background: alpha(
                            importStatus.success 
                                ? theme.palette.success.main 
                                : theme.palette.error.main, 
                            0.1
                        ),
                        border: 'none'
                    }}
                    onClose={() => setImportStatus({})}
                >
                    {importStatus.message}
                </Alert>
            )}
            
            <Box sx={{ mb: 3 }}>
                <FormControlLabel
                    control={
                        <FormControl sx={{ minWidth: 150 }}>
                            <Select
                                value={useIndexedDB ? 'indexeddb' : 'localstorage'}
                                onChange={handleStorageChange}
                                size="small"
                                sx={{
                                    backdropFilter: 'blur(10px)',
                                    background: alpha(theme.palette.background.paper, 0.3),
                                }}
                            >
                                <MenuItem value="localstorage">LocalStorage</MenuItem>
                                <MenuItem value="indexeddb">IndexedDB</MenuItem>
                            </Select>
                        </FormControl>
                    }
                    label="Storage Type"
                    labelPlacement="start"
                    sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        width: '100%',
                        mx: 0
                    }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 2, mt: 1 }}>
                    IndexedDB is recommended for larger datasets and better performance
                </Typography>
            </Box>
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                            Export Data
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Export all your tasks, projects, and settings as a JSON file. Use this to backup your data or transfer it to another device.
                        </Typography>
                        <VisionButton 
                            variant="contained" 
                            startIcon={<ExportIcon />}
                            onClick={handleExportData}
                            glass
                        >
                            Export All Data
                        </VisionButton>
                    </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                            Import Data
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Import data from a previously exported JSON file. This will replace all your current data.
                        </Typography>
                        <VisionButton 
                            variant="outlined" 
                            startIcon={<ImportIcon />}
                            onClick={handleImportClick}
                            glass
                        >
                            Import Data
                        </VisionButton>
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
                    <Typography variant="subtitle1" color="error" gutterBottom sx={{ fontWeight: 600 }}>
                        Danger Zone
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="body1">Clear All Data</Typography>
                            <Typography variant="body2" color="text.secondary">
                                This will permanently delete all your tasks, projects, and settings. This action cannot be undone.
                            </Typography>
                        </Box>
                        <Tooltip title="We recommend exporting your data before clearing it">
                            <VisionButton 
                                variant="outlined" 
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={clearAllData}
                                glass
                            >
                                Clear All Data
                            </VisionButton>
                        </Tooltip>
                    </Box>
                </Grid>
            </Grid>
        </GlassSurface>
    );
};

export default DataManagement; 