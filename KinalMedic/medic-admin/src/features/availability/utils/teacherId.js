/**
 * ID de usuario del médico (JWT / user-student), no el _id del documento Mongo de availability.
 */
export const getTeacherUserId = (teacher) => {
  if (!teacher || typeof teacher !== 'object') return '';
  return String(
    teacher.teacherId ?? teacher.TeacherId ?? ''
  ).trim();
};

/** Comparación estable de IDs (ObjectId, strings, etc.) */
export const sameTeacherId = (a, b) => {
  const left = String(a ?? '').trim().toLowerCase();
  const right = String(b ?? '').trim().toLowerCase();
  if (!left || !right) return false;
  return left === right;
};

/** Key única para React list (preferir teacherId de usuario). */
export const teacherListKey = (teacher, index = 0) => {
  const userId = getTeacherUserId(teacher);
  if (userId) return `teacher-${userId}`;
  const docId = String(teacher?.id ?? teacher?._id ?? teacher?.Id ?? '').trim();
  if (docId) return `doc-${docId}`;
  return `idx-${index}`;
};
