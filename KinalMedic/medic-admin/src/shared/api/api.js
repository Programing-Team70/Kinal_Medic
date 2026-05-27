import axios from '../utils/axios.js';
import { useAuthStore } from '../../features/auth/store/authStore.js';

// Implementación de .env para las rutas correctas del servicio user.

export const axiosAuth = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

export const axiosAdmin = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_URL,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

const injectToken = (config) => {
  const state = useAuthStore.getState();
  const token = state.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

axiosAdmin.interceptors.request.use(injectToken);
axiosAuth.interceptors.request.use(injectToken);

export const axiosNotification = axios.create({
  baseURL: import.meta.env.VITE_NOTIFICATION_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

axiosNotification.interceptors.request.use(injectToken);