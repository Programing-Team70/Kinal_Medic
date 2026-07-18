import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  login as loginRequest,
  register as registerRequest,
  createUser as createUserRequest,
} from '../../../shared/api';
import { showError } from '../../../shared/utils/toast.js';
import { canAccessApp } from '../../../shared/utils/roles.js';

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
        const hasAccess = canAccessApp(role);
        
        if (token && !hasAccess) {
          set({
            user: null,
            token: null,
            refreshToken: null,
            expiresAt: null,
            isAuthenticated: false,
            isLoadingAuth: false,
            error: 'No tienes permisos para acceder a esta aplicación',
          });
          return;
        }
        set({
          isLoadingAuth: false,
          isAuthenticated: Boolean(token) && hasAccess,
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

          if (!canAccessApp(role)) {
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
            user: {
              id: data.userDetails?.id != null ? String(data.userDetails.id) : null,
              name: data.userDetails?.name,
              email: data.userDetails?.email,
              carnet: data.userDetails?.carnet,
              educationLevel: data.userDetails?.educationLevel,
              carrera: data.userDetails?.carrera,
              seccion: data.userDetails?.seccion,
              hasAllergies: data.userDetails?.hasAllergies,
              allergies: data.userDetails?.allergies,
              guardianEmail: data.userDetails?.guardianEmail,
              phone: data.userDetails?.phone,
              role: role,
            },
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

      createUser: async (formData) => {
        try {
          set({ loading: true, error: null });
          const response = await createUserRequest(formData);
          set({ loading: false });

          return {
            success: true,
            data: response.data,
          };
        } catch (err) {
          const message = err.response?.data?.message || 'Error al crear usuario';
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