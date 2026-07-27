import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  ROLES,
} from "../../../shared/constants/theme";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import { Card, SectionTitle } from "../../../shared/components/Common";
import { useAuthStore } from "../../../shared/store/authStore";
import { useNotification } from "../hooks/useNotification";
import {
  CAMPUS_ZONES,
  getDeviceGps,
  buildLocationPayload,
} from "../../../shared/utils/location";

const EMERGENCY_COOLDOWN_MS = 60_000;

const EmergencyScreen = () => {
  const user = useAuthStore((s) => s.user);
  const {
    emergencyLoading,
    sendEmergency,
    medics,
    loadMedics,
    loadProfile,
    profile,
  } = useNotification();

  const [campusZone, setCampusZone] = useState("");
  const [locationDetail, setLocationDetail] = useState("");
  const [note, setNote] = useState("");
  const [gps, setGps] = useState(null);
  const [gpsStatus, setGpsStatus] = useState("idle");
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());

  const isStudent = user?.role === ROLES.STUDENT;

  useEffect(() => {
    if (isStudent) {
      loadMedics();
      loadProfile();
    }
  }, [isStudent, loadMedics, loadProfile]);

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const student = useMemo(() => {
    const src = profile || user || {};
    return {
      name: src.name || user?.name || "",
      carnet: src.carnet || user?.carnet || "",
      email: src.email || user?.email || "",
      educationLevel: src.educationLevel || user?.educationLevel || "",
      carrera: src.carrera || user?.carrera || "",
      seccion: src.seccion || user?.seccion || "",
      hasAllergies: src.hasAllergies ?? user?.hasAllergies ?? false,
      allergies: src.allergies || user?.allergies || "",
      guardianEmail: src.guardianEmail || user?.guardianEmail || "",
    };
  }, [profile, user]);

  const cooldownLeft = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));

  const captureGps = async () => {
    setGpsStatus("loading");
    const result = await getDeviceGps(8000);
    if (result) {
      setGps(result);
      setGpsStatus("ok");
    } else {
      setGps(null);
      setGpsStatus("denied");
    }
    return result;
  };

  const handleEmergency = () => {
    if (!isStudent) {
      Alert.alert("No permitido", "Solo estudiantes pueden usar emergencia.");
      return;
    }
    if (!student.name || !student.carnet) {
      Alert.alert("Error", "No se pudieron cargar tus datos.");
      return;
    }
    if (cooldownLeft > 0) {
      Alert.alert("Espera", `Podrás enviar otra emergencia en ${cooldownLeft}s.`);
      return;
    }
    if (!campusZone) {
      Alert.alert(
        "Ubicación requerida",
        "Selecciona en qué zona del campus te encuentras."
      );
      return;
    }

    captureGps();

    Alert.alert(
      "¿Confirmar emergencia total?",
      `Zona: ${campusZone}\nMédicos: ${medics.length}\nEncargado: ${
        student.guardianEmail || "no registrado"
      }`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Enviar emergencia",
          style: "destructive",
          onPress: async () => {
            let currentGps = gps;
            if (!currentGps) currentGps = await captureGps();
            const location = buildLocationPayload({
              campusZone,
              detail: locationDetail.trim(),
              gps: currentGps,
            });
            const allMedicEmails = [
              ...new Set(medics.map((m) => m.email).filter(Boolean)),
            ];
            const result = await sendEmergency({
              studentName: student.name,
              studentCarnet: student.carnet,
              studentEmail: student.email,
              educationLevel: student.educationLevel,
              carrera: student.carrera,
              seccion: student.seccion,
              hasAllergies: student.hasAllergies,
              allergies: student.allergies,
              guardianEmail: student.guardianEmail,
              doctorEmails: allMedicEmails,
              note: note.trim() || undefined,
              location,
            });
            if (result.success) {
              setCooldownUntil(Date.now() + EMERGENCY_COOLDOWN_MS);
              Alert.alert("Emergencia enviada", result.message);
            } else {
              Alert.alert("Error", result.message);
            }
          },
        },
      ]
    );
  };

  if (!isStudent) {
    return (
      <View style={styles.container}>
        <SectionTitle
          title="Emergencia"
          subtitle="Solo disponible para estudiantes"
        />
        <Card>
          <Text style={styles.warnText}>
            Como personal médico, revisa las emergencias en Notificaciones.
          </Text>
        </Card>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <SectionTitle
          title="Emergencia"
          subtitle="Solo para casos graves. Tus datos salen del perfil."
        />

        <Card style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>🚨 Emergencia total</Text>
          <Text style={styles.emergencyText}>
            Indica dónde estás. Se notifica a médicos y encargado con zona y GPS.
          </Text>

          <Text style={styles.label}>¿En qué zona del campus estás? *</Text>
          <View style={styles.optionRow}>
            {CAMPUS_ZONES.map((zone) => {
              const active = campusZone === zone;
              return (
                <Pressable
                  key={zone}
                  onPress={() => setCampusZone(zone)}
                  style={[styles.zoneChip, active && styles.zoneChipActive]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {zone}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Input
            label="Detalle de ubicación (opcional)"
            value={locationDetail}
            onChangeText={setLocationDetail}
            placeholder="Ej. gradas del Edificio C..."
          />

          <Input
            label="Nota breve (opcional)"
            value={note}
            onChangeText={setNote}
            placeholder="Qué está pasando..."
            multiline
          />

          <Button
            title={
              gpsStatus === "loading" ? "Obteniendo GPS..." : "Actualizar GPS"
            }
            onPress={captureGps}
            variant="secondary"
            loading={gpsStatus === "loading"}
          />
          {gpsStatus === "ok" && gps ? (
            <Text style={styles.gpsOk}>
              GPS listo (±{Math.round(gps.accuracy || 0)} m)
            </Text>
          ) : null}
          {gpsStatus === "denied" ? (
            <Text style={styles.gpsDenied}>
              GPS no disponible. Se enviará la zona del campus.
            </Text>
          ) : null}

          <Button
            title={
              emergencyLoading
                ? "Enviando..."
                : cooldownLeft > 0
                  ? `Espera ${cooldownLeft}s`
                  : "EMERGENCIA TOTAL"
            }
            onPress={handleEmergency}
            loading={emergencyLoading}
            disabled={cooldownLeft > 0}
            style={styles.emergencyBtn}
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: "transparent" },
  content: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  emergencyCard: {
    borderColor: "#fca5a5",
    backgroundColor: "#fef2f2",
  },
  emergencyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "800",
    color: COLORS.error,
    marginBottom: SPACING.xs,
  },
  emergencyText: {
    color: "#7f1d1d",
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.md,
  },
  emergencyBtn: {
    backgroundColor: COLORS.error,
    marginTop: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  optionRow: { gap: SPACING.sm, marginBottom: SPACING.md },
  zoneChip: {
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: COLORS.surface,
    borderRadius: 999,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
  },
  zoneChipActive: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  chipText: { color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: "700" },
  chipTextActive: { color: COLORS.surface },
  gpsOk: {
    color: "#15803d",
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
    marginBottom: SPACING.sm,
  },
  gpsDenied: {
    color: "#92400e",
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm,
  },
  warnText: {
    color: "#92400e",
    backgroundColor: "#fffbeb",
    padding: SPACING.sm,
    borderRadius: 8,
    fontSize: FONT_SIZE.sm,
  },
});

export default EmergencyScreen;
