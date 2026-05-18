import { create } from 'zustand';
import { getAllUsers as getAllUsersRequest } from '../../../shared/api';

export const useUserManagementStore = create((set) => ({
  users: [],
  loading: false,
  error: null,

  getAllUsers: async () => {
    try {
      set({ loading: true, error: null });
      
      // CAMBIO AQUÍ: Usamos el alias correcto que definiste arriba
      const response = await getAllUsersRequest(); 

      // Accedemos a response.users porque así está en tu auth.js
      const data = response?.users || response;

      set({ 
        users: Array.isArray(data) ? data : [], 
        loading: false 
      });
    } catch (err) {
      console.error("Error en getAllUsers:", err);
      set({ 
        error: err.message || 'Error al cargar usuarios', 
        loading: false 
      });
    }
  },
}));