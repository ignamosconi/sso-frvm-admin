import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/api/authApi';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  adminId: string | null;
  adminUsername: string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  refresh: () => Promise<void>;
  logout: () => void;
}

function parseJwt(token: string): Record<string, unknown> {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return {};
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      adminId: null,
      adminUsername: null,

      setTokens: (accessToken, refreshToken) => {
        const payload = parseJwt(accessToken);
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
          adminId: (payload.sub as string) ?? null,
          adminUsername: (payload.username as string) ?? null,
        });
      },

      refresh: async () => {
        const { refreshToken } = get();
        if (!refreshToken) throw new Error('No refresh token');
        const data = await authApi.refresh(refreshToken);
        const payload = parseJwt(data.access_token);
        set({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          adminId: (payload.sub as string) ?? null,
          adminUsername: (payload.username as string) ?? null,
        });
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          adminId: null,
          adminUsername: null,
        });
      },
    }),
    {
      name: 'sso-admin-auth',
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        adminId: state.adminId,
        adminUsername: state.adminUsername,
      }),
    }
  )
);