import { apiClient } from './client';
import {
  AdminResponse,
  OAuthClientResponse,
  CreateAdminPayload,
  UpdateAdminPayload,
  CreateOAuthClientPayload,
  UpdateOAuthClientPayload,
} from '@/types/api.types';

export const adminsApi = {
  findAll: async (): Promise<AdminResponse[]> => {
    const { data } = await apiClient.get<AdminResponse[]>('/admin/admins');
    return data;
  },

  findOne: async (id: string): Promise<AdminResponse> => {
    const { data } = await apiClient.get<AdminResponse>(`/admin/admins/${id}`);
    return data;
  },

  create: async (payload: CreateAdminPayload): Promise<AdminResponse> => {
    const { data } = await apiClient.post<AdminResponse>('/admin/admins', payload);
    return data;
  },

  update: async (id: string, payload: UpdateAdminPayload): Promise<AdminResponse> => {
    const { data } = await apiClient.patch<AdminResponse>(`/admin/admins/${id}`, payload);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/admins/${id}`);
  },
};

export const oauthClientsApi = {
  findAll: async (): Promise<OAuthClientResponse[]> => {
    const { data } = await apiClient.get<OAuthClientResponse[]>('/admin/clients');
    return data;
  },

  create: async (payload: CreateOAuthClientPayload): Promise<OAuthClientResponse> => {
    const { data } = await apiClient.post<OAuthClientResponse>('/admin/clients', payload);
    return data;
  },

  update: async (id: number, payload: UpdateOAuthClientPayload): Promise<OAuthClientResponse> => {
    const { data } = await apiClient.patch<OAuthClientResponse>(`/admin/clients/${id}`, payload);
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/clients/${id}`);
  },

  regenerateSecret: async (id: number): Promise<OAuthClientResponse> => {
    const { data } = await apiClient.post<OAuthClientResponse>(`/admin/clients/${id}/regenerate-secret`);
    return data;
  },
};