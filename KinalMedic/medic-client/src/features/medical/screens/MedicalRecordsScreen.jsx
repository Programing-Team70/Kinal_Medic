import { useCallback, useEffect, useState } from "react";
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
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import {
  Card,
  EmptyState,
  LoadingSpinner,
  SectionTitle,
} from "../../../shared/components/Common";
import { useMedicalRecords } from "../hooks/useMedicalRecords";
import { useInventory } from "../../inventory/hooks/useInventory";
import { getStudentByCarnetRequest } from "../../../shared/api/authClient";

const emptyForm = {
  carnet: "",
  description: "",
  medicationId: "",
  temperature: "",
  bloodPressure: "",
  weight: "",
  height: "",
};

const levelLabel = (level) => {
  if (level === "BASICO") return "Básico";
  if (level === "DIVERSIFICADO") return "Diversificado";
  return level || "—";
};

const MedicalRecordsScreen = () => {
  const {
    records,
    loading,
    error,
    loadAll,
    searchByCarnet,
    create,
    update,
    remove,
  } = useMedicalRecords();

  const {
    medicines,
    loadMedicines,
    consumeStock,
    loading: loadingMeds,
  } = useInventory();

  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [student, setStudent] = useState(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAll();
    loadMedicines();
  }, [loadAll, loadMedicines]);

  const onRefresh = useCallback(() => {
    if (search.trim()) {
      searchByCarnet(search);
    } else {
      loadAll();
    }
    loadMedicines();
  }, [loadAll, search, searchByCarnet, loadMedicines]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setStudent(null);
    setModalVisible(true);
    loadMedicines();
  };

  const openEdit = (item) => {
    setEditing(item);
    setStudent(item.student || null);
    setForm({
      carnet: item.carnet || "",
      description: item.description || "",
      medicationId: item.medicationId ? String(item.medicationId) : "",
      temperature: item.vitals?.temperature || "",
      bloodPressure: item.vitals?.bloodPressure || "",
      weight: item.vitals?.weight || "",
      height: item.vitals?.height || "",
    });
    setModalVisible(true);
    loadMedicines();
  };

  const handleLookupStudent = async () => {
    const carnet = form.carnet.trim();
    if (!carnet) {
      Alert.alert("Validación", "Ingresa un carnet para buscar");
      return;
    }
    setLookingUp(true);
    setStudent(null);
    try {
      const response = await getStudentByCarnetRequest(carnet);
      const data = response.data;
      if (!data || data.role === "ADMIN_ROLE" || data.role === "ADMIN_PRINCIPAL") {
        Alert.alert("No encontrado", "No hay estudiante con ese carnet");
        return;
      }
      setStudent(data);
      Alert.alert("Estudiante encontrado", data.name);
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message ||
          "No se encontró un estudiante con ese carnet"
      );
    } finally {
      setLookingUp(false);
    }
  };

  const availableMeds = (medicines || []).filter(
    (m) => m.isActive !== false && (m.stock ?? 0) > 0
  );

  const handleSave = async () => {
    if (!form.description.trim()) {
      Alert.alert("Validación", "La descripción es obligatoria");
      return;
    }
    if (!editing && !form.carnet.trim()) {
      Alert.alert("Validación", "El carnet es obligatorio");
      return;
    }
    if (!editing && !student) {
      Alert.alert(
        "Validación",
        "Busca y confirma al estudiante por carnet antes de guardar"
      );
      return;
    }

    const selectedMed = medicines.find(
      (m) => String(m._id) === String(form.medicationId)
    );

    const payload = {
      description: form.description.trim(),
      vitals: {
        temperature: form.temperature.trim() || "N/A",
        bloodPressure: form.bloodPressure.trim() || "N/A",
        weight: form.weight.trim() || "N/A",
        height: form.height.trim() || "N/A",
      },
    };

    if (selectedMed) {
      payload.medicationId = String(selectedMed._id);
      payload.medicationName = selectedMed.name;
      payload.medication = `${selectedMed.name}${
        selectedMed.dosageForm ? ` (${selectedMed.dosageForm})` : ""
      }`;
    } else {
      payload.medication = "Ninguna";
      payload.medicationId = null;
      payload.medicationName = null;
    }

    if (!editing) {
      payload.carnet = form.carnet.trim();
      payload.student = {
        name: student.name,
        email: student.email,
        educationLevel: student.educationLevel,
        carrera: student.carrera,
        seccion: student.seccion,
        hasAllergies: student.hasAllergies,
        allergies: student.allergies,
        guardianEmail: student.guardianEmail,
        phone: student.phone,
      };
    }

    setSaving(true);
    const result = editing
      ? await update(editing._id, payload)
      : await create(payload);
    setSaving(false);

    if (result.success) {
      if (!editing && selectedMed?._id) {
        const stockResult = await consumeStock(selectedMed._id, 1);
        if (!stockResult.success) {
          Alert.alert(
            "Aviso",
            stockResult.message ||
              "Registro guardado, pero no se pudo descontar el stock."
          );
        }
      }
      setModalVisible(false);
      Alert.alert("Éxito", result.message);
    } else {
      Alert.alert("Error", result.message);
    }
  };

  const handleDelete = (item) => {
    Alert.alert(
      "Eliminar registro",
      "¿Estás seguro de eliminar este registro médico de forma permanente?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const result = await remove(item._id);
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

  const formatDate = (date) => {
    if (!date) return "Sin fecha";
    try {
      return new Date(date).toLocaleString("es-GT");
    } catch {
      return String(date);
    }
  };

  const renderItem = ({ item }) => (
    <Card>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.carnet}>Carnet: {item.carnet}</Text>
          {item.student?.name ? (
            <Text style={styles.studentName}>{item.student.name}</Text>
          ) : null}
        </View>
        <Text style={styles.date}>{formatDate(item.date)}</Text>
      </View>
      <Text style={styles.description}>{item.description}</Text>
      {item.medication ? (
        <Text style={styles.meta}>Medicamento: {item.medication}</Text>
      ) : null}
      {item.student?.hasAllergies ? (
        <Text style={[styles.meta, styles.allergy]}>
          Alergias: {item.student.allergies || "Sí"}
        </Text>
      ) : null}
      {item.student?.guardianEmail ? (
        <Text style={styles.meta}>
          Encargado: {item.student.guardianEmail}
        </Text>
      ) : null}
      <Text style={styles.meta}>
        Signos: T° {item.vitals?.temperature || "-"} | PA{" "}
        {item.vitals?.bloodPressure || "-"} | Peso {item.vitals?.weight || "-"}{" "}
        | Altura {item.vitals?.height || "-"}
      </Text>
      <View style={styles.actions}>
        <Pressable onPress={() => openEdit(item)} style={styles.actionBtn}>
          <Text style={styles.editText}>Editar</Text>
        </Pressable>
        <Pressable onPress={() => handleDelete(item)} style={styles.actionBtn}>
          <Text style={styles.deleteText}>Eliminar</Text>
        </Pressable>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <SectionTitle
        title="Registro Médico"
        subtitle="Consulta y gestiona expedientes clínicos"
      />

      <View style={styles.searchRow}>
        <View style={styles.searchInput}>
          <Input
            placeholder="Buscar por carnet..."
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.searchActions}>
          <Button
            title="Buscar"
            onPress={() => searchByCarnet(search)}
            style={styles.smallBtn}
          />
          <Button
            title="Todos"
            variant="secondary"
            onPress={() => {
              setSearch("");
              loadAll();
            }}
            style={styles.smallBtn}
          />
        </View>
      </View>

      <Button
        title="+ Nuevo registro"
        onPress={openCreate}
        style={styles.addBtn}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading && records.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item, index) => item._id || String(index)}
          renderItem={renderItem}
          ListEmptyComponent={
            <EmptyState message="No hay registros médicos" />
          }
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.list}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>
                {editing ? "Editar registro" : "Nuevo registro médico"}
              </Text>

              {!editing ? (
                <>
                  <Input
                    label="Carnet"
                    value={form.carnet}
                    onChangeText={(v) => {
                      setForm((p) => ({ ...p, carnet: v }));
                      setStudent(null);
                    }}
                    placeholder="2021411"
                    autoCapitalize="none"
                  />
                  <Button
                    title={lookingUp ? "Buscando..." : "Buscar estudiante"}
                    onPress={handleLookupStudent}
                    loading={lookingUp}
                    variant="secondary"
                    style={styles.lookupBtn}
                  />
                </>
              ) : null}

              {student ? (
                <View style={styles.studentCard}>
                  <Text style={styles.studentCardTitle}>
                    Datos del estudiante
                  </Text>
                  <Text style={styles.studentLine}>
                    Nombre: {student.name || "—"}
                  </Text>
                  <Text style={styles.studentLine}>
                    Nivel: {levelLabel(student.educationLevel)}
                  </Text>
                  <Text style={styles.studentLine}>
                    Carrera:{" "}
                    {student.educationLevel === "BASICO"
                      ? "N/A (Básico)"
                      : student.carrera || "—"}
                  </Text>
                  <Text style={styles.studentLine}>
                    Sección: {student.seccion || "—"}
                  </Text>
                  <Text
                    style={[
                      styles.studentLine,
                      student.hasAllergies && styles.allergy,
                    ]}
                  >
                    Alergias:{" "}
                    {student.hasAllergies
                      ? student.allergies || "Sí"
                      : "Ninguna"}
                  </Text>
                  <Text style={styles.studentLine}>
                    Encargado: {student.guardianEmail || "—"}
                  </Text>
                  <Text style={styles.studentLine}>
                    Email: {student.email || "—"}
                  </Text>
                </View>
              ) : null}

              <Input
                label="Motivo de llegada / Descripción *"
                value={form.description}
                onChangeText={(v) =>
                  setForm((p) => ({ ...p, description: v }))
                }
                placeholder="¿Por qué llegó a enfermería?"
                multiline
              />

              <Text style={styles.label}>Medicamento (Inventario)</Text>
              <View style={styles.optionRow}>
                <Pressable
                  onPress={() => setForm((p) => ({ ...p, medicationId: "" }))}
                  style={[
                    styles.optionChip,
                    !form.medicationId && styles.chipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      !form.medicationId && styles.chipTextActive,
                    ]}
                  >
                    Ninguna
                  </Text>
                </Pressable>
                {loadingMeds ? (
                  <Text style={styles.meta}>Cargando inventario...</Text>
                ) : (
                  availableMeds.map((med) => {
                    const active =
                      String(form.medicationId) === String(med._id);
                    return (
                      <Pressable
                        key={med._id}
                        onPress={() =>
                          setForm((p) => ({
                            ...p,
                            medicationId: String(med._id),
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
                          {med.name} ({med.stock})
                        </Text>
                      </Pressable>
                    );
                  })
                )}
              </View>

              <Input
                label="Temperatura"
                value={form.temperature}
                onChangeText={(v) =>
                  setForm((p) => ({ ...p, temperature: v }))
                }
                placeholder="Ej. 36.5 °C"
              />
              <Input
                label="Presión arterial"
                value={form.bloodPressure}
                onChangeText={(v) =>
                  setForm((p) => ({ ...p, bloodPressure: v }))
                }
                placeholder="Ej. 120/80"
              />
              <Input
                label="Peso"
                value={form.weight}
                onChangeText={(v) => setForm((p) => ({ ...p, weight: v }))}
                placeholder="Ej. 65 kg"
              />
              <Input
                label="Altura"
                value={form.height}
                onChangeText={(v) => setForm((p) => ({ ...p, height: v }))}
                placeholder="Ej. 1.70 m"
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
  searchRow: {
    marginBottom: SPACING.sm,
  },
  searchInput: {
    marginBottom: -SPACING.sm,
  },
  searchActions: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  smallBtn: {
    flex: 1,
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
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  carnet: {
    fontWeight: "700",
    color: COLORS.primary,
    fontSize: FONT_SIZE.md,
  },
  studentName: {
    fontWeight: "600",
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
  date: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.xs,
  },
  description: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.xs,
  },
  meta: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
  allergy: {
    color: COLORS.error,
    fontWeight: "600",
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
  lookupBtn: {
    marginBottom: SPACING.md,
  },
  studentCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  studentCardTitle: {
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    textTransform: "uppercase",
  },
  studentLine: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
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
  cancelBtn: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
});

export default MedicalRecordsScreen;
