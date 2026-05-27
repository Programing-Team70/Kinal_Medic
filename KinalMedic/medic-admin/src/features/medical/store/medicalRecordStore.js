import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_MEDICAL_RECORDS_URL;

export const useMedicalRecordStore = create((set) => ({
    records: [],
    loading: false,

    fetchAllRecords: async (token) => {
        set({ loading: true });
        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            const response = await axios.get(`${API_URL}/all`, config);
            set({ records: response.data, loading: false });
        } catch (error) {
            console.error('Error al traer todos los registros:', error);
            set({ records: [], loading: false });
            toast.error('No se pudo cargar el listado completo de expedientes.');
        }
    },

    createMedicalRecord: async (recordData, token) => {
        set({ loading: true });
        const loadingToast = toast.loading('Guardando expediente médico...');
        try {
            const config = { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } };
            const response = await axios.post(`${API_URL}/add`, recordData, config);
            toast.success('Registro médico guardado.', { id: loadingToast });
            set((state) => ({ records: [response.data.record, ...state.records], loading: false }));
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al guardar.', { id: loadingToast });
            set({ loading: false });
            return false;
        }
    },

    fetchRecordsByCarnet: async (carnet, token) => {
        if (!carnet.trim()) return;
        set({ loading: true });
        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            const response = await axios.get(`${API_URL}/${carnet}`, config);
            set({ records: response.data, loading: false });
        } catch (error) {
            set({ records: [], loading: false });
            if (error.response?.status !== 404) toast.error('Error al consultar el historial.');
        }
    },

    updateMedicalRecord: async (id, updatedData, token) => {
        set({ loading: true });
        const loadingToast = toast.loading('Actualizando registro...');
        try {
            const config = { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } };
            const response = await axios.put(`${API_URL}/update/${id}`, updatedData, config);
            
            toast.success('Registro actualizado correctamente.', { id: loadingToast });
            
            set((state) => ({
                records: state.records.map((rec) => rec._id === id ? response.data.updatedRecord : rec),
                loading: false
            }));
            return true;
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'No tienes permisos o el registro no existe.', { id: loadingToast });
            set({ loading: false });
            return false;
        }
    },

    deleteMedicalRecord: async (id, token) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este registro médico de forma permanente?')) return;
        
        set({ loading: true });
        const loadingToast = toast.loading('Eliminando registro...');
        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            await axios.delete(`${API_URL}/delete/${id}`, config);
            
            toast.success('Registro médico eliminado.', { id: loadingToast });
            
            set((state) => ({
                records: state.records.filter((rec) => rec._id !== id),
                loading: false
            }));
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error al eliminar el registro.', { id: loadingToast });
            set({ loading: false });
        }
    },

    clearRecords: () => set({ records: [] })
}));