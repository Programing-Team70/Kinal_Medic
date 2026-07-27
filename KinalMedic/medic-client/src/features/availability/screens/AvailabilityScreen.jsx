import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Modal,
  Pressable,
  Switch,
} from "react-native";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  ROLES,
  TEACHER_STATUS,
  isMedic,
} from "../../../shared/constants/theme";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import {
  Badge,
  Card,
  EmptyState,
  LoadingSpinner,
  SectionTitle,
} from "../../../shared/components/Common";
import { useAuthStore } from "../../../shared/store/authStore";
import { useAvailability } from "../hooks/useAvailability";

const sameId = (a, b) => {
  const left = String(a ?? "").trim().toLowerCase();
  const right = String(b ?? "").trim().toLowerCase();
  return Boolean(left) && left === right;
};

const AvailabilityScreen = () => {
  const user = useAuthStore((s) => s.user);
  const isMedicUser = isMedic(user?.role);

  const {
    teachers,
    loading,
    error,
    loadTeachers,
    registerSelf,
    toggleActive,
    updateStatus,
    formatTimeAgo,
    getStatusInfo,
  } = useAvailability();

  const [modalVisible, setModalVisible] = useState(false);
  const [status, setStatus] = useState("1");
  const [location, setLocation] = useState("Clínica / Enfermería");
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const boot = async () => {
      await loadTeachers();
      if (isMedicUser && user?.id && user?.name) {
        await registerSelf({
          name: user.name,
          email: user.email,
          userId: user.id,
        });
      }
    };
    boot();
    const interval = setInterval(loadTeachers, 20000);
    return () => clearInterval(interval);
  }, [loadTeachers, registerSelf, isMedicUser, user?.id, user?.name, user?.email]);

  const myRecord = useMemo(() => {
    if (!user?.id) return null;
    return teachers.find((t) =>
      sameId(t.teacherId || t.TeacherId, user.id)
    );
  }, [teachers, user?.id]);

  const myIsActive =
    myRecord?.isActive === true || myRecord?.IsActive === true;

  const stats = useMemo(() => {
    const active = teachers.filter(
      (t) => t.isActive === true || t.IsActive === true
    ).length;
    return { total: teachers.length, active };
  }, [teachers]);

  const openEditMine = () => {
    if (!myRecord && !user?.name) {
      Alert.alert("Error", "No se encontró tu registro médico");
      return;
    }
    const current =
      myRecord?.currentStatus ?? myRecord?.CurrentStatus ?? 1;
    const loc =
      myRecord?.locationDescription ||
      myRecord?.LocationDescription ||
      "Clínica / Enfermería";
    setStatus(String(current));
    setLocation(loc);
    setModalVisible(true);
  };

  const handleToggle = async (value) => {
    setToggling(true);
    const result = await toggleActive(value);
    setToggling(false);
    if (result.success) {
      Alert.alert("Listo", result.message);
    } else {
      Alert.alert("Error", result.message);
    }
  };

  const handleSave = async () => {
    if (!location.trim()) {
      Alert.alert("Validación", "La ubicación es requerida");
      return;
    }
    setSaving(true);
    const result = await updateStatus(
      user?.name || "Médico",
      status,
      location.trim(),
      true
    );
    setSaving(false);

    if (result.success) {
      setModalVisible(false);
      Alert.alert("Éxito", result.message);
    } else {
      Alert.alert("Error", result.message);
    }
  };

  const renderItem = ({ item }) => {
    const name = item.teacherName || item.TeacherName || "Profesor";
    const teacherId = item.teacherId || item.TeacherId;
    const current = item.currentStatus ?? item.CurrentStatus;
    const isActive = item.isActive === true || item.IsActive === true;
    const loc =
      item.locationDescription || item.LocationDescription || "Sin ubicación";
    const updated = item.lastUpdate || item.LastUpdate;
    const info = getStatusInfo(current, isActive);
    const isMine =
      isMedicUser && user?.id && sameId(teacherId, user.id);

    return (
      <Card style={!isActive ? styles.inactiveCard : undefined}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{name}</Text>
            {isMine ? (
              <Text style={styles.mineLabel}>Tu perfil</Text>
            ) : isMedicUser ? (
              <Text style={styles.otherLabel}>Otro médico</Text>
            ) : null}
          </View>
          <Badge label={info.label} color={info.color} />
        </View>
        <Text style={styles.serviceBadge}>
          {isActive ? "● En servicio" : "○ Fuera de servicio"}
        </Text>
        <Text style={styles.meta}>
          Ubicación: {isActive ? loc : "—"}
        </Text>
        <Text style={styles.meta}>Actualizado: {formatTimeAgo(updated)}</Text>
        {isMine ? (
          <Pressable onPress={openEditMine} style={styles.editBtn}>
            <Text style={styles.editText}>Actualizar mi ubicación</Text>
          </Pressable>
        ) : null}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <SectionTitle
        title="Estado del personal médico"
        subtitle={
          isMedicUser
            ? "Activa tu turno y actualiza tu ubicación"
            : user?.role === ROLES.PRINCIPAL
              ? "Supervisión: consulta el estado de los médicos (sin estado propio)"
              : "Médicos en servicio y su ubicación"
        }
      />

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{stats.total}</Text>
          <Text style={styles.statLabel}>Médicos</Text>
        </View>
        <View style={[styles.statBox, styles.statActive]}>
          <Text style={[styles.statNum, { color: COLORS.available }]}>
            {stats.active}
          </Text>
          <Text style={styles.statLabel}>En servicio</Text>
        </View>
      </View>

      {isMedicUser ? (
        <Card style={styles.controlCard}>
          <Text style={styles.controlTitle}>Mi turno</Text>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.controlText}>
                {myIsActive
                  ? "Estoy disponible para atender"
                  : "No estoy en servicio"}
              </Text>
              <Text style={styles.controlHint}>
                Los alumnos ven este indicador
              </Text>
            </View>
            <Switch
              value={myIsActive}
              onValueChange={handleToggle}
              disabled={toggling}
              trackColor={{ false: "#cbd5e1", true: "#86efac" }}
              thumbColor={myIsActive ? COLORS.available : "#f1f5f9"}
            />
          </View>
          <Button
            title="Actualizar mi ubicación"
            onPress={openEditMine}
            variant="secondary"
            style={styles.initBtn}
          />
        </Card>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading && teachers.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={teachers}
          keyExtractor={(item, index) =>
            String(item.teacherId || item.TeacherId || item.id || index)
          }
          renderItem={renderItem}
          ListEmptyComponent={
            <EmptyState message="Aún no hay médicos registrados" />
          }
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadTeachers} />
          }
          contentContainerStyle={styles.list}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Actualizar mi estado</Text>
            <Text style={styles.teacherLabel}>{user?.name}</Text>

            <Text style={styles.label}>Estado</Text>
            <View style={styles.statusRow}>
              {Object.entries(TEACHER_STATUS).map(([code, info]) => {
                const active = status === code;
                return (
                  <Pressable
                    key={code}
                    onPress={() => setStatus(code)}
                    style={[
                      styles.statusChip,
                      active && {
                        backgroundColor: info.color,
                        borderColor: info.color,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        active && styles.statusTextActive,
                      ]}
                    >
                      {info.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Input
              label="Ubicación / Descripción"
              value={location}
              onChangeText={setLocation}
              placeholder="Clínica / Enfermería"
            />

            <Button
              title={saving ? "Guardando..." : "Guardar"}
              onPress={handleSave}
              loading={saving}
            />
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={() => setModalVisible(false)}
              style={styles.cancelBtn}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    padding: SPACING.md,
  },
  statsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statActive: {
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0",
  },
  statNum: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: "800",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  controlCard: {
    marginBottom: SPACING.md,
  },
  controlTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  controlText: {
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
    color: COLORS.text,
  },
  controlHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    marginTop: 2,
  },
  initBtn: {
    marginTop: SPACING.sm,
  },
  list: {
    paddingBottom: SPACING.xxl,
  },
  inactiveCard: {
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  name: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.primary,
  },
  mineLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.info,
    fontWeight: "700",
    marginTop: 2,
  },
  otherLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    fontWeight: "600",
    marginTop: 2,
  },
  serviceBadge: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "700",
    color: COLORS.secondary,
    marginBottom: 4,
  },
  meta: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
  editBtn: {
    marginTop: SPACING.md,
  },
  editText: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  error: {
    color: COLORS.error,
    marginBottom: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  teacherLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
    fontWeight: "600",
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statusChip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
  },
  statusText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xs,
  },
  statusTextActive: {
    color: COLORS.surface,
    fontWeight: "700",
  },
  cancelBtn: {
    marginTop: SPACING.sm,
  },
});

export default AvailabilityScreen;
