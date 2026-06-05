import { create } from 'zustand';

import type { User, Role } from '../core/types';

export type { User, Role };

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Initialize state from localStorage
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const isAuthenticated = !!accessToken;

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    login: (user, accessToken, refreshToken) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      set({ user, accessToken, refreshToken, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
    },
    hasPermission: (_permission: string) => {
      const currentUser = get().user;
      if (!currentUser) return false;
      
      // Since we only have ADMIN and STUDENT role enums on the backend,
      // we map admin users to have full access.
      if (currentUser.role === 'ADMIN') {
        return true;
      }
      
      // Students have no permissions inside the Admin panel
      return false;
    },
  };
});

// Setup event listener to handle global logout events triggered by apiClient
if (typeof window !== 'undefined') {
  window.addEventListener('auth-logout', () => {
    useAuthStore.getState().logout();
  });
}
