import { apiClient } from './client';
import { TokenResponse } from '@/types/api.types';

export const authApi = {
  login: async (username: string, password: string): Promise<TokenResponse> => {
    const { data } = await apiClient.post<TokenResponse>('/admin/auth/login', {
      username,
      password,
    });
    return data;
  },

  refresh: async (refresh_token: string): Promise<TokenResponse> => {
    const { data } = await apiClient.post<TokenResponse>('/admin/auth/refresh', {
      refresh_token,
    });
    return data;
  },
};