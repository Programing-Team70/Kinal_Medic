import { useCallback, useState } from "react";
import {
  fetchAllRecords,
  fetchRecordsByCarnet,
  createRecord,
  updateRecord,
  deleteRecord,
} from "../../../shared/api/medicalClient";
import { getApiErrorMessage } from "../../../shared/api/createClient";

export const useMedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAllRecords();
      setRecords(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setRecords([]);
      setError(
        getApiErrorMessage(err, "No se pudo cargar el listado de expedientes.")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const searchByCarnet = useCallback(async (carnet) => {
    if (!carnet?.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchRecordsByCarnet(carnet.trim());
      setRecords(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setRecords([]);
      if (err.response?.status !== 404) {
        setError(
          err.response?.data?.message || "Error al consultar el historial."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (recordData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createRecord(recordData);
      const created = response.data?.record;
      if (created) {
        setRecords((prev) => [created, ...prev]);
      }
      return { success: true, message: "Registro médico guardado." };
    } catch (err) {
      const message = getApiErrorMessage(err, "Error al guardar el registro.");
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id, updatedData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateRecord(id, updatedData);
      const updated = response.data?.updatedRecord;
      setRecords((prev) =>
        prev.map((rec) => (rec._id === id ? updated || rec : rec))
      );
      return { success: true, message: "Registro actualizado correctamente." };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "No tienes permisos o el registro no existe.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteRecord(id);
      setRecords((prev) => prev.filter((rec) => rec._id !== id));
      return { success: true, message: "Registro médico eliminado." };
    } catch (err) {
      const message =
        err.response?.data?.message || "Error al eliminar el registro.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    records,
    loading,
    error,
    loadAll,
    searchByCarnet,
    create,
    update,
    remove,
  };
};
