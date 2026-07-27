import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  CARRERAS,
  EDUCATION_LEVELS,
  SECCIONES,
  ROLES,
  isPrincipal,
  isMedic,
  roleDisplayLabel,
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
import { useUsers } from "../hooks/useUsers";
import { useAuthStore } from "../../../shared/store/authStore";

const emptyForm = {
  role: ROLES.STUDENT,
  name: "",
  carnet: "",
  educationLevel: "",
  carrera: "",
  seccion: "",
  hasAllergies: false,
  allergies: "",
  guardianEmail: "",
  email: "",
  password: "",
  phone: "",
};

const UsersScreen = () => {
  const currentUser = useAuthStore((s) => s.user);
  const canCreateMedic = isPrincipal(currentUser?.role);
  const canDeleteUsers = isPrincipal(currentUser?.role);
  const canEditAny = isPrincipal(currentUser?.role);
  const {
    users,
    loading,
    error,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
  } = useUsers();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesSearch =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.carnet?.toLowerCase().includes(q) ||
        u.carrera?.toLowerCase().includes(q) ||
        u.seccion?.toLowerCase().includes(q) ||
        u.educationLevel?.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  const isStudentForm = form.role === ROLES.STUDENT;
  const isStaffForm =
    form.role === ROLES.ADMIN || form.role === ROLES.PRINCIPAL;
  const isEdit = Boolean(editing);
  const roleLocked =
    isEdit ||
    !canCreateMedic ||
    form.role === ROLES.PRINCIPAL ||
    editing?.role === ROLES.PRINCIPAL;

  const canEditUser = (u) => {
    if (canEditAny) return true;
    return String(u._id) === String(currentUser?.id);
  };

  const canDeleteUser = (u) => {
    if (!canDeleteUsers) return false;
    if (String(u._id) === String(currentUser?.id)) return false;
    if (u.role === ROLES.PRINCIPAL) return false;
    return true;
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, role: ROLES.STUDENT });
    setModalVisible(true);
  };

  const openEdit = (item) => {
    if (!canEditUser(item)) {
      Alert.alert("Solo lectura", "No puedes editar este usuario.");
      return;
    }
    setEditing(item);
    setForm({
      role: item.role || ROLES.STUDENT,
      name: item.name || "",
      carnet: item.carnet || "",
      educationLevel: item.educationLevel || "",
      carrera: item.carrera || "",
      seccion: item.seccion || "",
      hasAllergies: Boolean(item.hasAllergies),
      allergies: item.allergies || "",
      guardianEmail: item.guardianEmail || "",
      email: item.email || "",
      password: "",
      phone: item.phone || "",
    });
    setModalVisible(true);
  };

  const buildPayload = () => {
    if (isStaffForm) {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
      };
      if (canCreateMedic && form.role === ROLES.ADMIN) {
        payload.role = ROLES.ADMIN;
      }
      if (form.password.trim()) payload.password = form.password.trim();
      return payload;
    }

    const payload = {
      name: form.name.trim(),
      carnet: form.carnet.trim(),
      educationLevel: form.educationLevel,
      seccion: form.seccion,
      hasAllergies: Boolean(form.hasAllergies),
      allergies: form.hasAllergies ? form.allergies.trim() : "Ninguna",
      guardianEmail: form.guardianEmail.trim().toLowerCase(),
      email: form.email.trim().toLowerCase(),
      role: ROLES.STUDENT,
      ...(form.educationLevel === "DIVERSIFICADO"
        ? { carrera: form.carrera }
        : { carrera: null }),
    };
    if (form.password.trim()) payload.password = form.password.trim();
    return payload;
  };

  const validateForm = () => {
    if (!form.name.trim() || !form.email.trim()) {
      Alert.alert("Validación", "Completa nombre y email");
      return false;
    }
    if (!isEdit && !form.password.trim()) {
      Alert.alert("Validación", "La contraseña es obligatoria al crear");
      return false;
    }
    if (form.password.trim() && form.password.length < 6) {
      Alert.alert("Validación", "La contraseña debe tener mínimo 6 caracteres");
      return false;
    }
    if (isStaffForm) {
      if (!form.phone.trim()) {
        Alert.alert("Validación", "El teléfono es obligatorio para personal");
        return false;
      }
      return true;
    }
    if (
      !form.carnet.trim() ||
      !form.educationLevel ||
      !form.seccion ||
      !form.guardianEmail.trim()
    ) {
      Alert.alert(
        "Validación",
        "Completa carnet, nivel, sección y correo del encargado"
      );
      return false;
    }
    if (form.educationLevel === "DIVERSIFICADO" && !form.carrera.trim()) {
      Alert.alert("Validación", "Selecciona la carrera (Diversificado)");
      return false;
    }
    if (form.hasAllergies && !form.allergies.trim()) {
      Alert.alert("Validación", "Indica a qué es alérgico el estudiante");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    const payload = buildPayload();
    if (!isEdit) payload.password = form.password.trim();

    setSaving(true);
    const result = isEdit
      ? await updateUser(editing._id, payload)
      : await createUser(payload);
    setSaving(false);

    if (result.success) {
      setModalVisible(false);
      setEditing(null);
      setForm(emptyForm);
      Alert.alert("Éxito", result.message);
    } else {
      Alert.alert("Error", result.message);
    }
  };

  const handleDelete = (item) => {
    if (!canDeleteUser(item)) {
      Alert.alert(
        "No permitido",
        "Solo el Administrador Principal puede eliminar usuarios."
      );
      return;
    }
    Alert.alert(
      "Eliminar usuario",
      `¿Eliminar a "${item.name}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const result = await deleteUser(item._id);
            if (result.success) {
              Alert.alert("Éxito", result.message);
            } else {
              Alert.alert("Error", result.message);
            }
          },
        },
      ]
    );
  };

  const roleLabel = (role) => roleDisplayLabel(role);

  const levelLabel = (level) => {
    if (level === "BASICO") return "Básico";
    if (level === "DIVERSIFICADO") return "Diversificado";
    return level || "—";
  };

  const renderItem = ({ item }) => (
    <Card>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>
        <Badge
          label={roleLabel(item.role)}
          color={
            item.role === ROLES.PRINCIPAL
              ? "#7c3aed"
              : item.role === ROLES.ADMIN
                ? COLORS.primary
                : COLORS.available
          }
        />
      </View>
      <Text style={styles.meta}>{item.email}</Text>
      {item.carnet ? (
        <Text style={styles.meta}>Carnet: {item.carnet}</Text>
      ) : null}
      {item.educationLevel ? (
        <Text style={styles.meta}>Nivel: {levelLabel(item.educationLevel)}</Text>
      ) : null}
      {item.educationLevel === "DIVERSIFICADO" && item.carrera ? (
        <Text style={styles.meta}>Carrera: {item.carrera}</Text>
      ) : null}
      {item.seccion ? (
        <Text style={styles.meta}>Sección: {item.seccion}</Text>
      ) : null}
      {item.role === ROLES.STUDENT ? (
        <Text style={styles.meta}>
          Alergias: {item.hasAllergies ? item.allergies || "Sí" : "Ninguna"}
        </Text>
      ) : null}
      {item.guardianEmail ? (
        <Text style={styles.meta}>Encargado: {item.guardianEmail}</Text>
      ) : null}

      <View style={styles.actions}>
        {canEditUser(item) ? (
          <Pressable onPress={() => openEdit(item)} style={styles.actionBtn}>
            <Text style={styles.editText}>Editar</Text>
          </Pressable>
        ) : (
          <Text style={styles.readOnly}>Solo lectura</Text>
        )}
        {canDeleteUser(item) ? (
          <Pressable onPress={() => handleDelete(item)} style={styles.actionBtn}>
            <Text style={styles.deleteText}>Eliminar</Text>
          </Pressable>
        ) : null}
      </View>
    </Card>
  );

  const roleFilters = [
    { label: "Todos", value: "all" },
    ...(canCreateMedic
      ? [
          { label: "Principal", value: ROLES.PRINCIPAL },
          { label: "Médicos", value: ROLES.ADMIN },
        ]
      : isMedic(currentUser?.role)
        ? [{ label: "Mi perfil", value: ROLES.ADMIN }]
        : []),
    { label: "Estudiantes", value: ROLES.STUDENT },
  ];

  return (
    <View style={styles.container}>
      <SectionTitle
        title="Usuarios"
        subtitle={
          canCreateMedic
            ? "Admin Principal: crear, editar y eliminar a todos"
            : "Médico: crea alumnos; solo editas tu perfil"
        }
      />

      <Input
        placeholder="Buscar por nombre, email, carnet..."
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
      />

      <View style={styles.filters}>
        {roleFilters.map((f) => (
          <Pressable
            key={f.value}
            onPress={() => setRoleFilter(f.value)}
            style={[styles.chip, roleFilter === f.value && styles.chipActive]}
          >
            <Text
              style={[
                styles.chipText,
                roleFilter === f.value && styles.chipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Button title="+ Crear usuario" onPress={openCreate} style={styles.addBtn} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading && users.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => item._id || String(index)}
          renderItem={renderItem}
          ListEmptyComponent={
            <EmptyState message="No se encontraron usuarios" />
          }
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadUsers} />
          }
          contentContainerStyle={styles.list}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>
                {isEdit ? "Editar usuario" : "Crear usuario"}
              </Text>

              <Text style={styles.label}>Rol</Text>
              {roleLocked || form.role === ROLES.PRINCIPAL ? (
                <View style={[styles.optionChip, styles.chipActive]}>
                  <Text style={[styles.chipText, styles.chipTextActive]}>
                    {roleDisplayLabel(form.role)}
                  </Text>
                </View>
              ) : (
                <View style={styles.optionRow}>
                  {[
                    { value: ROLES.STUDENT, label: "Estudiante" },
                    ...(canCreateMedic
                      ? [{ value: ROLES.ADMIN, label: "Médico" }]
                      : []),
                  ].map((r) => {
                    const active = form.role === r.value;
                    return (
                      <Pressable
                        key={r.value}
                        onPress={() =>
                          setForm((p) => ({ ...p, role: r.value }))
                        }
                        style={[styles.optionChip, active && styles.chipActive]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            active && styles.chipTextActive,
                          ]}
                        >
                          {r.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
              {!canCreateMedic ? (
                <Text style={styles.meta}>
                  Como médico solo puedes registrar estudiantes. Solo el Admin
                  Principal crea médicos.
                </Text>
              ) : null}

              <Input
                label="Nombre completo"
                value={form.name}
                onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
              />
              <Input
                label="Email"
                value={form.email}
                onChangeText={(v) => setForm((p) => ({ ...p, email: v }))}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              {isStudentForm ? (
                <>
                  <Input
                    label="Carnet"
                    value={form.carnet}
                    onChangeText={(v) => setForm((p) => ({ ...p, carnet: v }))}
                    autoCapitalize="none"
                  />

                  <Text style={styles.label}>Nivel educativo</Text>
                  <View style={styles.optionRow}>
                    {EDUCATION_LEVELS.map((lvl) => {
                      const active = form.educationLevel === lvl.value;
                      return (
                        <Pressable
                          key={lvl.value}
                          onPress={() =>
                            setForm((p) => ({
                              ...p,
                              educationLevel: lvl.value,
                              carrera: lvl.value === "BASICO" ? "" : p.carrera,
                            }))
                          }
                          style={[
                            styles.optionChip,
                            active && styles.chipActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              active && styles.chipTextActive,
                            ]}
                          >
                            {lvl.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {form.educationLevel === "DIVERSIFICADO" ? (
                    <>
                      <Text style={styles.label}>Carrera</Text>
                      <View style={styles.optionRow}>
                        {CARRERAS.map((c) => {
                          const active = form.carrera === c;
                          return (
                            <Pressable
                              key={c}
                              onPress={() =>
                                setForm((p) => ({ ...p, carrera: c }))
                              }
                              style={[
                                styles.optionChip,
                                active && styles.chipActive,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.chipText,
                                  active && styles.chipTextActive,
                                ]}
                              >
                                {c}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </>
                  ) : null}

                  <Text style={styles.label}>Sección</Text>
                  <View style={styles.optionRow}>
                    {SECCIONES.map((s) => {
                      const active = form.seccion === s;
                      return (
                        <Pressable
                          key={s}
                          onPress={() => setForm((p) => ({ ...p, seccion: s }))}
                          style={[
                            styles.optionChip,
                            active && styles.chipActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              active && styles.chipTextActive,
                            ]}
                          >
                            {s}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <Text style={styles.label}>¿Es alérgico?</Text>
                  <View style={styles.optionRow}>
                    {[
                      { value: false, label: "No" },
                      { value: true, label: "Sí" },
                    ].map((opt) => {
                      const active = form.hasAllergies === opt.value;
                      return (
                        <Pressable
                          key={String(opt.value)}
                          onPress={() =>
                            setForm((p) => ({
                              ...p,
                              hasAllergies: opt.value,
                              allergies: opt.value ? p.allergies : "",
                            }))
                          }
                          style={[
                            styles.optionChip,
                            active && styles.chipActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              active && styles.chipTextActive,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {form.hasAllergies ? (
                    <Input
                      label="¿A qué es alérgico?"
                      value={form.allergies}
                      onChangeText={(v) =>
                        setForm((p) => ({ ...p, allergies: v }))
                      }
                      placeholder="Ej. Penicilina..."
                    />
                  ) : null}

                  <Input
                    label="Correo del encargado"
                    value={form.guardianEmail}
                    onChangeText={(v) =>
                      setForm((p) => ({ ...p, guardianEmail: v }))
                    }
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </>
              ) : (
                <Input
                  label="Teléfono"
                  value={form.phone}
                  onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))}
                  keyboardType="phone-pad"
                />
              )}

              <Input
                label={
                  isEdit
                    ? "Nueva contraseña (opcional)"
                    : "Contraseña"
                }
                value={form.password}
                onChangeText={(v) => setForm((p) => ({ ...p, password: v }))}
                secureTextEntry
                placeholder={isEdit ? "Dejar vacío para no cambiar" : ""}
              />

              <Button
                title={
                  saving
                    ? "Guardando..."
                    : isEdit
                      ? "Guardar cambios"
                      : "Registrar"
                }
                onPress={handleSave}
                loading={saving}
              />
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={() => {
                  setModalVisible(false);
                  setEditing(null);
                }}
                style={styles.cancelBtn}
              />
            </ScrollView>
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
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    borderRadius: 999,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
  },
  chipTextActive: {
    color: COLORS.surface,
    fontWeight: "700",
  },
  addBtn: {
    marginBottom: SPACING.sm,
  },
  list: {
    paddingBottom: SPACING.xxl,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
    gap: SPACING.sm,
  },
  name: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.primary,
    flex: 1,
  },
  meta: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.lg,
    marginTop: SPACING.md,
  },
  actionBtn: {
    paddingVertical: 4,
  },
  editText: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  readOnly: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    fontStyle: "italic",
  },
  deleteText: {
    color: COLORS.error,
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
    maxHeight: "92%",
    padding: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  optionChip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
  },
  cancelBtn: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
});

export default UsersScreen;
