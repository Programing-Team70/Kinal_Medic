import axios from '../utils/axios.js'; // Regresamos a tu archivo original
import { useAuthStore } from '../../features/auth/store/authStore.js';

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
  // Obtenemos el estado completo
  const state = useAuthStore.getState();
  const token = state.token;

  if (token) {
    // IMPORTANTE: Asegúrate de que no haya espacios extra y que el formato sea exacto
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

axiosAdmin.interceptors.request.use(injectToken);
axiosAuth.interceptors.request.use(injectToken);