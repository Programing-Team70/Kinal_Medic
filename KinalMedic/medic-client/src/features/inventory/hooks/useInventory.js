import { useCallback, useState } from "react";
import {
  fetchMedicines,
  addMedicine,
  updateMedicine,
  deactivateMedicine,
  consumeStock as consumeStockRequest,
} from "../../../shared/api/inventoryClient";
import { getApiErrorMessage } from "../../../shared/api/createClient";

export const useInventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMedicines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchMedicines();
      setMedicines(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Error al cargar el inventario"));
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(
    async (medicineData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await addMedicine(medicineData);
        await loadMedicines();
        return {
          success: true,
          message: response.data?.message || "Medicamento registrado",
        };
      } catch (err) {
        const message = getApiErrorMessage(
          err,
          "Error al registrar medicamento"
        );
        setError(message);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [loadMedicines]
  );

  const update = useCallback(
    async (id, updatedData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await updateMedicine(id, updatedData);
        await loadMedicines();
        return {
          success: true,
          message: response.data?.message || "Medicamento actualizado",
        };
      } catch (err) {
        const message = getApiErrorMessage(
          err,
          "Error al actualizar medicamento"
        );
        setError(message);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [loadMedicines]
  );

  const deactivate = useCallback(
    async (id) => {
      try {
        const response = await deactivateMedicine(id);
        await loadMedicines();
        return {
          success: true,
          message: response.data?.message || "Medicamento desactivado",
        };
      } catch (err) {
        return {
          success: false,
          message: getApiErrorMessage(
            err,
            "Error al desactivar medicamento"
          ),
        };
      }
    },
    [loadMedicines]
  );

  const consumeStock = useCallback(
    async (id, quantity = 1) => {
      try {
        const response = await consumeStockRequest(id, quantity);
        await loadMedicines();
        return {
          success: true,
          message: response.data?.message || "Stock actualizado",
          medicine: response.data?.medicine,
        };
      } catch (err) {
        return {
          success: false,
          message: getApiErrorMessage(err, "Error al descontar stock"),
        };
      }
    },
    [loadMedicines]
  );

  return {
    medicines,
    loading,
    error,
    loadMedicines,
    create,
    update,
    deactivate,
    consumeStock,
  };
};
