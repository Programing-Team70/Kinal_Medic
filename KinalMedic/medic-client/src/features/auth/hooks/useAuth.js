import { useState } from "react";
import {
  loginRequest,
  registerRequest,
  getMyProfileRequest,
} from "../../../shared/api/authClient";
import { getApiErrorMessage } from "../../../shared/api/createClient";
import { useAuthStore } from "../../../shared/store/authStore";
import { ROLES, canAccessApp } from "../../../shared/constants/theme";

const mapUser = (data) => {
  const details = data?.userDetails || {};
  const rawId = details.id ?? details._id ?? null;
  const id =
    rawId != null
      ? typeof rawId === "object" && rawId.$oid
        ? String(rawId.$oid)
        : String(rawId)
      : null;

  return {
    id,
    name: details.name || "",
    email: details.email || "",
    carnet: details.carnet || "",
    educationLevel: details.educationLevel || "",
    carrera: details.carrera || null,
    seccion: details.seccion || "",
    hasAllergies: Boolean(details.hasAllergies),
    allergies: details.allergies || "Ninguna",
    guardianEmail: details.guardianEmail || "",
    phone: details.phone || "",
    role: data?.role || details.role || "",
  };
};

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const setSession = useAuthStore((s) => s.setSession);
  const patchUser = useAuthStore((s) => s.patchUser);
  const logoutStore = useAuthStore((s) => s.logout);

  const handleLogin = async (form) => {
    try {
      setLoading(true);
      setError(null);

      const password = form.password;
      const raw =
        form.identifier?.trim() ||
        form.email?.trim() ||
        form.carnet?.trim() ||
        "";

      if (!raw || !password) {
        const message = "Ingresa correo o carnet y la contraseña.";
        setError(message);
        return { success: false, error: message };
      }

      const payload = raw.includes("@")
        ? { email: raw.toLowerCase(), password }
        : { carnet: raw, password };

      const response = await loginRequest(payload);
      const data = response.data;
      const role = data?.role;
      const token = data?.token;

      if (!token) {
        const message = "El servidor no devolvió un token válido.";
        setError(message);
        return { success: false, error: message };
      }

      if (!canAccessApp(role)) {
        const message =
          "No tienes permisos para acceder a esta aplicación";
        setError(message);
        return { success: false, error: message };
      }

      const user = mapUser(data);
      setSession(token, user);

      try {
        const profileRes = await getMyProfileRequest();
        const p = profileRes.data;
        if (p) {
          patchUser({
            id: p._id != null ? String(p._id) : user.id,
            name: p.name ?? user.name,
            email: p.email ?? user.email,
            carnet: p.carnet ?? user.carnet,
            educationLevel: p.educationLevel ?? user.educationLevel,
            carrera: p.carrera ?? user.carrera,
            seccion: p.seccion ?? user.seccion,
            hasAllergies: p.hasAllergies ?? user.hasAllergies,
            allergies: p.allergies ?? user.allergies,
            guardianEmail: p.guardianEmail ?? user.guardianEmail,
            phone: p.phone ?? user.phone,
            role: p.role ?? user.role,
          });
        }
      } catch {
      }

      return { success: true };
    } catch (err) {
      const message = getApiErrorMessage(err, "Error de autenticación");
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        role: ROLES.STUDENT,
      };

      const response = await registerRequest(payload);
      return {
        success: true,
        data: response.data,
        message:
          response.data?.message ||
          "¡Estudiante registrado con éxito! Ya puedes iniciar sesión.",
      };
    } catch (err) {
      const message = getApiErrorMessage(err, "Error al registrar usuario");
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => logoutStore();

  return { handleLogin, handleRegister, loading, error, logout };
};
