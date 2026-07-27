import { createClient } from "./createClient";
import { ENDPOINTS } from "../constants/endpoints";

const notificationClient = createClient(() => ENDPOINTS.NOTIFICATION, 20000);

export const sendMedicalAlert = (payload) =>
  notificationClient.post("/request-help", payload);

export const sendEmergencyAlert = (payload) =>
  notificationClient.post("/emergency", payload);

export const fetchRequests = () => notificationClient.get("/requests");

export const respondToRequest = (requestId, message) =>
  notificationClient.post(`/requests/${requestId}/respond`, { message });

export default notificationClient;
