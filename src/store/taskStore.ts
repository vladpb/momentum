// src/store/taskStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { produce } from 'immer';

// Simple UUID generator as a temporary replacement for the uuid package
// To properly fix this, you should run: npm install uuid @types/uuid
const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
};

export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in_progress' | 'done';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    projectId: string | null;
    tags: string[];
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
    completedAt: string | null;
    estimatedTime: number | null; // in minutes
    parentTaskId: string | null; // For subtasks
    timeTracking: {
        startTime: string | null; // ISO string when timer started
        isRunning: boolean;
        totalTime: number; // in minutes
        timeEntries: Array<{
            id: string;
            startTime: string;
            endTime: string;
            duration: number; // in minutes
            notes: string;
        }>;
    };
}

interface TaskState {
    tasks: Task[];
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'timeTracking'>) => void;
    updateTask: (id: string, task: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    moveTask: (id: string, status: Task['status']) => void;
    startTimeTracking: (id: string) => void;
    stopTimeTracking: (id: string, notes?: string) => void;
    addTimeEntry: (id: string, entry: Omit<Task['timeTracking']['timeEntries'][0], 'id'>) => void;
    completeTask: (id: string) => void;
}

export const useTaskStore = create<TaskState>()(
    persist(
        (set) => ({
            tasks: [],
            addTask: (task) => 
                set(
                    produce((state) => {
                        state.tasks.push({
                            ...task,
                            id: generateId(),
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            completedAt: null,
                            timeTracking: {
                                startTime: null,
                                isRunning: false,
                                totalTime: 0,
                                timeEntries: []
                            }
                        });
                    })
                ),
            updateTask: (id, updatedTask) =>
                set(
                    produce((state) => {
                        const taskIndex = state.tasks.findIndex((task: Task) => task.id === id);
                        if (taskIndex !== -1) {
                            state.tasks[taskIndex] = {
                                ...state.tasks[taskIndex],
                                ...updatedTask,
                                updatedAt: new Date().toISOString()
                            };
                        }
                    })
                ),
            deleteTask: (id) =>
                set(
                    produce((state) => {
                        state.tasks = state.tasks.filter((task: Task) => task.id !== id);
                    })
                ),
            moveTask: (id, status) =>
                set(
                    produce((state) => {
                        const taskIndex = state.tasks.findIndex((task: Task) => task.id === id);
                        if (taskIndex !== -1) {
                            state.tasks[taskIndex].status = status;
                            state.tasks[taskIndex].updatedAt = new Date().toISOString();
                            
                            if (status === 'done' && !state.tasks[taskIndex].completedAt) {
                                state.tasks[taskIndex].completedAt = new Date().toISOString();
                            } else if (status !== 'done') {
                                state.tasks[taskIndex].completedAt = null;
                            }
                        }
                    })
                ),
            startTimeTracking: (id) =>
                set(
                    produce((state) => {
                        const taskIndex = state.tasks.findIndex((task: Task) => task.id === id);
                        if (taskIndex !== -1) {
                            state.tasks[taskIndex].timeTracking.isRunning = true;
                            state.tasks[taskIndex].timeTracking.startTime = new Date().toISOString();
                            state.tasks[taskIndex].updatedAt = new Date().toISOString();
                        }
                    })
                ),
            stopTimeTracking: (id, notes = '') =>
                set(
                    produce((state) => {
                        const taskIndex = state.tasks.findIndex((task: Task) => task.id === id);
                        if (taskIndex !== -1 && state.tasks[taskIndex].timeTracking.isRunning) {
                            const task: Task = state.tasks[taskIndex];
                            const startTime = task.timeTracking.startTime;
                            
                            if (startTime) {
                                const endTime = new Date().toISOString();
                                const durationMs = new Date(endTime).getTime() - new Date(startTime).getTime();
                                const durationMinutes = Math.round(durationMs / 60000);
                                
                                // Add new time entry
                                task.timeTracking.timeEntries.push({
                                    id: generateId(),
                                    startTime,
                                    endTime,
                                    duration: durationMinutes,
                                    notes
                                });
                                
                                // Update total time
                                task.timeTracking.totalTime += durationMinutes;
                                
                                // Reset tracking state
                                task.timeTracking.isRunning = false;
                                task.timeTracking.startTime = null;
                                task.updatedAt = new Date().toISOString();
                            }
                        }
                    })
                ),
            addTimeEntry: (id, entry) =>
                set(
                    produce((state) => {
                        const taskIndex = state.tasks.findIndex((task: Task) => task.id === id);
                        if (taskIndex !== -1) {
                            const task: Task = state.tasks[taskIndex];
                            const newEntry = {
                                ...entry,
                                id: generateId()
                            };
                            
                            task.timeTracking.timeEntries.push(newEntry);
                            task.timeTracking.totalTime += newEntry.duration;
                            task.updatedAt = new Date().toISOString();
                        }
                    })
                ),
            completeTask: (id) =>
                set(
                    produce((state) => {
                        const taskIndex = state.tasks.findIndex((task: Task) => task.id === id);
                        if (taskIndex !== -1) {
                            state.tasks[taskIndex].status = 'done';
                            state.tasks[taskIndex].completedAt = new Date().toISOString();
                            state.tasks[taskIndex].updatedAt = new Date().toISOString();
                            
                            // Stop time tracking if it's running
                            if (state.tasks[taskIndex].timeTracking.isRunning) {
                                const task: Task = state.tasks[taskIndex];
                                const startTime = task.timeTracking.startTime;
                                
                                if (startTime) {
                                    const endTime = new Date().toISOString();
                                    const durationMs = new Date(endTime).getTime() - new Date(startTime).getTime();
                                    const durationMinutes = Math.round(durationMs / 60000);
                                    
                                    task.timeTracking.timeEntries.push({
                                        id: generateId(),
                                        startTime,
                                        endTime,
                                        duration: durationMinutes,
                                        notes: 'Task completed'
                                    });
                                    
                                    task.timeTracking.totalTime += durationMinutes;
                                    task.timeTracking.isRunning = false;
                                    task.timeTracking.startTime = null;
                                }
                            }
                        }
                    })
                ),
        }),
        {
            name: 'tasks-storage',
        }
    )
);
