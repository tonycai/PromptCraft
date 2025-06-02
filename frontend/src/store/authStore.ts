import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Token, UserProfileUpdateRequest } from '@/types';
import { authApi } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  getCurrentUser: () => Promise<void>;
  updateUserProfile: (data: UserProfileUpdateRequest) => Promise<void>;
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
          console.log('🔐 AuthStore: Starting login process for:', username);
          set({ isLoading: true });
          
          console.log('🚀 AuthStore: Calling API login...');
          const tokenData = await authApi.login({ username, password });
          console.log('✅ AuthStore: Login API success, received tokens');
          
          // Store tokens
          localStorage.setItem('access_token', tokenData.access_token);
          localStorage.setItem('refresh_token', tokenData.refresh_token);
          console.log('💾 AuthStore: Tokens stored in localStorage');
          
          set({ token: tokenData.access_token });
          
          // Get user data
          console.log('👤 AuthStore: Fetching user data...');
          await get().getCurrentUser();
          console.log('✅ AuthStore: Login process completed successfully');
        } catch (error) {
          console.error('❌ AuthStore: Login failed:', error);
          // Clear any partial state
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          set({ token: null, user: null });
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
        console.log('🚔 AuthStore: Logging out user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, token: null });
        console.log('✅ AuthStore: Logout completed');
      },

      getCurrentUser: async () => {
        try {
          console.log('👤 AuthStore: Getting current user...');
          const token = localStorage.getItem('access_token');
          if (!token) {
            console.log('⚠️ AuthStore: No token found, clearing auth state');
            set({ user: null, token: null });
            return;
          }

          console.log('🚀 AuthStore: Calling API getCurrentUser...');
          const user = await authApi.getCurrentUser();
          console.log('✅ AuthStore: User data received:', { id: user.id, username: user.username, email: user.email });
          set({ user, token });
        } catch (error) {
          console.error('❌ AuthStore: Failed to get current user:', error);
          // If getting user fails, clear auth state
          console.log('🧽 AuthStore: Clearing auth state due to error');
          get().logout();
          throw error;
        }
      },

      updateUserProfile: async (data: UserProfileUpdateRequest) => {
        try {
          set({ isLoading: true });
          const updatedUser = await authApi.updateProfile(data);
          set((state) => ({ 
            user: state.user ? { ...state.user, ...updatedUser } : updatedUser 
          }));
        } catch (error) {
          throw error;
        } finally {
          set({ isLoading: false });
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