import axios, { AxiosError } from 'axios';
import { ENV } from '@/config/env';

export const healthApi = {
  checkSso: async (): Promise<boolean> => {
    try {
      await axios.get(`${ENV.API_BASE_URL}/health`, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  },

  checkAutogestion: async (): Promise<boolean> => {
    try {
      await axios.get(ENV.AUTOGESTION_URL, { timeout: 5000 });
      return true;
    } catch (err) {
      // 401 significa que el servidor respondió — está vivo
      const axiosError = err as AxiosError;
      if (axiosError?.response?.status === 401) return true;
      return false;
    }
  },
};