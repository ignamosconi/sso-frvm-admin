import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/authApi';

export function useAuth() {
  const { isAuthenticated, setTokens, logout } = useAuthStore();

  const login = async (username: string, password: string) => {
    const data = await authApi.login(username, password);
    setTokens(data.access_token, data.refresh_token);
  };

  return { isAuthenticated, login, logout };
}