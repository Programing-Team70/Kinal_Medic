import { create } from 'zustand';
import { axiosNotification } from '../../../shared/api/api.js';
import { getMedics, getMyProfile } from '../../../shared/api/auth.js';

export const useNotificationStore = create((set, get) => ({
  loading: false,
  emergencyLoading: false,
  respondLoading: false,
  error: null,
  lastResponse: null,
  medics: [],
  medicsLoading: false,
  profile: null,
  requests: [],
  requestsLoading: false,

  fetchMedics: async () => {
    set({ medicsLoading: true, error: null });
    try {
      const medics = await getMedics();
      set({ medics, medicsLoading: false });
      return medics;
    } catch (err) {
      const message =
        err.response?.data?.message || 'No se pudo cargar el personal médico';
      set({ medicsLoading: false, error: message, medics: [] });
      return [];
    }
  },

  fetchProfile: async () => {
    try {
      const profile = await getMyProfile();
      set({ profile });
      return profile;
    } catch {
      set({ profile: null });
      return null;
    }
  },

  fetchRequests: async () => {
    set({ requestsLoading: true });
    try {
      const response = await axiosNotification.get('/requests');
      const list = response.data?.requests || response.data || [];
      set({
        requests: Array.isArray(list) ? list : [],
        requestsLoading: false,
      });
      return list;
    } catch (err) {
      set({ requestsLoading: false, requests: [] });
      return [];
    }
  },

  sendMedicalAlert: async (payload) => {
    set({ loading: true, error: null, lastResponse: null });
    try {
      const response = await axiosNotification.post('/request-help', payload);
      set({ loading: false, lastResponse: response.data });
      await get().fetchRequests();
      return {
        success: true,
        message: response.data.message,
        data: response.data,
      };
    } catch (err) {
      const message =
        err.response?.data?.message || 'No se pudo enviar la alerta médica';
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  sendEmergencyAlert: async (payload) => {
    set({ emergencyLoading: true, error: null, lastResponse: null });
    try {
      const response = await axiosNotification.post('/emergency', payload);
      set({ emergencyLoading: false, lastResponse: response.data });
      await get().fetchRequests();
      return {
        success: true,
        message: response.data.message,
        data: response.data,
      };
    } catch (err) {
      const message =
        err.response?.data?.message || 'No se pudo enviar la emergencia total';
      set({ emergencyLoading: false, error: message });
      return { success: false, message };
    }
  },

  respondToRequest: async (requestId, message) => {
    set({ respondLoading: true, error: null });
    try {
      const response = await axiosNotification.post(
        `/requests/${requestId}/respond`,
        { message }
      );
      set({ respondLoading: false });
      await get().fetchRequests();
      return {
        success: true,
        message: response.data?.message || 'Respuesta enviada',
        data: response.data,
      };
    } catch (err) {
      const msg =
        err.response?.data?.message || 'No se pudo enviar la respuesta';
      set({ respondLoading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  clearError: () => set({ error: null }),
}));
