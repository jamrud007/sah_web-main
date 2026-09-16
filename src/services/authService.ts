// src/services/authService.ts
// Routes to: http://47.237.223.240:8010/be/api/v1/auth/admin/*
// via Vite proxy: /auth/** -> /v1/auth/** (target: http://47.237.223.240:8010/be/api)

import axios from 'axios';
import { store } from '@/store/index';

// Separate axios instance for auth service (no token interceptor loop)
const authApi = axios.create({
  baseURL: '/',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

// Attach access token on every request
authApi.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface AdminUserInfo {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  roles: Array<{ name: string; code: string }>;
}

export interface AdminLoginResponse {
  data: {
    token: string;
    refresh_token: string;
    user_info: AdminUserInfo;
  };
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export const authService = {
  /**
   * POST /auth/admin/login
   * Proxied → http://47.237.223.240:8010/api/v1/auth/admin/login
   */
  login: async (payload: AdminLoginPayload): Promise<AdminLoginResponse['data']> => {
    const res = await authApi.post<AdminLoginResponse>('/auth/admin/login', payload);
    return res.data.data;
  },

  /**
   * POST /auth/admin/logout
   * Proxied → http://47.237.223.240:8010/api/v1/auth/admin/logout
   */
  logout: async (): Promise<void> => {
    await authApi.post('/auth/admin/logout');
  },

  /**
   * GET /auth/admin/me
   * Proxied → http://47.237.223.240:8010/api/v1/auth/admin/me
   */
  me: async (): Promise<AdminUserInfo> => {
    const res = await authApi.get<{ data: AdminUserInfo }>('/auth/admin/me');
    return res.data.data;
  },

  /**
   * POST /auth/admin/password
   * Proxied → http://47.237.223.240:8010/api/v1/auth/admin/password
   */
  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await authApi.post('/auth/admin/password', payload);
  },
};
