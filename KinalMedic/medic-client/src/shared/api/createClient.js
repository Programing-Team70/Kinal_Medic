import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { getApiHost } from "../constants/apiHost";

export const createClient = (baseURLOrGetter, timeout = 20000) => {
  const client = axios.create({
    timeout,
    headers: { "Content-Type": "application/json" },
  });

  client.interceptors.request.use((config) => {
    const base =
      typeof baseURLOrGetter === "function"
        ? baseURLOrGetter()
        : baseURLOrGetter;
    config.baseURL = base;

    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
  );

  return client;
};

export const getApiErrorMessage = (err, fallback = "Error de conexión") => {
  if (err?.response?.data?.message) {
    return err.response.data.message;
  }
  if (err?.response?.data?.error) {
    return String(err.response.data.error);
  }
  if (err?.code === "ECONNABORTED") {
    return (
      "Tiempo de espera agotado. Revisa que Docker/backends estén activos " +
      `(host: ${getApiHost()}).`
    );
  }
  if (err?.message === "Network Error" || !err?.response) {
    const host = getApiHost();
    return (
      `No se pudo conectar al servidor (${host}). ` +
      "Misma Wi‑Fi que la PC, Docker arriba (puerto 3001), " +
      "o define EXPO_PUBLIC_API_HOST=http://TU_IP en .env y reinicia Expo."
    );
  }
  return err?.message || fallback;
};
