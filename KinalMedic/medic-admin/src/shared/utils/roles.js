/** Roles del sistema Kinal Medic (web) */
export const ROLES = {
  PRINCIPAL: 'ADMIN_PRINCIPAL',
  MEDIC: 'ADMIN_ROLE',
  STUDENT: 'STUDENT_ROLE',
};

export const isPrincipal = (role) => role === ROLES.PRINCIPAL;
export const isMedic = (role) => role === ROLES.MEDIC;
// Desición entre el admin principal y el admin médico
export const isStaff = (role) => isPrincipal(role) || isMedic(role);
export const isStudent = (role) => role === ROLES.STUDENT;

export const canAccessApp = (role) =>
  role === ROLES.PRINCIPAL || role === ROLES.MEDIC || role === ROLES.STUDENT;

export const roleLabel = (role) => {
  if (role === ROLES.PRINCIPAL) return 'Admin Principal';
  if (role === ROLES.MEDIC) return 'Médico';
  if (role === ROLES.STUDENT) return 'Estudiante';
  return role || '—';
};

export const roleBadgeClass = (role) => {
  if (role === ROLES.PRINCIPAL) return 'bg-purple-100 text-purple-800';
  if (role === ROLES.MEDIC) return 'bg-blue-100 text-blue-700';
  if (role === ROLES.STUDENT) return 'bg-green-100 text-green-700';
  return 'bg-gray-100 text-gray-700';
};
