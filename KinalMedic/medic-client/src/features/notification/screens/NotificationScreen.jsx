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
  RefreshControl,
} from "react-native";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  URGENCY_OPTIONS,
  ROLES,
  isStaff,
  isStudentRole,
} from "../../../shared/constants/theme";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import {
  Card,
  SectionTitle,
  LoadingSpinner,
} from "../../../shared/components/Common";
import { useAuthStore } from "../../../shared/store/authStore";
import { useNotification } from "../hooks/useNotification";

const NotificationScreen = () => {
  const user = useAuthStore((s) => s.user);
  const {
    loading,
    respondLoading,
    sendAlert,
    medics,
    medicsLoading,
    profile,
    loadMedics,
    loadProfile,
    loadRequests,
    requests,
    requestsLoading,
    respond,
  } = useNotification();

  const [selectedMedicEmails, setSelectedMedicEmails] = useState([]);
  const [customEmail, setCustomEmail] = useState("");
  const [urgencia, setUrgencia] = useState("LEVE");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [drafts, setDrafts] = useState({});
  const [openId, setOpenId] = useState(null);

  const studentMode = isStudentRole(user?.role);
  const staffMode = isStaff(user?.role);

  useEffect(() => {
    loadRequests();
    if (studentMode) {
      loadMedics();
      loadProfile();
    }
    const t = setInterval(loadRequests, 25000);
    return () => clearInterval(t);
  }, [loadMedics, loadProfile, loadRequests, studentMode, staffMode]);

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

  const toggleMedic = (email) => {
    setSelectedMedicEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const validate = () => {
    const e = {};
    if (!studentMode) e.student = "Solo estudiantes envían solicitudes aquí.";
    if (!student.name || !student.carnet) {
      e.student = "No se pudieron cargar tus datos de alumno.";
    }
    if (!description.trim()) e.description = "La descripción es requerida";
    else if (description.trim().length < 10) {
      e.description = "Mínimo 10 caracteres";
    }
    const hasCustom =
      customEmail.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customEmail.trim());
    if (customEmail.trim() && !hasCustom) e.customEmail = "Correo inválido";
    if (selectedMedicEmails.length === 0 && !hasCustom) {
      e.recipients = "Selecciona un médico o escribe un correo.";
    }
    return e;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const result = await sendAlert({
      studentName: student.name,
      studentCarnet: student.carnet,
      studentEmail: student.email,
      educationLevel: student.educationLevel,
      carrera: student.carrera,
      seccion: student.seccion,
      hasAllergies: student.hasAllergies,
      allergies: student.allergies,
      guardianEmail: student.guardianEmail,
      doctorEmails: selectedMedicEmails,
      customEmail: customEmail.trim() || undefined,
      description: description.trim(),
      urgency: urgencia,
    });
    if (result.success) {
      setDescription("");
      setCustomEmail("");
      setSelectedMedicEmails([]);
      setUrgencia("LEVE");
      setErrors({});
      Alert.alert("Éxito", result.message);
    } else {
      Alert.alert("Error", result.message);
    }
  };

  const handleRespond = async (id) => {
    const message = (drafts[id] || "").trim();
    if (message.length < 5) {
      Alert.alert(
        "Validación",
        "Escribe al menos 5 caracteres (ej. Preséntese a las 4 pm en enfermería)."
      );
      return;
    }
    const result = await respond(id, message);
    if (result.success) {
      Alert.alert("Listo", result.message);
      setDrafts((p) => ({ ...p, [id]: "" }));
      setOpenId(null);
    } else {
      Alert.alert("Error", result.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={requestsLoading}
            onRefresh={loadRequests}
          />
        }
      >
        <SectionTitle
          title="Notificaciones"
          subtitle={
            studentMode
              ? "Solicitudes y respuestas del médico (sin repetir tu ficha; eso está en Perfil)."
              : "Bandeja de solicitudes de alumnos. Responde aquí y se envía al correo del estudiante."
          }
        />

        <Text style={styles.sectionLabel}>
          {staffMode ? "Solicitudes recibidas" : "Mis solicitudes y respuestas"}
        </Text>

        {requestsLoading && requests.length === 0 ? (
          <LoadingSpinner />
        ) : requests.length === 0 ? (
          <Card>
            <Text style={styles.meta}>
              {staffMode
                ? "Aún no hay solicitudes dirigidas a ti."
                : "Aún no has enviado solicitudes."}
            </Text>
          </Card>
        ) : (
          requests.map((req) => {
            const id = req._id;
            const responded = req.status === "RESPONDED" && req.response?.message;
            return (
              <Card key={id} style={styles.requestCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.badge}>
                    {req.type === "EMERGENCY" ? "Emergencia" : "Solicitud"} ·{" "}
                    {req.urgency}
                  </Text>
                  <Text
                    style={[
                      styles.status,
                      req.status === "RESPONDED"
                        ? styles.statusOk
                        : styles.statusPending,
                    ]}
                  >
                    {req.status === "RESPONDED" ? "Respondida" : "Pendiente"}
                  </Text>
                </View>
                {staffMode ? (
                  <Text style={styles.name}>
                    {req.studentName} ({req.studentCarnet})
                  </Text>
                ) : null}
                <Text style={styles.meta}>
                  {req.createdAt
                    ? new Date(req.createdAt).toLocaleString("es-GT")
                    : ""}
                </Text>
                <Text style={styles.desc}>{req.description}</Text>

                {responded ? (
                  <View style={styles.responseBox}>
                    <Text style={styles.responseTitle}>
                      Respuesta del médico
                    </Text>
                    <Text style={styles.responseText}>
                      {req.response.message}
                    </Text>
                    <Text style={styles.meta}>
                      {req.response.doctorName}
                      {req.response.respondedAt
                        ? ` · ${new Date(
                            req.response.respondedAt
                          ).toLocaleString("es-GT")}`
                        : ""}
                    </Text>
                  </View>
                ) : staffMode ? (
                  openId === id ? (
                    <View style={styles.respondBox}>
                      <Input
                        label="Tu respuesta"
                        value={drafts[id] || ""}
                        onChangeText={(v) =>
                          setDrafts((p) => ({ ...p, [id]: v }))
                        }
                        placeholder="Ej. Preséntese a las 4 pm en enfermería"
                        multiline
                      />
                      <Button
                        title={
                          respondLoading ? "Enviando..." : "Enviar respuesta"
                        }
                        onPress={() => handleRespond(id)}
                        loading={respondLoading}
                      />
                      <Button
                        title="Cancelar"
                        variant="secondary"
                        onPress={() => setOpenId(null)}
                      />
                    </View>
                  ) : (
                    <Pressable onPress={() => setOpenId(id)}>
                      <Text style={styles.link}>Responder al estudiante →</Text>
                    </Pressable>
                  )
                ) : (
                  <Text style={styles.waiting}>
                    Esperando respuesta del personal médico…
                  </Text>
                )}
              </Card>
            );
          })
        )}

        {studentMode ? (
          <Card>
            <Text style={styles.formTitle}>Nueva solicitud de asistencia</Text>
            <Text style={styles.hint}>
              Para emergencias graves usa la pestaña Emergencia. Tus datos de
              perfil se envían solos.
            </Text>
            {errors.student ? (
              <Text style={styles.errorText}>{errors.student}</Text>
            ) : null}

            <Text style={styles.label}>Médicos *</Text>
            {medicsLoading ? (
              <Text style={styles.meta}>Cargando médicos...</Text>
            ) : medics.length === 0 ? (
              <Text style={styles.warnText}>
                No hay médicos. Usa correo adicional.
              </Text>
            ) : (
              <View style={styles.optionRow}>
                {medics.map((medic) => {
                  const active = selectedMedicEmails.includes(medic.email);
                  return (
                    <Pressable
                      key={medic.id || medic.email}
                      onPress={() => toggleMedic(medic.email)}
                      style={[styles.medicChip, active && styles.chipActive]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active && styles.chipTextActive,
                        ]}
                      >
                        {medic.name}
                      </Text>
                      <Text
                        style={[
                          styles.medicEmail,
                          active && styles.chipTextActive,
                        ]}
                      >
                        {medic.email}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
            {errors.recipients ? (
              <Text style={styles.errorText}>{errors.recipients}</Text>
            ) : null}

            <Input
              label="Correo adicional (opcional)"
              value={customEmail}
              onChangeText={setCustomEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              error={errors.customEmail}
            />

            <Text style={styles.label}>Nivel de urgencia</Text>
            <View style={styles.urgencyRow}>
              {URGENCY_OPTIONS.map((opt) => {
                const active = urgencia === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setUrgencia(opt.value)}
                    style={[
                      styles.urgencyChip,
                      active && {
                        backgroundColor: opt.color,
                        borderColor: opt.color,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.urgencyText,
                        active && styles.urgencyTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Input
              label="¿Por qué solicitas atención? *"
              value={description}
              onChangeText={(v) => {
                setDescription(v);
                if (errors.description) {
                  setErrors((p) => ({ ...p, description: "" }));
                }
              }}
              placeholder="Describe síntomas (mín. 10 caracteres)"
              multiline
              error={errors.description}
            />

            <Button
              title={loading ? "Enviando..." : "Enviar solicitud médica"}
              onPress={handleSubmit}
              loading={loading}
            />
          </Card>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: "transparent" },
  content: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  sectionLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  requestCard: { marginBottom: SPACING.sm },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  badge: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "800",
    color: COLORS.primary,
    textTransform: "uppercase",
  },
  status: { fontSize: FONT_SIZE.xs, fontWeight: "700" },
  statusOk: { color: "#047857" },
  statusPending: { color: "#b45309" },
  name: { fontWeight: "700", color: COLORS.text, marginTop: 2 },
  meta: { color: COLORS.textLight, fontSize: FONT_SIZE.xs, marginTop: 2 },
  desc: {
    marginTop: SPACING.sm,
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    backgroundColor: "#f8fafc",
    padding: SPACING.sm,
    borderRadius: 8,
  },
  responseBox: {
    marginTop: SPACING.sm,
    backgroundColor: "#ecfdf5",
    borderRadius: 8,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  responseTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "800",
    color: "#047857",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  responseText: {
    color: "#065f46",
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
  },
  waiting: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZE.xs,
    color: "#92400e",
    backgroundColor: "#fffbeb",
    padding: SPACING.sm,
    borderRadius: 8,
  },
  link: {
    marginTop: SPACING.sm,
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: FONT_SIZE.sm,
  },
  respondBox: { marginTop: SPACING.sm },
  formTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  hint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  optionRow: { gap: SPACING.sm, marginBottom: SPACING.md },
  medicChip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: SPACING.sm,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: "700",
  },
  chipTextActive: { color: COLORS.surface },
  medicEmail: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  urgencyRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  urgencyChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    alignItems: "center",
    backgroundColor: COLORS.surface,
  },
  urgencyText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
  },
  urgencyTextActive: { color: COLORS.surface },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.sm,
  },
  warnText: {
    color: "#92400e",
    backgroundColor: "#fffbeb",
    padding: SPACING.sm,
    borderRadius: 8,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm,
  },
});

export default NotificationScreen;
