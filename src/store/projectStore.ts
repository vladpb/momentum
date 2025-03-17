import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { produce } from 'immer';

// Simple UUID generator
const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
};

export interface Project {
    id: string;
    name: string;
    description: string;
    color: string; // Hex color for visual identification
    status: 'active' | 'on_hold' | 'completed' | 'archived';
    createdAt: string;
    updatedAt: string;
    completedAt: string | null;
    dueDate: string | null;
    goal: string;
    tags: string[];
}

interface ProjectState {
    projects: Project[];
    addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>) => void;
    updateProject: (id: string, project: Partial<Project>) => void;
    deleteProject: (id: string) => void;
    completeProject: (id: string) => void;
    archiveProject: (id: string) => void;
}

export const useProjectStore = create<ProjectState>()(
    persist(
        (set) => ({
            projects: [],
            addProject: (project) => 
                set(
                    produce((state) => {
                        state.projects.push({
                            ...project,
                            id: generateId(),
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            completedAt: null,
                        });
                    })
                ),
            updateProject: (id, updatedProject) =>
                set(
                    produce((state) => {
                        const projectIndex = state.projects.findIndex((project: Project) => project.id === id);
                        if (projectIndex !== -1) {
                            state.projects[projectIndex] = {
                                ...state.projects[projectIndex],
                                ...updatedProject,
                                updatedAt: new Date().toISOString()
                            };
                        }
                    })
                ),
            deleteProject: (id) =>
                set(
                    produce((state) => {
                        state.projects = state.projects.filter((project: Project) => project.id !== id);
                    })
                ),
            completeProject: (id) =>
                set(
                    produce((state) => {
                        const projectIndex = state.projects.findIndex((project: Project) => project.id === id);
                        if (projectIndex !== -1) {
                            state.projects[projectIndex].status = 'completed';
                            state.projects[projectIndex].completedAt = new Date().toISOString();
                            state.projects[projectIndex].updatedAt = new Date().toISOString();
                        }
                    })
                ),
            archiveProject: (id) =>
                set(
                    produce((state) => {
                        const projectIndex = state.projects.findIndex((project: Project) => project.id === id);
                        if (projectIndex !== -1) {
                            state.projects[projectIndex].status = 'archived';
                            state.projects[projectIndex].updatedAt = new Date().toISOString();
                        }
                    })
                ),
        }),
        {
            name: 'projects-storage',
        }
    )
); 