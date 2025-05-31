import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Token } from '@/types';
import { authApi } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  getCurrentUser: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (username: string, password: string) => {
        try {
          set({ isLoading: true });
          const tokenData = await authApi.login({ username, password });
          
          // Store tokens
          localStorage.setItem('access_token', tokenData.access_token);
          localStorage.setItem('refresh_token', tokenData.refresh_token);
          
          set({ token: tokenData.access_token });
          
          // Get user data
          await get().getCurrentUser();
        } catch (error) {
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (email: string, username: string, password: string, fullName?: string) => {
        try {
          set({ isLoading: true });
          const user = await authApi.register({
            email,
            username,
            password,
            full_name: fullName,
          });
          // Registration successful, but user needs to login
          set({ user: null, token: null });
        } catch (error) {
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, token: null });
      },

      getCurrentUser: async () => {
        try {
          const token = localStorage.getItem('access_token');
          if (!token) {
            set({ user: null, token: null });
            return;
          }

          const user = await authApi.getCurrentUser();
          set({ user, token });
        } catch (error) {
          // If getting user fails, clear auth state
          get().logout();
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user 
      }),
    }
  )
);