import { useCallback, useState } from "react";
import {
  sendMedicalAlert,
  sendEmergencyAlert,
  fetchRequests,
  respondToRequest,
} from "../../../shared/api/notificationClient";
import {
  getMedicsRequest,
  getMyProfileRequest,
} from "../../../shared/api/authClient";
import { getApiErrorMessage } from "../../../shared/api/createClient";

export const useNotification = () => {
  const [loading, setLoading] = useState(false);
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [respondLoading, setRespondLoading] = useState(false);
  const [error, setError] = useState(null);
  const [medics, setMedics] = useState([]);
  const [medicsLoading, setMedicsLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const loadMedics = useCallback(async () => {
    setMedicsLoading(true);
    try {
      const response = await getMedicsRequest();
      setMedics(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setMedics([]);
      setError(getApiErrorMessage(err, "No se pudo cargar el personal médico"));
    } finally {
      setMedicsLoading(false);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const response = await getMyProfileRequest();
      setProfile(response.data || null);
      return response.data;
    } catch {
      setProfile(null);
      return null;
    }
  }, []);

  const loadRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const response = await fetchRequests();
      const list = response.data?.requests || response.data || [];
      setRequests(Array.isArray(list) ? list : []);
    } catch {
      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  const sendAlert = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sendMedicalAlert(payload);
      await loadRequests();
      return {
        success: true,
        message:
          response.data?.message || "¡Alerta médica enviada correctamente!",
        data: response.data,
      };
    } catch (err) {
      const message = getApiErrorMessage(err, "No se pudo enviar la alerta médica");
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const sendEmergency = async (payload) => {
    setEmergencyLoading(true);
    setError(null);
    try {
      const response = await sendEmergencyAlert(payload);
      await loadRequests();
      return {
        success: true,
        message:
          response.data?.message ||
          "Emergencia total enviada a médicos y encargado.",
        data: response.data,
      };
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        "No se pudo enviar la emergencia total"
      );
      setError(message);
      return { success: false, message };
    } finally {
      setEmergencyLoading(false);
    }
  };

  const respond = async (requestId, message) => {
    setRespondLoading(true);
    try {
      const response = await respondToRequest(requestId, message);
      await loadRequests();
      return {
        success: true,
        message: response.data?.message || "Respuesta enviada",
      };
    } catch (err) {
      return {
        success: false,
        message: getApiErrorMessage(err, "No se pudo enviar la respuesta"),
      };
    } finally {
      setRespondLoading(false);
    }
  };

  return {
    loading,
    emergencyLoading,
    respondLoading,
    error,
    medics,
    medicsLoading,
    profile,
    requests,
    requestsLoading,
    loadMedics,
    loadProfile,
    loadRequests,
    sendAlert,
    sendEmergency,
    respond,
  };
};
