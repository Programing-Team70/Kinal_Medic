/** Roles del sistema Kinal Medic */
export const ROLES = {
  PRINCIPAL: 'ADMIN_PRINCIPAL',
  MEDIC: 'ADMIN_ROLE',
  STUDENT: 'STUDENT_ROLE',
};

export const isPrincipal = (role) => role === ROLES.PRINCIPAL;
export const isMedic = (role) => role === ROLES.MEDIC;

export const isStaff = (role) => isPrincipal(role) || isMedic(role);
export const isStudent = (role) => role === ROLES.STUDENT;

export const STAFF_ROLES = [ROLES.PRINCIPAL, ROLES.MEDIC];
export const CREATABLE_ROLES = [ROLES.STUDENT, ROLES.MEDIC];
