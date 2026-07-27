import { createClient } from "./createClient";
import { ENDPOINTS } from "../constants/endpoints";

const medicalClient = createClient(() => ENDPOINTS.MEDICAL, 20000);

export const fetchAllRecords = () => medicalClient.get("/all");

export const fetchRecordsByCarnet = (carnet) =>
  medicalClient.get(`/${carnet}`);

export const createRecord = (recordData) =>
  medicalClient.post("/add", recordData);

export const updateRecord = (id, data) =>
  medicalClient.put(`/update/${id}`, data);

export const deleteRecord = (id) => medicalClient.delete(`/delete/${id}`);

export default medicalClient;
