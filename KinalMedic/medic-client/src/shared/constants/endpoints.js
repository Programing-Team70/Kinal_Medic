import { getApiHost } from "./apiHost";

export function getEndpoints() {
  const host = getApiHost();

  return {
    AUTH:
      process.env.EXPO_PUBLIC_AUTH_URL || `${host}:3001/api/students`,
    ADMIN:
      process.env.EXPO_PUBLIC_ADMIN_URL || `${host}:3001/api/students`,
    MEDICAL:
      process.env.EXPO_PUBLIC_MEDICAL_RECORDS_URL ||
      `${host}:3002/api/records`,
    INVENTORY:
      process.env.EXPO_PUBLIC_INVENTORY_API_URL ||
      `${host}:3003/inv/medicine`,
    AVAILABILITY:
      process.env.EXPO_PUBLIC_AVAILABILITY_URL ||
      `${host}:3004/api/availability`,
    NOTIFICATION:
      process.env.EXPO_PUBLIC_NOTIFICATION_URL ||
      `${host}:3005/api/notifications`,
  };
}

export const ENDPOINTS = {
  get AUTH() {
    return getEndpoints().AUTH;
  },
  get ADMIN() {
    return getEndpoints().ADMIN;
  },
  get MEDICAL() {
    return getEndpoints().MEDICAL;
  },
  get INVENTORY() {
    return getEndpoints().INVENTORY;
  },
  get AVAILABILITY() {
    return getEndpoints().AVAILABILITY;
  },
  get NOTIFICATION() {
    return getEndpoints().NOTIFICATION;
  },
};
