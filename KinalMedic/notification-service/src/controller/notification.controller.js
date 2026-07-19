import * as emailService from '../service/email.service.js';
import MedicalRequest from '../models/request.model.js';
import { isStaff } from '../../middlewares/auth.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_URGENCY = ['LEVE', 'MODERADA'];

const normalizeEmails = (value) => {
    if (!value) return [];
    const list = Array.isArray(value) ? value : String(value).split(',');
    return [
        ...new Set(
            list
                .map((e) => String(e || '').trim().toLowerCase())
                .filter((e) => e && EMAIL_REGEX.test(e))
        ),
    ];
};

const buildStudent = (body = {}, user = null) => ({
    name: body.studentName || body.name || user?.name || '',
    carnet: body.studentCarnet || body.carnet || '',
    email: (
        body.studentEmail ||
        body.email ||
        user?.email ||
        ''
    )
        .toString()
        .trim()
        .toLowerCase(),
    educationLevel: body.educationLevel || '',
    carrera: body.carrera || '',
    seccion: body.seccion || '',
    hasAllergies: Boolean(body.hasAllergies),
    allergies: body.allergies || '',
    guardianEmail: body.guardianEmail || '',
});

const buildLocation = (location, body = {}) => {
    const src = location || body.location || {};
    const campusZone =
        src.campusZone || body.campusZone || body.locationZone || '';
    const detail = src.detail || body.locationDetail || '';
    const latitude =
        src.latitude != null
            ? Number(src.latitude)
            : body.latitude != null
              ? Number(body.latitude)
              : null;
    const longitude =
        src.longitude != null
            ? Number(src.longitude)
            : body.longitude != null
              ? Number(body.longitude)
              : null;
    const accuracy =
        src.accuracy != null
            ? Number(src.accuracy)
            : body.accuracy != null
              ? Number(body.accuracy)
              : null;

    if (
        !campusZone &&
        !detail &&
        (latitude == null || Number.isNaN(latitude)) &&
        (longitude == null || Number.isNaN(longitude))
    ) {
        return null;
    }

    const lat = latitude != null && !Number.isNaN(latitude) ? latitude : null;
    const lng =
        longitude != null && !Number.isNaN(longitude) ? longitude : null;

    return {
        campusZone: campusZone?.toString().trim() || '',
        detail: detail?.toString().trim() || '',
        latitude: lat,
        longitude: lng,
        accuracy: accuracy != null && !Number.isNaN(accuracy) ? accuracy : null,
        mapsUrl:
            src.mapsUrl ||
            (lat != null && lng != null
                ? `https://www.google.com/maps?q=${lat},${lng}`
                : null),
        capturedAt: src.capturedAt || body.locationCapturedAt || null,
    };
};

export const requestMedicalHelp = async (req, res) => {
    try {
        const {
            doctorEmail,
            doctorEmails,
            customEmail,
            description,
            urgency = 'LEVE',
        } = req.body;

        const level = String(urgency || 'LEVE').toUpperCase();
        if (!VALID_URGENCY.includes(level)) {
            return res.status(400).json({
                success: false,
                message: 'La urgencia debe ser LEVE o MODERADA.',
            });
        }

        if (!description?.toString().trim() || description.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: 'La descripción es obligatoria (mínimo 10 caracteres).',
            });
        }

        const student = buildStudent(req.body, req.user);
        if (!student.name || !student.carnet) {
            return res.status(400).json({
                success: false,
                message: 'Nombre y carnet del estudiante son obligatorios.',
            });
        }

        const recipients = normalizeEmails([
            ...(doctorEmails || []),
            doctorEmail,
            customEmail,
        ]);

        if (recipients.length === 0) {
            return res.status(400).json({
                success: false,
                message:
                    'Selecciona al menos un médico o escribe un correo de destino válido.',
            });
        }

        const location = buildLocation(req.body.location, req.body);
        const studentId = req.user?.id ? String(req.user.id) : '';

        await emailService.sendMedicalAlert({
            to: recipients,
            student,
            description: description.trim(),
            urgency: level,
            location,
        });

        const saved = await MedicalRequest.create({
            type: 'MEDICAL_HELP',
            status: 'PENDING',
            urgency: level,
            description: description.trim(),
            studentId,
            studentName: student.name,
            studentCarnet: student.carnet,
            studentEmail: student.email,
            guardianEmail: student.guardianEmail || '',
            recipientEmails: recipients,
            location,
        });

        res.status(200).json({
            success: true,
            message: `Alerta ${level.toLowerCase()} enviada a ${recipients.length} destinatario(s). El médico podrá responderte en la app y por correo.`,
            recipients,
            urgency: level,
            location,
            request: saved,
        });
    } catch (error) {
        console.error('Error al enviar alerta:', error);
        res.status(500).json({
            success: false,
            message: 'No se pudo enviar la alerta médica',
            error: error.message,
        });
    }
};

export const requestEmergencyHelp = async (req, res) => {
    try {
        const { doctorEmails, medicEmails, customEmail, note, description } =
            req.body;

        const student = buildStudent(req.body, req.user);
        if (!student.name || !student.carnet) {
            return res.status(400).json({
                success: false,
                message: 'Nombre y carnet del estudiante son obligatorios.',
            });
        }

        const location = buildLocation(req.body.location, req.body);
        if (!location?.campusZone) {
            return res.status(400).json({
                success: false,
                message:
                    'Indica en qué zona del campus te encuentras (obligatorio en emergencia total).',
            });
        }

        const medicList = normalizeEmails([
            ...(doctorEmails || []),
            ...(medicEmails || []),
            customEmail,
        ]);

        const guardian = (student.guardianEmail || '').trim().toLowerCase();
        if (!EMAIL_REGEX.test(guardian) && medicList.length === 0) {
            return res.status(400).json({
                success: false,
                message:
                    'No hay destinatarios. Falta correo del encargado y no hay médicos seleccionados.',
            });
        }

        const noteText = (note || description || '').toString().trim();
        const studentId = req.user?.id ? String(req.user.id) : '';

        await emailService.sendEmergencyAlert({
            medicEmails: medicList,
            guardianEmail: EMAIL_REGEX.test(guardian) ? guardian : null,
            student,
            note: noteText,
            location,
        });

        const totalRecipients = [
            ...new Set([
                ...medicList,
                ...(EMAIL_REGEX.test(guardian) ? [guardian] : []),
            ]),
        ];

        const saved = await MedicalRequest.create({
            type: 'EMERGENCY',
            status: 'PENDING',
            urgency: 'EMERGENCIA',
            description: noteText || 'Emergencia total activada',
            studentId,
            studentName: student.name,
            studentCarnet: student.carnet,
            studentEmail: student.email,
            guardianEmail: EMAIL_REGEX.test(guardian) ? guardian : '',
            recipientEmails: medicList,
            location,
        });

        res.status(200).json({
            success: true,
            message:
                'Emergencia total enviada a médicos y encargado del alumno (con ubicación).',
            recipients: totalRecipients,
            notifiedGuardian: EMAIL_REGEX.test(guardian),
            notifiedMedics: medicList.length,
            location,
            request: saved,
        });
    } catch (error) {
        console.error('Error al enviar emergencia total:', error);
        res.status(500).json({
            success: false,
            message: 'No se pudo enviar la emergencia total',
            error: error.message,
        });
    }
};

export const listRequests = async (req, res) => {
    try {
        const { id, role, email } = req.user || {};
        const userEmail = (email || '').toLowerCase();

        let filter = {};
        if (role === 'STUDENT_ROLE') {
            filter = {
                $or: [
                    { studentId: String(id) },
                    ...(userEmail ? [{ studentEmail: userEmail }] : []),
                ],
            };
        } else if (role === 'ADMIN_ROLE') {
            if (!userEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Tu token no incluye email; no se puede cargar la bandeja.',
                });
            }
            filter = { recipientEmails: userEmail };
        } else if (role === 'ADMIN_PRINCIPAL') {
            filter = {};
        } else {
            return res.status(403).json({
                success: false,
                message: 'No autorizado.',
            });
        }

        const requests = await MedicalRequest.find(filter)
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        res.json({ success: true, requests });
    } catch (error) {
        console.error('listRequests:', error);
        res.status(500).json({
            success: false,
            message: 'No se pudieron listar las solicitudes',
            error: error.message,
        });
    }
};

export const respondToRequest = async (req, res) => {
    try {
        const { id: requestId } = req.params;
        const message = (req.body.message || req.body.response || '')
            .toString()
            .trim();

        if (!message || message.length < 5) {
            return res.status(400).json({
                success: false,
                message: 'La respuesta debe tener al menos 5 caracteres.',
            });
        }

        if (!isStaff(req.user?.role)) {
            return res.status(403).json({
                success: false,
                message: 'Solo el personal médico puede responder solicitudes.',
            });
        }

        const doc = await MedicalRequest.findById(requestId);
        if (!doc) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada.',
            });
        }

        if (req.user.role === 'ADMIN_ROLE') {
            const myEmail = (req.user.email || '').toLowerCase();
            if (!doc.recipientEmails.map((e) => e.toLowerCase()).includes(myEmail)) {
                return res.status(403).json({
                    success: false,
                    message: 'Esta solicitud no está dirigida a tu correo.',
                });
            }
        }

        doc.status = 'RESPONDED';
        doc.response = {
            message,
            doctorId: String(req.user.id || ''),
            doctorName: req.user.name || 'Personal médico',
            doctorEmail: (req.user.email || '').toLowerCase(),
            respondedAt: new Date(),
        };
        await doc.save();

        let emailSent = false;
        let emailError = null;
        try {
            if (doc.studentEmail) {
                await emailService.sendDoctorResponseToStudent({
                    studentEmail: doc.studentEmail,
                    studentName: doc.studentName,
                    doctorName: doc.response.doctorName,
                    doctorEmail: doc.response.doctorEmail,
                    originalDescription: doc.description,
                    responseMessage: message,
                    urgency: doc.urgency,
                });
                emailSent = true;
            }
        } catch (err) {
            emailError = err.message;
            console.warn('No se pudo enviar correo de respuesta:', err.message);
        }

        res.json({
            success: true,
            message: emailSent
                ? 'Respuesta guardada y enviada al correo del estudiante.'
                : emailError
                  ? `Respuesta guardada. Correo no enviado: ${emailError}`
                  : 'Respuesta guardada. El estudiante no tiene correo registrado.',
            request: doc,
            emailSent,
        });
    } catch (error) {
        console.error('respondToRequest:', error);
        res.status(500).json({
            success: false,
            message: 'No se pudo guardar la respuesta',
            error: error.message,
        });
    }
};
