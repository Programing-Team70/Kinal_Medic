import { createClient } from "./createClient";
import { ENDPOINTS } from "../constants/endpoints";

const authClient = createClient(() => ENDPOINTS.AUTH, 20000);

export const loginRequest = (data) => authClient.post("/login", data);

export const registerRequest = (data) =>
  authClient.post("/register", data);

export const createUserRequest = (data) =>
  authClient.post("/create", data);

export const getAllUsersRequest = async () => {
  const { data } = await authClient.get("/all");
  return { users: data };
};

export const getStudentByCarnetRequest = (carnet) =>
  authClient.get(`/carnet/${encodeURIComponent(carnet)}`);

export const getMyProfileRequest = () => authClient.get("/me");

export const getMedicsRequest = () => authClient.get("/medics");

export const updateUserRequest = (id, data) =>
  authClient.put(`/update/${id}`, data);

export const deleteUserRequest = (id) =>
  authClient.delete(`/delete/${id}`);

export default authClient;
