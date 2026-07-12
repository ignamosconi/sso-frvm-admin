import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/api/authApi';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  refresh: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken, isAuthenticated: true });
      },

      refresh: async () => {
        const { refreshToken } = get();
        if (!refreshToken) throw new Error('No refresh token');
        const data = await authApi.refresh(refreshToken);
        set({ accessToken: data.access_token, refreshToken: data.refresh_token });
      },

      logout: () => {
        set({ accessToken: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'sso-admin-auth',
      partialState: (state) => ({
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);