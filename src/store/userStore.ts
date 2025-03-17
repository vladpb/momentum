import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
}

interface UserState {
  user: User;
  updateUser: (userData: Partial<User>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        bio: 'Task management enthusiast',
      },
      updateUser: (userData) => 
        set((state) => ({ 
          user: { 
            ...state.user, 
            ...userData 
          } 
        })),
    }),
    {
      name: 'user-storage',
    }
  )
); 