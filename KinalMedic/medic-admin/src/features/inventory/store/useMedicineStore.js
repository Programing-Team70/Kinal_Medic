import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "../../auth/store/authStore"; 

const API_URL = import.meta.env.VITE_INVENTORY_API_URL; 

export const useMedicineStore = create((set, get) => ({
    medicines: [],
    loading: false,
    error: null,

    getAuthHeader: () => {
        const token = useAuthStore.getState().token; 
        
        return token ? { Authorization: `Bearer ${token}` } : {};
    },

    fetchMedicines: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/all`, {
                headers: get().getAuthHeader() 
            });
            set({ medicines: response.data, loading: false }); 
        } catch (err) {
            set({ 
                error: err.response?.data?.message || "Error al cargar el inventario", 
                loading: false 
            });
        }
    },

    addMedicine: async (medicineData) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/add`, medicineData, {
                headers: get().getAuthHeader()
            });
            await get().fetchMedicines();
            set({ loading: false });
            return { success: true, message: response.data.message };
        } catch (err) {
            set({ loading: false });
            return { 
                success: false, 
                message: err.response?.data?.message || "Error al registrar medicamento" 
            };
        }
    },

    updateMedicine: async (id, updatedData) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.put(`${API_URL}/update/${id}`, updatedData, {
                headers: get().getAuthHeader()
            });
            await get().fetchMedicines();
            set({ loading: false });
            return { success: true, message: response.data.message };
        } catch (err) {
            set({ loading: false });
            return { 
                success: false, 
                message: err.response?.data?.message || "Error al actualizar medicamento" 
            };
        }
    },

    deactivateMedicine: async (id) => {
        try {
            const response = await axios.patch(`${API_URL}/deactivate/${id}`, {}, {
                headers: get().getAuthHeader()
            });
            await get().fetchMedicines();
            return { success: true, message: response.data.message };
        } catch (err) {
            return { 
                success: false, 
                message: err.response?.data?.message || "Error al desactivar medicamento" 
            };
        }
    },

    /** Descontar stock al recetar en registro médico */
    consumeStock: async (id, quantity = 1) => {
        try {
            const response = await axios.patch(
                `${API_URL}/consume/${id}`,
                { quantity },
                { headers: get().getAuthHeader() }
            );
            await get().fetchMedicines();
            return { success: true, message: response.data.message, medicine: response.data.medicine };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.message || "Error al descontar stock",
            };
        }
    },
}));