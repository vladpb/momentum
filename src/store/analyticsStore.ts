import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useTaskStore, Task } from './taskStore';
import { useProjectStore } from './projectStore';

// Define analytics data types
export interface ProjectAnalytics {
  projectId: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  totalTimeSpent: number; // in minutes
  estimatedTime: number; // in minutes
}

export interface TimeEntry {
  date: string; // ISO date string
  timeSpent: number; // in minutes
  projectId: string | null;
  taskId: string;
}

export interface DailyProductivity {
  date: string; // ISO date string (YYYY-MM-DD)
  tasksCompleted: number;
  timeSpent: number; // in minutes
}

interface AnalyticsState {
  // Cached analytics data
  timeEntries: TimeEntry[];
  dailyProductivity: DailyProductivity[];
  
  // Last time analytics were updated
  lastUpdated: string | null;
  
  // Actions
  refreshAnalytics: () => void;
  getProjectAnalytics: () => ProjectAnalytics[];
  getTimeEntries: (startDate?: Date, endDate?: Date) => TimeEntry[];
  getDailyProductivity: (days?: number) => DailyProductivity[];
  getCompletionRate: () => number;
  getAverageTaskCompletionTime: () => number;
  getPriorityDistribution: () => Record<Task['priority'], number>;
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      timeEntries: [],
      dailyProductivity: [],
      lastUpdated: null,
      
      refreshAnalytics: () => {
        const { tasks } = useTaskStore.getState();
        //const { projects } = useProjectStore.getState();

        // Calculate time entries
        const timeEntries = tasks
          .filter(task => task.timeTracking.totalTime > 0)
          .map(task => ({
            projectId: task.projectId,
            taskId: task.id,
            date: task.completedAt || task.createdAt,
            timeSpent: task.timeTracking.totalTime
          }));

        // Calculate daily productivity
        const dailyProductivity = tasks
          .filter(task => task.completedAt)
          .reduce((acc, task) => {
            const date = task.completedAt!.split('T')[0];
            const existing = acc.find(d => d.date === date);
            if (existing) {
              existing.tasksCompleted++;
              existing.timeSpent += task.timeTracking.totalTime;
            } else {
              acc.push({
                date,
                tasksCompleted: 1,
                timeSpent: task.timeTracking.totalTime
              });
            }
            return acc;
          }, [] as DailyProductivity[]);

        // Sort daily productivity by date
        const sortedProductivity = dailyProductivity.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        // Update state
        set(() => ({
          timeEntries,
          dailyProductivity: sortedProductivity,
          lastUpdated: new Date().toISOString()
        }));
      },
      
      getProjectAnalytics: () => {
        // If no data or data is older than 1 hour, refresh
        const { lastUpdated } = get();
        if (!lastUpdated || 
            new Date().getTime() - new Date(lastUpdated).getTime() > 3600000) {
          get().refreshAnalytics();
        }
        
        const { tasks } = useTaskStore.getState();
        const { projects } = useProjectStore.getState();
        
        return projects.map(project => {
          const projectTasks = tasks.filter(task => task.projectId === project.id);
          return {
            projectId: project.id,
            totalTasks: projectTasks.length,
            completedTasks: projectTasks.filter(task => task.status === 'done').length,
            inProgressTasks: projectTasks.filter(task => task.status === 'in_progress').length,
            todoTasks: projectTasks.filter(task => task.status === 'todo').length,
            totalTimeSpent: projectTasks.reduce((total, task) => total + task.timeTracking.totalTime, 0),
            estimatedTime: projectTasks.reduce((total, task) => total + (task.estimatedTime || 0), 0)
          };
        });
      },
      
      getTimeEntries: (startDate, endDate) => {
        const { timeEntries } = get();
        
        if (startDate && endDate) {
          return timeEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= startDate && entryDate <= endDate;
          });
        }
        
        return timeEntries;
      },
      
      getDailyProductivity: (days = 30) => {
        const { dailyProductivity } = get();
        
        if (days) {
          return dailyProductivity.slice(0, days);
        }
        
        return dailyProductivity;
      },
      
      getCompletionRate: () => {
        const { tasks } = useTaskStore.getState();
        if (tasks.length === 0) return 0;
        
        const completedTasks = tasks.filter(task => task.status === 'done');
        return (completedTasks.length / tasks.length) * 100;
      },
      
      getAverageTaskCompletionTime: () => {
        const { tasks } = useTaskStore.getState();
        const completedTasks = tasks.filter(task => 
          task.status === 'done' && task.completedAt && task.createdAt);
        
        if (completedTasks.length === 0) return 0;
        
        const totalTimeInMinutes = completedTasks.reduce((total, task) => {
          const createdDate = new Date(task.createdAt);
          const completedDate = new Date(task.completedAt!);
          const differenceInMinutes = (completedDate.getTime() - createdDate.getTime()) / 60000;
          return total + differenceInMinutes;
        }, 0);
        
        return totalTimeInMinutes / completedTasks.length;
      },
      
      getPriorityDistribution: () => {
        const { tasks } = useTaskStore.getState();
        const result: Record<Task['priority'], number> = {
          low: 0,
          medium: 0,
          high: 0,
          urgent: 0
        };
        
        tasks.forEach(task => {
          result[task.priority]++;
        });
        
        return result;
      }
    }),
    {
      name: 'analytics-storage',
    }
  )
); 