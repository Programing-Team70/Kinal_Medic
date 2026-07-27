import { createClient } from "./createClient";
import { ENDPOINTS } from "../constants/endpoints";

const inventoryClient = createClient(() => ENDPOINTS.INVENTORY, 20000);

export const fetchMedicines = () => inventoryClient.get("/all");

export const addMedicine = (data) => inventoryClient.post("/add", data);

export const updateMedicine = (id, data) =>
  inventoryClient.put(`/update/${id}`, data);

export const deactivateMedicine = (id) =>
  inventoryClient.patch(`/deactivate/${id}`, {});

export const consumeStock = (id, quantity = 1) =>
  inventoryClient.patch(`/consume/${id}`, { quantity });

export default inventoryClient;
