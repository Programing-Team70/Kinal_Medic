import { useCallback, useState } from "react";
import {
  getAllUsersRequest,
  createUserRequest,
  updateUserRequest,
  deleteUserRequest,
} from "../../../shared/api/authClient";
import { getApiErrorMessage } from "../../../shared/api/createClient";

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllUsersRequest();
      const data = response?.users || response;
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Error al cargar usuarios"));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(
    async (formData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await createUserRequest(formData);
        await loadUsers();
        return {
          success: true,
          message:
            response.data?.message || "Usuario registrado correctamente",
        };
      } catch (err) {
        const message = getApiErrorMessage(err, "Error al registrar usuario");
        setError(message);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [loadUsers]
  );

  const updateUser = useCallback(
    async (id, formData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await updateUserRequest(id, formData);
        await loadUsers();
        return {
          success: true,
          message: response.data?.message || "Usuario actualizado",
        };
      } catch (err) {
        const message = getApiErrorMessage(err, "Error al actualizar usuario");
        setError(message);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [loadUsers]
  );

  const deleteUser = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await deleteUserRequest(id);
        await loadUsers();
        return {
          success: true,
          message: response.data?.message || "Usuario eliminado",
        };
      } catch (err) {
        const message = getApiErrorMessage(err, "Error al eliminar usuario");
        setError(message);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [loadUsers]
  );

  return {
    users,
    loading,
    error,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
  };
};
