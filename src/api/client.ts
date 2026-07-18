import axios from 'axios';
import { ENV } from '@/config/env';
import { useAuthStore } from '@/store/authStore';

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Inyectar el access token en cada request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Mutex para serializar los refreshes concurrentes.
// Si varios requests fallan con 401 al mismo tiempo, solo uno hace el refresh;
// los demás esperan y reusan el nuevo access token.
let refreshPromise: Promise<void> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Si ya hay un refresh en vuelo, esperamos ese en lugar de lanzar otro
        if (!refreshPromise) {
          refreshPromise = useAuthStore.getState().refresh().finally(() => {
            refreshPromise = null;
          });
        }
        await refreshPromise;

        const token = useAuthStore.getState().accessToken;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return apiClient(originalRequest);
      } catch {
        // El refresh falló — cerrar sesión y redirigir al login
        await useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);