import { ReactNode } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { useTaskStore, Task } from '../store/taskStore';
import { useProjectStore, Project } from '../store/projectStore';
import useIndexedDBSync from '../hooks/useIndexedDBSync';
import { STORE_NAMES } from '../utils/indexedDBManager';

interface DataSyncProviderProps {
  children: ReactNode;
}

/**
 * Provider component that manages data synchronization between
 * Zustand stores and IndexedDB based on user settings
 */
const DataSyncProvider = ({ children }: DataSyncProviderProps) => {
  const { settings } = useSettingsStore();
  const tasks = useTaskStore((state) => state.tasks);
  const projects = useProjectStore((state) => state.projects);
  
  // Create task setter function
  const setTasks = (newTasks: Task[]) => {
    useTaskStore.setState({ tasks: newTasks });
  };
  
  // Create project setter function
  const setProjects = (newProjects: Project[]) => {
    useProjectStore.setState({ projects: newProjects });
  };
  
  // Only sync if IndexedDB is enabled in settings
  const enabled = settings.storage.useIndexedDB;
  
  // Sync tasks with IndexedDB
  const { error: tasksError } = useIndexedDBSync(
    STORE_NAMES.TASKS,
    tasks,
    setTasks,
    enabled
  );
  
  // Sync projects with IndexedDB
  const { error: projectsError } = useIndexedDBSync(
    STORE_NAMES.PROJECTS,
    projects,
    setProjects,
    enabled
  );
  
  // Log any sync errors (could be shown in UI if needed)
  if (tasksError) {
    console.error('Task sync error:', tasksError);
  }
  
  if (projectsError) {
    console.error('Project sync error:', projectsError);
  }
  
  return (
    <>
      {children}
    </>
  );
};

export default DataSyncProvider; 