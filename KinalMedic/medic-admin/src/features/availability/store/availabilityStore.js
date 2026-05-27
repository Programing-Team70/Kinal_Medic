import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';
import defaultDoctor from '../../../assets/img/LogoMedic.png';

const API_URL = import.meta.env.VITE_AVAILABILITY_URL;

export const useAvailabilityStore = create((set, get) => ({
    teachers: [],
    loading: true,

    fetchAvailability: async () => {
        try {
            const response = await axios.get(`${API_URL}/all-teachers`);
            set({ teachers: response.data });
        } catch (error) {
            console.error('Error fetching availability:', error);
            toast.error('Error de conexión con el servicio de disponibilidad.');
        } finally {
            set({ loading: false });
        }
    },

    updateTeacherStatus: async (teacherName, inputStatus, inputLocation, token) => {
        const loadingToast = toast.loading('Actualizando estado en el servidor...');
        try {
            if (!token) {
                toast.error('No se detectó un token activo. Por favor reingresa.', { id: loadingToast });
                return false;
            }

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            await axios.post(`${API_URL}/scan-qr`, {
                status: parseInt(inputStatus),
                teacherName: teacherName,
                description: inputLocation
            }, config);

            toast.success('Estado actualizado correctamente', { id: loadingToast });
            await get().fetchAvailability();
            return true;
        } catch (error) {
            console.error('Error actualizando:', error);
            toast.error('No se pudo guardar la actualización.', { id: loadingToast });
            return false;
        }
    },

    // Funciones Utilitarias (Formateadores)
    formatTimeAgo: (dateString) => {
        if (!dateString) return 'Desconocido';
        const now = new Date();
        const updatedTime = new Date(dateString);
        const diffMs = now - updatedTime;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Justo ahora';
        if (diffMins < 60) return `Hace ${diffMins} min`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;

        return updatedTime.toLocaleDateString();
    },

    getStatusBadge: (status) => {
        const current = String(status).toUpperCase();
        switch (current) {
            case '0': case '5': return 'bg-blue-600 text-white shadow-md';
            case '1': return 'bg-emerald-500 text-white shadow-md';
            case '2': return 'bg-red-500 text-white shadow-md';
            default: return 'bg-slate-500 text-white shadow-md';
        }
    },

    getStatusText: (status) => {
        const current = String(status).toUpperCase();
        switch (current) {
            case '0': return 'En Enfermería';
            case '1': return 'Disponible';
            case '2': return 'Ocupado';
            case '5': return 'En el Parqueo / Fuera';
            default: return current.replace('_', ' ');
        }
    },

    getLocalAvatarUrl: (name) => {
        if (!name) return defaultDoctor;
        const formattedName = name.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_');
        return `../../../assets/img/${formattedName}.png`;
    }
}));