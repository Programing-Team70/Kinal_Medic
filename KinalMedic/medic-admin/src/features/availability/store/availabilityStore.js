import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';
import defaultDoctor from '../../../assets/img/LogoMedic.png';

const API_URL = import.meta.env.VITE_AVAILABILITY_URL;

const authHeaders = (token) => ({
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
});

/** Un solo registro por teacherId de usuario (nunca mezclar por nombre ni por _id genérico). */
export const dedupeTeachers = (list = []) => {
  const map = new Map();
  for (const t of list) {
    // Preferir solo teacherId (id de usuario). Fallback a id de documento solo si falta.
    const key = String(
      t.teacherId || t.TeacherId || t.id || t._id || ''
    )
      .trim()
      .toLowerCase();
    if (!key) continue;
    const prev = map.get(key);
    if (!prev) {
      map.set(key, t);
      continue;
    }
    const prevActive = prev.isActive === true || prev.IsActive === true;
    const nextActive = t.isActive === true || t.IsActive === true;
    const prevTime = new Date(prev.lastUpdate || prev.LastUpdate || 0).getTime();
    const nextTime = new Date(t.lastUpdate || t.LastUpdate || 0).getTime();
    if (nextActive && !prevActive) {
      map.set(key, t);
    } else if (nextActive === prevActive && nextTime >= prevTime) {
      map.set(key, t);
    }
  }
  return Array.from(map.values()).sort((a, b) => {
    const aActive = a.isActive === true || a.IsActive === true ? 1 : 0;
    const bActive = b.isActive === true || b.IsActive === true ? 1 : 0;
    if (bActive !== aActive) return bActive - aActive;
    const an = (a.teacherName || a.TeacherName || '').localeCompare(
      b.teacherName || b.TeacherName || ''
    );
    return an;
  });
};

// Evita doble register-self por StrictMode, pero por usuario (no bloquea a otro médico)
const registerSelfInFlightByUser = new Map();

export const useAvailabilityStore = create((set, get) => ({
  teachers: [],
  loading: true,

  fetchAvailability: async () => {
    try {
      const response = await axios.get(`${API_URL}/all-teachers`);
      const list = Array.isArray(response.data) ? response.data : [];
      set({ teachers: dedupeTeachers(list) });
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Error de conexión con el servicio de disponibilidad.');
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Auto-registra al médico logueado (teacherId viene del JWT en el backend).
   * No reutiliza el vuelo de otro usuario.
   */
  registerSelf: async (token, { name, email, userId } = {}) => {
    if (!token) return null;
    const flightKey = String(userId || name || email || 'anon').trim();
    if (registerSelfInFlightByUser.has(flightKey)) {
      return registerSelfInFlightByUser.get(flightKey);
    }

    const promise = (async () => {
      try {
        const response = await axios.post(
          `${API_URL}/register-self`,
          { teacherName: name, email },
          authHeaders(token)
        );
        await get().fetchAvailability();
        return response.data?.record || null;
      } catch (error) {
        console.error('registerSelf:', error);
        return null;
      } finally {
        registerSelfInFlightByUser.delete(flightKey);
      }
    })();

    registerSelfInFlightByUser.set(flightKey, promise);
    return promise;
  },

  /** Activa / desactiva el turno del médico autenticado */
  toggleActive: async (isActive, token) => {
    const loadingToast = toast.loading(
      isActive ? 'Activando tu turno...' : 'Desactivando tu turno...'
    );
    try {
      if (!token) {
        toast.error('Sesión no válida. Vuelve a iniciar sesión.', {
          id: loadingToast,
        });
        return false;
      }

      await axios.post(
        `${API_URL}/toggle-active`,
        { isActive },
        authHeaders(token)
      );

      toast.success(
        isActive
          ? 'Estás activo: los alumnos te verán en servicio.'
          : 'Estás inactivo: los alumnos te verán fuera de servicio.',
        { id: loadingToast }
      );

      await get().fetchAvailability();
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'No se pudo cambiar el estado activo.',
        { id: loadingToast }
      );
      return false;
    }
  },

  updateTeacherStatus: async (teacherName, inputStatus, inputLocation, token, isActive) => {
    const loadingToast = toast.loading('Actualizando estado en el servidor...');
    try {
      if (!token) {
        toast.error('No se detectó un token activo. Por favor reingresa.', {
          id: loadingToast,
        });
        return false;
      }

      const payload = {
        status: parseInt(inputStatus, 10),
        teacherName,
        description: inputLocation,
      };
      if (typeof isActive === 'boolean') {
        payload.isActive = isActive;
      }

      await axios.post(`${API_URL}/scan-qr`, payload, authHeaders(token));

      toast.success('Estado actualizado correctamente', { id: loadingToast });
      await get().fetchAvailability();
      return true;
    } catch (error) {
      console.error('Error actualizando:', error);
      toast.error(
        error.response?.data?.message || 'No se pudo guardar la actualización.',
        { id: loadingToast }
      );
      return false;
    }
  },

  formatTimeAgo: (dateString) => {
    if (!dateString) return 'Desconocido';
    const now = new Date();
    const updatedTime = new Date(dateString);
    const diffMs = now - updatedTime;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Justo ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
      return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;

    return updatedTime.toLocaleDateString();
  },

  getStatusBadge: (status, isActive = true) => {
    if (isActive === false) return 'bg-slate-400 text-white shadow-md';
    const current = String(status).toUpperCase();
    switch (current) {
      case '0':
      case '5':
        return 'bg-blue-600 text-white shadow-md';
      case '1':
        return 'bg-emerald-500 text-white shadow-md';
      case '2':
        return 'bg-red-500 text-white shadow-md';
      default:
        return 'bg-slate-500 text-white shadow-md';
    }
  },

  getStatusText: (status, isActive = true) => {
    if (isActive === false) return 'Fuera de servicio';
    const current = String(status).toUpperCase();
    switch (current) {
      case '0':
        return 'En Enfermería';
      case '1':
        return 'Disponible';
      case '2':
        return 'Ocupado';
      case '5':
        return 'En el Parqueo / Fuera';
      default:
        return String(current).replace('_', ' ');
    }
  },

  getLocalAvatarUrl: (name) => {
    if (!name) return defaultDoctor;
    const formattedName = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_');
    return `../../../assets/img/${formattedName}.png`;
  },
}));
