import { create } from 'zustand';
import {
  getAllUsers as getAllUsersRequest,
  updateUser as updateUserRequest,
  deleteUser as deleteUserRequest,
} from '../../../shared/api';

export const useUserManagementStore = create((set, get) => ({
  users: [],
  loading: false,
  error: null,

  getAllUsers: async () => {
    try {
      set({ loading: true, error: null });

      const response = await getAllUsersRequest();
      const data = response?.users || response;

      set({
        users: Array.isArray(data) ? data : [],
        loading: false,
      });
    } catch (err) {
      console.error('Error en getAllUsers:', err);
      set({
        error:
          err.response?.data?.message ||
          err.message ||
          'Error al cargar usuarios',
        loading: false,
      });
    }
  },

  updateUser: async (id, payload) => {
    try {
      set({ loading: true, error: null });
      const response = await updateUserRequest(id, payload);
      await get().getAllUsers();
      set({ loading: false });
      return {
        success: true,
        message: response.data?.message || 'Usuario actualizado',
        user: response.data?.user,
      };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Error al actualizar usuario';
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  deleteUser: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await deleteUserRequest(id);
      await get().getAllUsers();
      set({ loading: false });
      return {
        success: true,
        message: response.data?.message || 'Usuario eliminado',
      };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Error al eliminar usuario';
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },
}));
