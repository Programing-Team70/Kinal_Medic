import { create } from 'zustand';
import { axiosNotification } from '../../../shared/api/api.js';

export const useNotificationStore = create((set) => ({
  loading: false,
  error: null,
  lastResponse: null,

  sendMedicalAlert: async ({ doctorEmail, studentName, studentCarnet, description }) => {
    set({ loading: true, error: null, lastResponse: null });
    try {
      const response = await axiosNotification.post('/request-help', {
        doctorEmail,
        studentName,
        studentCarnet,
        description,
      });
      set({ loading: false, lastResponse: response.data });
      return { success: true, message: response.data.message };
    } catch (err) {
      const message =
        err.response?.data?.message || 'No se pudo enviar la alerta médica';
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  clearError: () => set({ error: null }),
}));
