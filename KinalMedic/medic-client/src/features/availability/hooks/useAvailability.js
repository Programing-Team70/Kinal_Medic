import { useCallback, useRef, useState } from "react";
import {
  fetchAllTeachers,
  updateTeacherStatus as updateTeacherStatusRequest,
  registerSelfRequest,
  toggleActiveRequest,
} from "../../../shared/api/availabilityClient";
import { getApiErrorMessage } from "../../../shared/api/createClient";
import { TEACHER_STATUS } from "../../../shared/constants/theme";

export const dedupeTeachers = (list = []) => {
  const map = new Map();
  for (const t of list) {
    const key = String(t.teacherId || t.TeacherId || t.id || t._id || "")
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
    return (a.teacherName || a.TeacherName || "").localeCompare(
      b.teacherName || b.TeacherName || ""
    );
  });
};

export const useAvailability = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const registerPromiseRef = useRef(null);

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAllTeachers();
      const list = Array.isArray(response.data) ? response.data : [];
      setTeachers(dedupeTeachers(list));
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Error de conexión con el servicio de disponibilidad."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const registerSelf = useCallback(async ({ name, email, userId } = {}) => {
    const key = String(userId || name || email || "anon");
    if (registerPromiseRef.current?.key === key) {
      return registerPromiseRef.current.promise;
    }

    const promise = (async () => {
      try {
        await registerSelfRequest({ teacherName: name, email });
        await loadTeachers();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          message: getApiErrorMessage(
            err,
            "No se pudo registrar tu perfil médico"
          ),
        };
      } finally {
        if (registerPromiseRef.current?.key === key) {
          registerPromiseRef.current = null;
        }
      }
    })();

    registerPromiseRef.current = { key, promise };
    return promise;
  }, [loadTeachers]);

  const toggleActive = useCallback(
    async (isActive) => {
      try {
        await toggleActiveRequest(isActive);
        await loadTeachers();
        return {
          success: true,
          message: isActive
            ? "Estás activo: los alumnos te verán en servicio."
            : "Estás inactivo: fuera de servicio.",
        };
      } catch (err) {
        return {
          success: false,
          message: getApiErrorMessage(
            err,
            "No se pudo cambiar el estado activo."
          ),
        };
      }
    },
    [loadTeachers]
  );

  const updateStatus = useCallback(
    async (teacherName, inputStatus, inputLocation, isActive) => {
      try {
        const payload = {
          status: parseInt(inputStatus, 10),
          teacherName,
          description: inputLocation,
        };
        if (typeof isActive === "boolean") {
          payload.isActive = isActive;
        }

        await updateTeacherStatusRequest(payload);
        await loadTeachers();

        return { success: true, message: "Estado actualizado correctamente" };
      } catch (err) {
        return {
          success: false,
          message: getApiErrorMessage(
            err,
            "No se pudo guardar la actualización."
          ),
        };
      }
    },
    [loadTeachers]
  );

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Desconocido";
    const now = new Date();
    const updatedTime = new Date(dateString);
    const diffMins = Math.floor((now - updatedTime) / 60000);

    if (diffMins < 1) return "Justo ahora";
    if (diffMins < 60) return `Hace ${diffMins} min`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `Hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
    }
    return updatedTime.toLocaleDateString();
  };

  const getStatusInfo = (status, isActive = true) => {
    if (isActive === false) {
      return { label: "Fuera de servicio", color: "#94a3b8" };
    }
    const key = String(status);
    return (
      TEACHER_STATUS[key] || {
        label: String(status).replace("_", " "),
        color: "#64748b",
      }
    );
  };

  return {
    teachers,
    loading,
    error,
    loadTeachers,
    registerSelf,
    toggleActive,
    updateStatus,
    formatTimeAgo,
    getStatusInfo,
  };
};
