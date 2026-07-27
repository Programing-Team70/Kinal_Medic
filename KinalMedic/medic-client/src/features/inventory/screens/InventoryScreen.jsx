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
  MEDICINE_CATEGORIES,
  DOSAGE_FORMS,
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
import { useInventory } from "../hooks/useInventory";

const emptyForm = {
  name: "",
  genericName: "",
  description: "",
  category: "analgesico",
  dosageForm: "tableta",
  stock: "",
  expirationDate: "",
};

const InventoryScreen = () => {
  const { medicines, loading, error, loadMedicines, create, update, deactivate } =
    useInventory();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMedicines();
  }, [loadMedicines]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = new Date();

    return medicines.filter((m) => {
      const matchesSearch =
        !q ||
        m.name?.toLowerCase().includes(q) ||
        m.genericName?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (filter === "lowStock") return Number(m.stock) <= 5;
      if (filter === "expiring") {
        if (!m.expirationDate) return false;
        const exp = new Date(m.expirationDate);
        const months =
          (exp.getFullYear() - now.getFullYear()) * 12 +
          (exp.getMonth() - now.getMonth());
        return months >= 0 && months <= 6;
      }
      return true;
    });
  }, [medicines, search, filter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name || "",
      genericName: item.genericName || "",
      description: item.description || "",
      category: item.category || "analgesico",
      dosageForm: item.dosageForm || "tableta",
      stock: String(item.stock ?? ""),
      expirationDate: item.expirationDate
        ? String(item.expirationDate).slice(0, 10)
        : "",
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.genericName.trim()) {
      Alert.alert("Validación", "Nombre y principio activo son obligatorios");
      return;
    }
    if (!form.description.trim()) {
      Alert.alert("Validación", "La descripción es obligatoria");
      return;
    }
    if (!form.expirationDate.trim()) {
      Alert.alert(
        "Validación",
        "La fecha de vencimiento es obligatoria (YYYY-MM-DD)"
      );
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.expirationDate.trim())) {
      Alert.alert(
        "Validación",
        "Usa el formato de fecha YYYY-MM-DD (ej. 2026-12-31)"
      );
      return;
    }
    if (form.stock === "" || Number.isNaN(Number(form.stock))) {
      Alert.alert("Validación", "El stock es obligatorio y debe ser un número");
      return;
    }
    if (Number(form.stock) < 0) {
      Alert.alert("Validación", "El stock no puede ser negativo");
      return;
    }
    if (!form.category || !form.dosageForm) {
      Alert.alert("Validación", "Selecciona categoría y forma farmacéutica");
      return;
    }

    const payload = {
      name: form.name.trim(),
      genericName: form.genericName.trim(),
      description: form.description.trim(),
      category: form.category,
      dosageForm: form.dosageForm,
      stock: Number(form.stock),
      expirationDate: form.expirationDate.trim(),
    };

    setSaving(true);
    const result = editing
      ? await update(editing._id, payload)
      : await create(payload);
    setSaving(false);

    if (result.success) {
      setModalVisible(false);
      Alert.alert("Éxito", result.message);
    } else {
      Alert.alert("Error", result.message);
    }
  };

  const handleDeactivate = (item) => {
    Alert.alert(
      "Desactivar medicamento",
      `¿Desactivar ${item.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desactivar",
          style: "destructive",
          onPress: async () => {
            const result = await deactivate(item._id);
            Alert.alert(
              result.success ? "Éxito" : "Error",
              result.message
            );
          },
        },
      ]
    );
  };

  const Chip = ({ label, value }) => (
    <Pressable
      onPress={() => setFilter(value)}
      style={[styles.chip, filter === value && styles.chipActive]}
    >
      <Text style={[styles.chipText, filter === value && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );

  const OptionChips = ({ options, selected, onSelect }) => (
    <View style={styles.optionRow}>
      {options.map((opt) => {
        const active = selected === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => onSelect(opt)}
            style={[styles.optionChip, active && styles.chipActive]}
          >
            <Text
              style={[styles.chipText, active && styles.chipTextActive]}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const renderItem = ({ item }) => {
    const low = Number(item.stock) <= 5;
    return (
      <Card>
        <View style={styles.cardHeader}>
          <Text style={styles.name}>{item.name}</Text>
          {low ? <Badge label="Stock bajo" color={COLORS.warning} /> : null}
        </View>
        <Text style={styles.meta}>Principio: {item.genericName}</Text>
        <Text style={styles.meta}>
          {item.category} · {item.dosageForm}
        </Text>
        <Text style={styles.meta}>Stock: {item.stock}</Text>
        <Text style={styles.meta}>
          Vence:{" "}
          {item.expirationDate
            ? String(item.expirationDate).slice(0, 10)
            : "N/D"}
        </Text>
        {item.description ? (
          <Text style={styles.desc}>{item.description}</Text>
        ) : null}
        <View style={styles.actions}>
          <Pressable onPress={() => openEdit(item)}>
            <Text style={styles.editText}>Editar</Text>
          </Pressable>
          <Pressable onPress={() => handleDeactivate(item)}>
            <Text style={styles.deleteText}>Desactivar</Text>
          </Pressable>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <SectionTitle
        title="Inventario Médico"
        subtitle="Control de medicamentos de enfermería"
      />

      <Input
        placeholder="Buscar por nombre o principio activo..."
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
      />

      <View style={styles.filters}>
        <Chip label="Todos" value="all" />
        <Chip label="Stock bajo" value="lowStock" />
        <Chip label="Por vencer" value="expiring" />
      </View>

      <Button title="+ Agregar medicamento" onPress={openCreate} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading && medicines.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => item._id || String(index)}
          renderItem={renderItem}
          ListEmptyComponent={
            <EmptyState message="No hay medicamentos en inventario" />
          }
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadMedicines} />
          }
          contentContainerStyle={styles.list}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>
                {editing ? "Editar medicamento" : "Nuevo medicamento"}
              </Text>

              <Input
                label="Nombre comercial *"
                value={form.name}
                onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
              />
              <Input
                label="Principio activo *"
                value={form.genericName}
                onChangeText={(v) =>
                  setForm((p) => ({ ...p, genericName: v }))
                }
              />
              <Input
                label="Descripción *"
                value={form.description}
                onChangeText={(v) =>
                  setForm((p) => ({ ...p, description: v }))
                }
                multiline
              />

              <Text style={styles.label}>Categoría</Text>
              <OptionChips
                options={MEDICINE_CATEGORIES}
                selected={form.category}
                onSelect={(v) => setForm((p) => ({ ...p, category: v }))}
              />

              <Text style={styles.label}>Forma farmacéutica</Text>
              <OptionChips
                options={DOSAGE_FORMS}
                selected={form.dosageForm}
                onSelect={(v) => setForm((p) => ({ ...p, dosageForm: v }))}
              />

              <Input
                label="Stock *"
                value={form.stock}
                onChangeText={(v) => setForm((p) => ({ ...p, stock: v }))}
                keyboardType="numeric"
              />
              <Input
                label="Fecha de vencimiento (YYYY-MM-DD) *"
                value={form.expirationDate}
                onChangeText={(v) =>
                  setForm((p) => ({ ...p, expirationDate: v }))
                }
                placeholder="2026-12-31"
                autoCapitalize="none"
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
  list: {
    paddingBottom: SPACING.xxl,
    paddingTop: SPACING.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  name: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.primary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  meta: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
  desc: {
    marginTop: SPACING.sm,
    color: COLORS.text,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.lg,
    marginTop: SPACING.md,
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
    marginVertical: SPACING.sm,
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
  cancelBtn: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
});

export default InventoryScreen;
