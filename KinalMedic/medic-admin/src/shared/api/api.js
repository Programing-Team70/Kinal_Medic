import axios from '../utils/axios.js';
import { useAuthStore } from '../../features/auth/store/authStore.js';

const AUTH_URL =
  import.meta.env.VITE_AUTH_URL || 'http://localhost:3001/api/students';
const ADMIN_URL =
  import.meta.env.VITE_ADMIN_URL || 'http://localhost:3001/api/students';
const NOTIFICATION_URL =
  import.meta.env.VITE_NOTIFICATION_URL ||
  'http://localhost:3005/api/notifications';

export const axiosAuth = axios.create({
  baseURL: AUTH_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

export const axiosAdmin = axios.create({
  baseURL: ADMIN_URL,
  timeout: 20000,
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
  baseURL: NOTIFICATION_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

axiosNotification.interceptors.request.use(injectToken);