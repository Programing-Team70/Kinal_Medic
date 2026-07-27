import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  ROLES,
  isStaff,
  roleDisplayLabel,
} from "../../../shared/constants/theme";
import { useAuthStore } from "../../../shared/store/authStore";

const logo = require("../../../../assets/img/Logo_Enfermeria_Kinal.png");

const PILLARS = [
  {
    icon: "favorite",
    title: "Atención oportuna",
    text: "Conecta con enfermería cuando lo necesites.",
  },
  {
    icon: "folder-shared",
    title: "Historial digital",
    text: "Datos clínicos y alergias para un diagnóstico seguro.",
  },
  {
    icon: "notification-important",
    title: "Emergencias",
    text: "Alertas a médicos y a tu encargado con ubicación.",
  },
  {
    icon: "badge",
    title: "Disponibilidad",
    text: "Mira qué médico está en servicio y dónde está.",
  },
];

const HomeScreen = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const staff = isStaff(user?.role);
  const isPrincipalUser = user?.role === ROLES.PRINCIPAL;
  const roleLabel = roleDisplayLabel(user?.role);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  const shortcuts = staff
    ? [
        {
          key: "Medical",
          label: "Registro médico",
          icon: "medical-services",
          color: "#0284c7",
        },
        {
          key: "Inventory",
          label: "Inventario",
          icon: "inventory",
          color: "#059669",
        },
        {
          key: "Notifications",
          label: "Notificaciones",
          icon: "notifications",
          color: "#d97706",
        },
        {
          key: "Availability",
          label: "Estado",
          icon: "badge",
          color: "#4f46e5",
        },
        {
          key: "Users",
          label: "Usuarios",
          icon: "people",
          color: "#475569",
        },
        {
          key: "Profile",
          label: "Perfil",
          icon: "person",
          color: "#0891b2",
        },
      ]
    : [
        {
          key: "Notifications",
          label: "Notificaciones",
          icon: "notifications",
          color: "#d97706",
        },
        {
          key: "Emergency",
          label: "Emergencia",
          icon: "warning",
          color: "#dc2626",
        },
        {
          key: "Availability",
          label: "Estado médico",
          icon: "badge",
          color: "#4f46e5",
        },
        {
          key: "Profile",
          label: "Mi perfil",
          icon: "person",
          color: "#0891b2",
        },
      ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.heroBlob} />
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>Fundación Kinal · Enfermería</Text>
        </View>

        <Image source={logo} style={styles.logo} resizeMode="contain" />

        <Text style={styles.title}>Kinal Medic</Text>
        <Text style={styles.subtitle}>
          Plataforma de gestión de enfermería institucional: historiales,
          inventario, alertas de emergencia y disponibilidad del personal
          médico.
        </Text>

        <Text style={styles.greeting}>
          {greeting},{" "}
          <Text style={styles.greetingName}>{user?.name || "usuario"}</Text>
        </Text>
        <View style={styles.rolePill}>
          <Text style={styles.rolePillText}>{roleLabel}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>¿Para qué es Kinal Medic?</Text>
      <View style={styles.pillarsGrid}>
        {PILLARS.map((p) => (
          <View key={p.title} style={styles.pillarCard}>
            <View style={styles.pillarIconWrap}>
              <MaterialIcons name={p.icon} size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.pillarTitle}>{p.title}</Text>
            <Text style={styles.pillarText}>{p.text}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Accesos rápidos</Text>
      <View style={styles.shortcutsGrid}>
        {shortcuts.map((s) => (
          <Pressable
            key={s.key}
            style={styles.shortcut}
            onPress={() => navigation.navigate(s.key)}
          >
            <View
              style={[styles.shortcutIcon, { backgroundColor: s.color + "18" }]}
            >
              <MaterialIcons name={s.icon} size={26} color={s.color} />
            </View>
            <Text style={styles.shortcutLabel}>{s.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.roleCard}>
        <Text style={styles.roleCardTitle}>
          {isPrincipalUser
            ? "Como Administrador Principal"
            : staff
              ? "Como personal médico"
              : "Como estudiante"}
        </Text>
        <Text style={styles.roleCardText}>
          {isPrincipalUser
            ? "Control total: crear médicos y alumnos, editar o eliminar usuarios, inventario, registros y notificaciones. No tienes estado de profesor propio."
            : staff
              ? "Registra atenciones, inventario y responde solicitudes. Solo editas tu perfil y tu estado de profesor; en usuarios creas alumnos."
              : "Envía solicitudes en Notificaciones, activa Emergencia si es grave, consulta médicos en servicio y revisa tu perfil."}
        </Text>
      </View>

      <Text style={styles.footer}>Kinal Medic · Salud escolar digital</Text>
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
  hero: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    overflow: "hidden",
    alignItems: "center",
  },
  heroBlob: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: -40,
    right: -40,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#4ade80",
  },
  badgeText: {
    color: "#e0f2fe",
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  logo: {
    height: 72,
    width: 180,
    marginBottom: SPACING.sm,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 16,
  },
  title: {
    fontSize: FONT_SIZE.huge,
    fontWeight: "900",
    color: COLORS.surface,
    letterSpacing: 0.3,
  },
  subtitle: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: "#bfdbfe",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: SPACING.sm,
  },
  greeting: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: "#e0f2fe",
  },
  greetingName: {
    fontWeight: "800",
    color: COLORS.surface,
  },
  rolePill: {
    marginTop: SPACING.sm,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rolePillText: {
    color: COLORS.surface,
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  pillarsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  pillarCard: {
    width: "48%",
    flexGrow: 1,
    minWidth: "45%",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillarIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  pillarTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 4,
  },
  pillarText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    lineHeight: 16,
  },
  shortcutsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  shortcut: {
    width: "31%",
    flexGrow: 1,
    minWidth: "30%",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shortcutIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  shortcutLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },
  roleCard: {
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    marginBottom: SPACING.lg,
  },
  roleCardTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  roleCardText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
    lineHeight: 20,
  },
  footer: {
    textAlign: "center",
    color: COLORS.textLight,
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.md,
  },
});

export default HomeScreen;
