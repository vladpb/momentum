import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { produce } from 'immer';

export interface UserSettings {
    theme: 'light' | 'dark' | 'system';
    language: string;
    workingHours: {
        start: string; // HH:MM format
        end: string;
        workDays: number[]; // 0-6 where 0 is Sunday
    };
    notifications: {
        enabled: boolean;
        deadlineReminders: boolean;
        reminderTime: number; // hours before deadline
    };
    pomodoroSettings: {
        workDuration: number; // in minutes
        breakDuration: number;
        longBreakDuration: number;
        sessionsBeforeLongBreak: number;
    };
    storage: {
        useIndexedDB: boolean;
    };
}

interface SettingsState {
    settings: UserSettings;
    updateSettings: (settings: Partial<UserSettings>) => void;
    updateTheme: (theme: UserSettings['theme']) => void;
    updateLanguage: (language: string) => void;
    updateWorkingHours: (workingHours: Partial<UserSettings['workingHours']>) => void;
    updateNotifications: (notifications: Partial<UserSettings['notifications']>) => void;
    updatePomodoroSettings: (pomodoroSettings: Partial<UserSettings['pomodoroSettings']>) => void;
    resetToDefaults: () => void;
}

// Default settings
const defaultSettings: UserSettings = {
    theme: 'dark',
    language: 'en',
    workingHours: {
        start: '09:00',
        end: '17:00',
        workDays: [1, 2, 3, 4, 5] // Monday to Friday
    },
    notifications: {
        enabled: true,
        deadlineReminders: true,
        reminderTime: 24 // 24 hours before deadline
    },
    pomodoroSettings: {
        workDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4
    },
    storage: {
        useIndexedDB: false
    }
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            settings: { ...defaultSettings },
            
            updateSettings: (newSettings) => 
                set(
                    produce((state) => {
                        state.settings = {
                            ...state.settings,
                            ...newSettings
                        };
                    })
                ),
                
            updateTheme: (theme) => 
                set(
                    produce((state) => {
                        state.settings.theme = theme;
                    })
                ),
                
            updateLanguage: (language) => 
                set(
                    produce((state) => {
                        state.settings.language = language;
                    })
                ),
                
            updateWorkingHours: (workingHours) => 
                set(
                    produce((state) => {
                        state.settings.workingHours = {
                            ...state.settings.workingHours,
                            ...workingHours
                        };
                    })
                ),
                
            updateNotifications: (notifications) => 
                set(
                    produce((state) => {
                        state.settings.notifications = {
                            ...state.settings.notifications,
                            ...notifications
                        };
                    })
                ),
                
            updatePomodoroSettings: (pomodoroSettings) => 
                set(
                    produce((state) => {
                        state.settings.pomodoroSettings = {
                            ...state.settings.pomodoroSettings,
                            ...pomodoroSettings
                        };
                    })
                ),
                
            resetToDefaults: () => 
                set(
                    produce((state) => {
                        state.settings = { ...defaultSettings };
                    })
                ),
        }),
        {
            name: 'user-settings-storage',
        }
    )
); 