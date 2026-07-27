import axios from "axios";
import { createClient } from "./createClient";
import { ENDPOINTS } from "../constants/endpoints";

const availabilityClient = createClient(() => ENDPOINTS.AVAILABILITY, 20000);

export const fetchAllTeachers = () =>
  axios.get(`${ENDPOINTS.AVAILABILITY}/all-teachers`, { timeout: 15000 });

export const updateTeacherStatus = (payload) =>
  availabilityClient.post("/scan-qr", payload);

export const registerSelfRequest = (payload) =>
  availabilityClient.post("/register-self", payload || {});

export const toggleActiveRequest = (isActive) =>
  availabilityClient.post("/toggle-active", { isActive });

export default availabilityClient;
