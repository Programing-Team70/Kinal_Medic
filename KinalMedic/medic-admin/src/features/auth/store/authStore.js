import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as loginRequest, register as registerRequest } from '../../../shared/api';
import { showError } from '../../../shared/utils/toast.js';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      expiresAt: null,
      loading: false,
      error: null,
      isLoadingAuth: true,
      isAuthenticated: false,
  
      checkAuth: () => {
        const token = get().token;
        const role = get().user?.role;
        const isAdmin = role === 'ADMIN_ROLE';
        if (token && !isAdmin) {
          set({
            user: null,
            token: null,
            refreshToken: null,
            expiresAt: null,
            isAuthenticated: false,
            isLoadingAuth: false,
            error: 'Notienes permisos para acceder a esta aplicación',
          });
          return;
        }
        set({
          isLoadingAuth: false,
          isAuthenticated: Boolean(token) && isAdmin,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          expiresAt: null,
          isAuthenticated: false,
        });
      },

      login: async ({ email, password }) => {
        try {
          set({ loading: true, error: null });
          const response = await loginRequest({ email, password });
          
          const data = response.data;
          const role = data?.role;
          const token = data?.token;

          console.log("Rol recibido del servidor:", role);

          if (role !== 'ADMIN_ROLE') {
            const message = 'No tienes permisos para acceder a esta aplicación';
            showError(message);
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              loading: false,
              error: message,
            });
            return { success: false, error: message };
          }

          set({
            user: { ...data, role },
            token: token,   
            isAuthenticated: true,
            loading: false,
          });

          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || 'Error de autenticación';
          set({ error: message, loading: false });
          showError(message);
          return { success: false, error: message };
        }
      },

      register: async (formData) => {
        try {
          set({ loading: true, error: null });
          const response = await registerRequest(formData);
          set({ loading: false });

          return {
            success: true,
            data: response.data,
          };
        } catch (err) {
          const message = err.response?.data?.message || 'Error al registrar usuario';
          set({ error: message, loading: false });
          return { success: false, error: message };
        }
      },
    }),
    {
      name: 'auth-storage-kinal-medic',
    }
  )
);
