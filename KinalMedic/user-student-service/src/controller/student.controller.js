import Student from '../models/student.model.js';
import { removeTeacherAvailability } from '../utils/availabilityCleanup.js';
import {
    ROLES,
    isPrincipal,
    isMedic,
    isStaff,
    CREATABLE_ROLES,
} from '../utils/roles.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_LEVELS = ['BASICO', 'DIVERSIFICADO'];

const sameId = (a, b) => String(a) === String(b);

/**
 * Valida y normaliza el payload de un estudiante o médico.
 * Nunca permite crear ADMIN_PRINCIPAL por API.
 * @returns {{ ok: true, data: object } | { ok: false, message: string }}
 */
const buildStudentPayload = (body, { forceStudentRole = false, allowedRoles = CREATABLE_ROLES } = {}) => {
    const {
        name,
        email,
        password,
        carnet,
        educationLevel,
        carrera,
        seccion,
        hasAllergies,
        allergies,
        guardianEmail,
        emergencyContact,
        role,
        phone,
    } = body;

    if (!name?.trim()) {
        return { ok: false, message: 'El nombre es obligatorio.' };
    }
    if (!email?.trim() || !EMAIL_REGEX.test(email.trim())) {
        return { ok: false, message: 'Correo electrónico inválido o faltante.' };
    }
    if (!password || String(password).length < 6) {
        return { ok: false, message: 'La contraseña es obligatoria (mínimo 6 caracteres).' };
    }

    let finalRole = forceStudentRole
        ? ROLES.STUDENT
        : CREATABLE_ROLES.includes(role)
          ? role
          : ROLES.STUDENT;

    // Nunca se puede crear un segundo ADMIN_PRINCIPAL por API
    if (role === ROLES.PRINCIPAL) {
        return {
            ok: false,
            message: 'No se puede crear un Administrador Principal. Ese rol es único y se genera al iniciar el sistema.',
        };
    }

    if (!forceStudentRole && !allowedRoles.includes(finalRole)) {
        return {
            ok: false,
            message:
                finalRole === ROLES.MEDIC
                    ? 'Solo el Administrador Principal puede crear médicos (ADMIN_ROLE).'
                    : 'No tienes permiso para crear usuarios con ese rol.',
        };
    }

    if (finalRole === ROLES.MEDIC) {
        if (!phone?.trim()) {
            return { ok: false, message: 'El teléfono es obligatorio para médicos.' };
        }
        return {
            ok: true,
            data: {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
                phone: phone.trim(),
                role: ROLES.MEDIC,
            },
        };
    }

    const level = String(educationLevel || '').toUpperCase();
    if (!VALID_LEVELS.includes(level)) {
        return {
            ok: false,
            message: 'Debe indicar el nivel educativo: BASICO o DIVERSIFICADO.',
        };
    }
    if (!carnet?.trim()) {
        return { ok: false, message: 'El carnet es obligatorio para estudiantes.' };
    }
    if (!seccion?.trim()) {
        return { ok: false, message: 'La sección es obligatoria.' };
    }
    if (!guardianEmail?.trim() || !EMAIL_REGEX.test(guardianEmail.trim())) {
        return {
            ok: false,
            message: 'El correo del encargado es obligatorio y debe ser válido.',
        };
    }

    const allergic =
        hasAllergies === true ||
        hasAllergies === 'true' ||
        hasAllergies === 1 ||
        hasAllergies === '1' ||
        hasAllergies === 'si' ||
        hasAllergies === 'sí' ||
        hasAllergies === 'SI';

    if (allergic && !allergies?.trim()) {
        return {
            ok: false,
            message: 'Si el estudiante es alérgico, debe indicar a qué es alérgico.',
        };
    }

    if (level === 'DIVERSIFICADO' && !carrera?.trim()) {
        return {
            ok: false,
            message: 'La carrera es obligatoria cuando el nivel es Diversificado.',
        };
    }

    return {
        ok: true,
        data: {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            carnet: carnet.trim(),
            educationLevel: level,
            carrera: level === 'DIVERSIFICADO' ? carrera.trim() : null,
            seccion: seccion.trim().toUpperCase(),
            hasAllergies: Boolean(allergic),
            allergies: allergic ? allergies.trim() : 'Ninguna',
            guardianEmail: guardianEmail.trim().toLowerCase(),
            emergencyContact: emergencyContact?.trim() || undefined,
            role: ROLES.STUDENT,
        },
    };
};

export const register = async (req, res) => {
    try {
        const result = buildStudentPayload(req.body, { forceStudentRole: true });
        if (!result.ok) {
            return res.status(400).json({ message: result.message });
        }

        const existsEmail = await Student.findOne({ email: result.data.email });
        if (existsEmail) {
            return res.status(409).json({ message: 'Ya existe un usuario con ese correo.' });
        }

        const existsCarnet = await Student.findOne({ carnet: result.data.carnet });
        if (existsCarnet) {
            return res.status(409).json({ message: 'Ya existe un estudiante con ese carnet.' });
        }

        const newStudent = new Student(result.data);
        await newStudent.save();

        res.status(201).json({
            message: 'Registro concretado! Puede iniciar sesión',
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al registrar',
            error: error.message,
        });
    }
};

export const createStudent = async (req, res) => {
    try {
        const actorRole = req.user?.role;

        if (!isStaff(actorRole)) {
            return res.status(403).json({
                message: 'Solo personal autorizado puede crear usuarios.',
            });
        }

        const allowedRoles = isPrincipal(actorRole)
            ? [ROLES.STUDENT, ROLES.MEDIC]
            : [ROLES.STUDENT];

        const body = { ...req.body };
        if (isMedic(actorRole)) {
            body.role = ROLES.STUDENT;
        }

        const result = buildStudentPayload(body, {
            forceStudentRole: isMedic(actorRole),
            allowedRoles,
        });
        if (!result.ok) {
            return res.status(400).json({ message: result.message });
        }

        const existsEmail = await Student.findOne({ email: result.data.email });
        if (existsEmail) {
            return res.status(409).json({ message: 'Ya existe un usuario con ese correo.' });
        }

        if (result.data.carnet) {
            const existsCarnet = await Student.findOne({ carnet: result.data.carnet });
            if (existsCarnet) {
                return res.status(409).json({ message: 'Ya existe un estudiante con ese carnet.' });
            }
        }

        const student = new Student(result.data);
        await student.save();

        const safe = student.toObject();
        delete safe.password;

        res.status(201).json({
            message:
                result.data.role === ROLES.MEDIC
                    ? 'Médico (ADMIN_ROLE) creado por el Administrador Principal'
                    : 'Estudiante creado correctamente',
            student: safe,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear usuario',
            error: error.message,
        });
    }
};

export const getMyProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id).select('-password');
        if (!student) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener perfil' });
    }
};

export const getStudents = async (req, res) => {
    try {
        const actorRole = req.user?.role;
        const actorId = req.user?.id;

        if (!isStaff(actorRole)) {
            return res.status(403).json({ message: 'Acceso denegado.' });
        }

        let filter = {};
        if (isMedic(actorRole)) {
            filter = {
                $or: [
                    { _id: actorId },
                    { role: ROLES.STUDENT },
                ],
            };
        }

        const students = await Student.find(filter).select('-password').sort({ name: 1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Error al listar' });
    }
};

export const getMedics = async (req, res) => {
    try {
        const medics = await Student.find({ role: ROLES.MEDIC })
            .select('name email phone')
            .sort({ name: 1 });

        res.json(
            medics.map((m) => ({
                id: m._id,
                name: m.name,
                email: m.email,
                phone: m.phone || '',
            }))
        );
    } catch (error) {
        res.status(500).json({
            message: 'Error al listar personal médico',
            error: error.message,
        });
    }
};

export const getStudentByCarnet = async (req, res) => {
    try {
        if (!isStaff(req.user?.role)) {
            return res.status(403).json({ message: 'Acceso denegado.' });
        }

        const student = await Student.findOne({
            carnet: req.params.carnet,
            role: ROLES.STUDENT,
        }).select('-password');

        if (!student) return res.status(404).json({ message: 'Estudiante no encontrado' });
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar' });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const loggedInUser = req.user;
        const actorRole = loggedInUser.role;
        const isSelf = sameId(loggedInUser.id, id);

        if (!isPrincipal(actorRole) && !isSelf) {
            return res.status(403).json({
                message: 'No tienes permiso para modificar este perfil.',
            });
        }

        if (isMedic(actorRole) && !isSelf) {
            return res.status(403).json({
                message: 'Como médico solo puedes modificar tu propio perfil.',
            });
        }

        const userToUpdate = await Student.findById(id);
        if (!userToUpdate) return res.status(404).json({ message: 'Usuario no encontrado' });

        const previousRole = userToUpdate.role;
        const updates = { ...req.body };

        if (updates.role === ROLES.PRINCIPAL && previousRole !== ROLES.PRINCIPAL) {
            return res.status(403).json({
                message: 'No se puede asignar el rol ADMIN_PRINCIPAL. Es único del sistema.',
            });
        }

        if (!isPrincipal(actorRole)) {
            delete updates.role;
        } else {
    
            if (isSelf && updates.role && updates.role !== ROLES.PRINCIPAL) {
                return res.status(400).json({
                    message: 'El Administrador Principal no puede cambiar su propio rol.',
                });
            }
            if (previousRole === ROLES.PRINCIPAL && updates.role && updates.role !== ROLES.PRINCIPAL) {
                return res.status(400).json({
                    message: 'No se puede cambiar el rol del Administrador Principal.',
                });
            }
            
            if (updates.role && ![ROLES.STUDENT, ROLES.MEDIC, ROLES.PRINCIPAL].includes(updates.role)) {
                delete updates.role;
            }
            
            if (updates.role === ROLES.PRINCIPAL && previousRole !== ROLES.PRINCIPAL) {
                return res.status(403).json({
                    message: 'Ya existe un Administrador Principal; no se puede asignar ese rol a otro usuario.',
                });
            }
        }

        if (!updates.password || String(updates.password).trim() === '') {
            delete updates.password;
        }

        if (updates.educationLevel) {
            updates.educationLevel = String(updates.educationLevel).toUpperCase();
            if (updates.educationLevel === 'BASICO') {
                updates.carrera = null;
            }
        }
        if (updates.hasAllergies === false || updates.hasAllergies === 'false') {
            updates.hasAllergies = false;
            updates.allergies = 'Ninguna';
        }
        if (updates.hasAllergies === true || updates.hasAllergies === 'true') {
            updates.hasAllergies = true;
        }
        if (updates.guardianEmail) {
            updates.guardianEmail = String(updates.guardianEmail).trim().toLowerCase();
        }
        if (updates.seccion) {
            updates.seccion = String(updates.seccion).trim().toUpperCase();
        }
        if (updates.email) {
            updates.email = String(updates.email).trim().toLowerCase();
        }

        Object.assign(userToUpdate, updates);
        await userToUpdate.save();

        const newRole = userToUpdate.role;
        
        if (previousRole === ROLES.MEDIC && newRole !== ROLES.MEDIC) {
            const authHeader = req.header('Authorization');
            await removeTeacherAvailability(userToUpdate._id.toString(), authHeader);
        }

        const safe = userToUpdate.toObject();
        delete safe.password;

        res.json({ message: 'Datos actualizados correctamente', user: safe });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar', error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const loggedInUser = req.user;

        if (!isPrincipal(loggedInUser.role)) {
            return res.status(403).json({
                message: 'Solo el Administrador Principal puede eliminar usuarios.',
            });
        }

        if (sameId(loggedInUser.id, id)) {
            return res.status(400).json({
                message: 'No puedes eliminar tu propia cuenta mientras estás en sesión.',
            });
        }

        const userToDelete = await Student.findById(id);
        if (!userToDelete) return res.status(404).json({ message: 'Usuario no encontrado' });

        if (userToDelete.role === ROLES.PRINCIPAL) {
            return res.status(403).json({
                message: 'No se puede eliminar al Administrador Principal.',
            });
        }

        const wasMedic = userToDelete.role === ROLES.MEDIC;
        const teacherId = userToDelete._id.toString();

        await Student.findByIdAndDelete(id);

        if (wasMedic) {
            const authHeader = req.header('Authorization');
            await removeTeacherAvailability(teacherId, authHeader);
        }

        res.json({
            message: wasMedic
                ? 'Médico eliminado y estado de profesor removido de disponibilidad.'
                : 'Usuario eliminado con éxito',
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar', error: error.message });
    }
};
