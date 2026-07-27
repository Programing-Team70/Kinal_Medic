import { View, Text, StyleSheet, Alert, Image, ScrollView } from "react-native";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  ROLES,
  isStudentRole,
  roleDisplayLabel,
} from "../../../shared/constants/theme";
import Button from "../../../shared/components/Button";
import { Card, SectionTitle } from "../../../shared/components/Common";
import { useAuthStore } from "../../../shared/store/authStore";

const medicAvatar = require("../../../../assets/img/LogoMedic.png");
const studentAvatar = require("../../../../assets/img/Logo_Estudiante.png");

const ProfileScreen = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const student = isStudentRole(user?.role);
  const avatar = student ? studentAvatar : medicAvatar;

  const roleLabel = roleDisplayLabel(user?.role);
  const areaLabel =
    user?.role === ROLES.PRINCIPAL
      ? "Administración general del sistema"
      : "Enfermería / Personal médico";

  const levelLabel =
    user?.educationLevel === "BASICO"
      ? "Básico"
      : user?.educationLevel === "DIVERSIFICADO"
        ? "Diversificado"
        : "No especificado";

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Deseas salir de Kinal Medic?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <SectionTitle title="Mi Perfil" subtitle="Datos de tu cuenta" />

      <Card style={styles.profileCard}>
        <Image source={avatar} style={styles.avatar} resizeMode="contain" />
        <Text style={styles.name}>{user?.name || "Usuario"}</Text>
        <Text style={styles.role}>{roleLabel}</Text>
      </Card>

      <Card>
        <Text style={styles.rowLabel}>Email</Text>
        <Text style={styles.rowValue}>{user?.email || "N/D"}</Text>

        {student ? (
          <>
            <Text style={styles.rowLabel}>Carnet</Text>
            <Text style={styles.rowValue}>{user?.carnet || "N/D"}</Text>

            <Text style={styles.rowLabel}>Nivel educativo</Text>
            <Text style={styles.rowValue}>{levelLabel}</Text>

            {user?.educationLevel === "DIVERSIFICADO" ? (
              <>
                <Text style={styles.rowLabel}>Carrera</Text>
                <Text style={styles.rowValue}>
                  {user?.carrera || "No especificada"}
                </Text>
              </>
            ) : null}

            <Text style={styles.rowLabel}>Sección</Text>
            <Text style={styles.rowValue}>{user?.seccion || "N/D"}</Text>

            <Text style={styles.rowLabel}>Alergias</Text>
            <Text style={styles.rowValue}>
              {user?.hasAllergies
                ? user?.allergies || "Sí (sin detalle)"
                : "Ninguna"}
            </Text>

            <Text style={styles.rowLabel}>Correo del encargado</Text>
            <Text style={styles.rowValue}>
              {user?.guardianEmail || "No registrado"}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.rowLabel}>Teléfono</Text>
            <Text style={styles.rowValue}>{user?.phone || "N/D"}</Text>
            <Text style={styles.rowLabel}>Área / Departamento</Text>
            <Text style={styles.rowValue}>{areaLabel}</Text>
            <Text style={styles.rowLabel}>Institución</Text>
            <Text style={styles.rowValue}>Fundación Kinal</Text>
          </>
        )}
      </Card>

      <Button
        title="Cerrar sesión"
        variant="danger"
        onPress={handleLogout}
        style={styles.logoutBtn}
      />

      <Text style={styles.version}>Kinal Medic · medic-client v1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  profileCard: {
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 88,
    height: 88,
    marginBottom: SPACING.sm,
  },
  name: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "700",
    color: COLORS.primary,
  },
  role: {
    marginTop: SPACING.xs,
    color: COLORS.secondary,
    fontSize: FONT_SIZE.md,
  },
  rowLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    textTransform: "uppercase",
    fontWeight: "700",
    marginTop: SPACING.sm,
  },
  rowValue: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    marginTop: 2,
  },
  logoutBtn: {
    marginTop: SPACING.lg,
  },
  version: {
    textAlign: "center",
    color: COLORS.textLight,
    marginTop: SPACING.lg,
    fontSize: FONT_SIZE.sm,
  },
});

export default ProfileScreen;
