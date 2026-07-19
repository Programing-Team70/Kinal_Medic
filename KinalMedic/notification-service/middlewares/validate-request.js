const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateNotification = (req, res, next) => {
    const {
        doctorEmail,
        doctorEmails,
        customEmail,
        studentName,
        studentCarnet,
        description,
        urgency,
    } = req.body;

    if (!studentName?.toString().trim() || !studentCarnet?.toString().trim()) {
        return res.status(400).json({
            message: 'studentName y studentCarnet son obligatorios.',
        });
    }

    if (!description?.toString().trim() || description.trim().length < 10) {
        return res.status(400).json({
            message: 'La descripción es obligatoria (mínimo 10 caracteres).',
        });
    }

    if (urgency && !['LEVE', 'MODERADA'].includes(String(urgency).toUpperCase())) {
        return res.status(400).json({
            message: 'La urgencia solo puede ser LEVE o MODERADA.',
        });
    }

    const emails = [];
    if (Array.isArray(doctorEmails)) emails.push(...doctorEmails);
    if (doctorEmail) emails.push(doctorEmail);
    if (customEmail) emails.push(customEmail);

    const validEmails = emails
        .map((e) => String(e || '').trim())
        .filter((e) => e && EMAIL_REGEX.test(e));

    if (validEmails.length === 0) {
        return res.status(400).json({
            message:
                'Debes seleccionar al menos un médico o indicar un correo válido de destino.',
        });
    }

    next();
};

export const validateEmergency = (req, res, next) => {
    const {
        studentName,
        studentCarnet,
        guardianEmail,
        doctorEmails,
        medicEmails,
        customEmail,
        location,
        campusZone,
    } = req.body;

    if (!studentName?.toString().trim() || !studentCarnet?.toString().trim()) {
        return res.status(400).json({
            message: 'studentName y studentCarnet son obligatorios.',
        });
    }

    const zone =
        campusZone ||
        location?.campusZone ||
        req.body.locationZone ||
        '';

    if (!String(zone).trim()) {
        return res.status(400).json({
            message:
                'Indica la zona del campus donde te encuentras (campusZone / location.campusZone).',
        });
    }

    const emails = [];
    if (Array.isArray(doctorEmails)) emails.push(...doctorEmails);
    if (Array.isArray(medicEmails)) emails.push(...medicEmails);
    if (customEmail) emails.push(customEmail);
    if (guardianEmail) emails.push(guardianEmail);

    const validEmails = emails
        .map((e) => String(e || '').trim())
        .filter((e) => e && EMAIL_REGEX.test(e));

    if (validEmails.length === 0) {
        return res.status(400).json({
            message:
                'No hay destinatarios válidos. Se requiere correo de encargado o de al menos un médico.',
        });
    }

    next();
};
