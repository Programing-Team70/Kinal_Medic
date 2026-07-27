export const CAMPUS_ZONES = [
  "Patio principal",
  "Patio 2",
  "Área de Básicos",
  "Sala de profesores",
  "Reja de salida",
  "Edificio C — Nivel 1",
  "Edificio C — Nivel 2",
  "Edificio C — Nivel 3",
  "Edificio I — Nivel 2",
  "Enfermería / Clínica",
  "Canchas / Deportes",
  "Parqueo",
  "Otro (ver detalle)",
];

export const getDeviceGps = (timeoutMs = 8000) =>
  new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        resolve({
          latitude,
          longitude,
          accuracy,
          mapsUrl: `https://www.google.com/maps?q=${latitude},${longitude}`,
          capturedAt: new Date().toISOString(),
          source: "device-gps",
        });
      },
      () => resolve(null),
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 0,
      }
    );
  });

export const buildLocationPayload = ({ campusZone, detail, gps }) => {
  const payload = {
    campusZone: campusZone || "",
    detail: detail || "",
  };

  if (gps?.latitude != null && gps?.longitude != null) {
    payload.latitude = gps.latitude;
    payload.longitude = gps.longitude;
    payload.accuracy = gps.accuracy ?? null;
    payload.mapsUrl =
      gps.mapsUrl ||
      `https://www.google.com/maps?q=${gps.latitude},${gps.longitude}`;
    payload.capturedAt = gps.capturedAt || new Date().toISOString();
  }

  return payload;
};
