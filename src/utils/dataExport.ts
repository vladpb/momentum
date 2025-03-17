import { useTaskStore, Task } from '../store/taskStore';
import { useProjectStore, Project } from '../store/projectStore';
import { useSettingsStore, UserSettings } from '../store/settingsStore';
import { saveToIndexedDB, getFromIndexedDB, STORE_NAMES } from './indexedDBManager';

interface ExportData {
  tasks: Task[];
  projects: Project[];
  settings: UserSettings;
  exportDate: string;
  version: string;
}

/**
 * Export all data from the application stores as a JSON file
 * @param useIndexedDB Whether to read data from IndexedDB instead of Zustand stores
 */
export const exportData = async (useIndexedDB = false): Promise<void> => {
    let tasks: Task[];
    let projects: Project[];
    let settings: UserSettings;

    if (useIndexedDB) {
        try {
            tasks = await getFromIndexedDB<Task>(STORE_NAMES.TASKS);
            projects = await getFromIndexedDB<Project>(STORE_NAMES.PROJECTS);
            const settingsObj = await getFromIndexedDB<UserSettings>(STORE_NAMES.SETTINGS);
            settings = settingsObj && settingsObj.length > 0 
                ? settingsObj[0] 
                : useSettingsStore.getState().settings;
        } catch (error) {
            console.error('Error reading from IndexedDB:', error);
            // Fall back to store data if IndexedDB fails
            tasks = useTaskStore.getState().tasks;
            projects = useProjectStore.getState().projects;
            settings = useSettingsStore.getState().settings;
        }
    } else {
        tasks = useTaskStore.getState().tasks;
        projects = useProjectStore.getState().projects;
        settings = useSettingsStore.getState().settings;
    }

    const exportData: ExportData = {
        tasks,
        projects,
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileName = `momentum-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    linkElement.remove();
};

/**
 * Import data from a JSON file into the application stores
 * @param jsonString The JSON string to import
 * @param useIndexedDB Whether to save data to IndexedDB in addition to Zustand stores
 * @returns Success message or error
 */
export const importData = async (
    jsonString: string, 
    useIndexedDB = false
): Promise<{ success: boolean; message: string }> => {
    try {
        const data = JSON.parse(jsonString) as Partial<ExportData>;
        
        // Validate the data structure
        if (!data.tasks || !data.projects || !data.settings) {
            return { 
                success: false, 
                message: 'Invalid data format: Missing required data sections' 
            };
        }
        
        // Import data into stores
        if (data.tasks && Array.isArray(data.tasks)) {
            useTaskStore.setState({ tasks: data.tasks });
            
            if (useIndexedDB) {
                try {
                    await saveToIndexedDB(STORE_NAMES.TASKS, data.tasks);
                } catch (error) {
                    console.error('Error saving tasks to IndexedDB:', error);
                }
            }
        }
        
        if (data.projects && Array.isArray(data.projects)) {
            useProjectStore.setState({ projects: data.projects });
            
            if (useIndexedDB) {
                try {
                    await saveToIndexedDB(STORE_NAMES.PROJECTS, data.projects);
                } catch (error) {
                    console.error('Error saving projects to IndexedDB:', error);
                }
            }
        }
        
        if (data.settings) {
            useSettingsStore.getState().updateSettings(data.settings);
            
            if (useIndexedDB) {
                try {
                    await saveToIndexedDB(STORE_NAMES.SETTINGS, [data.settings]);
                } catch (error) {
                    console.error('Error saving settings to IndexedDB:', error);
                }
            }
        }
        
        return { 
            success: true, 
            message: 'Data successfully imported!' 
        };
    } catch (error) {
        console.error('Import error:', error);
        return { 
            success: false, 
            message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
        };
    }
}; 