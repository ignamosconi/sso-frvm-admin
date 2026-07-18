import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/authApi';

export function useAuth() {
  const { isAuthenticated, logout } = useAuthStore();

  const login = async (username: string, password: string) => {
    // El flujo de 2FA se implementa en el Bloque 3 (LoginPage)
    // useAuth.login ya no emite tokens directamente
    return authApi.login(username, password);
  };

  return { isAuthenticated, login, logout };
}