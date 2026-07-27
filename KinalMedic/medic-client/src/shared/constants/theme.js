export const COLORS = {
  primary: "#08316D",
  primaryDark: "#06234f",
  primaryLight: "rgba(8, 49, 109, 0.08)",
  secondary: "#64748b",
  background: "#f8fafc",
  surface: "#ffffff",
  text: "#0f172a",
  textLight: "#64748b",
  error: "#ef4444",
  success: "#22c55e",
  warning: "#f59e0b",
  border: "#e2e8f0",
  available: "#10b981",
  busy: "#ef4444",
  info: "#2563eb",
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  huge: 32,
};

export const SHADOWS = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
};

export const ROLES = {
  PRINCIPAL: "ADMIN_PRINCIPAL",
  ADMIN: "ADMIN_ROLE",
  MEDIC: "ADMIN_ROLE",
  STUDENT: "STUDENT_ROLE",
};

export const isPrincipal = (role) => role === ROLES.PRINCIPAL;
export const isMedic = (role) => role === ROLES.ADMIN || role === ROLES.MEDIC;
export const isStaff = (role) => isPrincipal(role) || isMedic(role);
export const isStudentRole = (role) => role === ROLES.STUDENT;
export const canAccessApp = (role) =>
  isPrincipal(role) || isMedic(role) || isStudentRole(role);

export const roleDisplayLabel = (role) => {
  if (role === ROLES.PRINCIPAL) return "Admin Principal";
  if (role === ROLES.ADMIN || role === ROLES.MEDIC) return "Médico";
  if (role === ROLES.STUDENT) return "Estudiante";
  return role || "N/D";
};

export const CARRERAS = [
  "Informática",
  "Electrónica",
  "Electricidad",
  "Mecánica",
  "Dibujo técnico",
];

export const EDUCATION_LEVELS = [
  { value: "BASICO", label: "Básico" },
  { value: "DIVERSIFICADO", label: "Diversificado" },
];

export const SECCIONES = ["A", "B", "C", "D", "E", "F", "G", "H"];

export const MEDICINE_CATEGORIES = [
  "analgesico",
  "antibiotico",
  "anti inflammatorio",
  "antipirético",
  "otro",
];

export const DOSAGE_FORMS = [
  "tableta",
  "capsula",
  "jarabe",
  "inyección",
  "crema",
  "gotas",
];

export const TEACHER_STATUS = {
  0: { label: "En Enfermería", color: COLORS.info },
  1: { label: "Disponible", color: COLORS.available },
  2: { label: "Ocupado", color: COLORS.busy },
  5: { label: "En el Parqueo / Fuera", color: COLORS.info },
};

export const URGENCY_OPTIONS = [
  { value: "LEVE", label: "Leve", color: COLORS.warning },
  { value: "MODERADA", label: "Moderada", color: "#f97316" },
];
