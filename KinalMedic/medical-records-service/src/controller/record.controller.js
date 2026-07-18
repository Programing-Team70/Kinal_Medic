import MedicalRecord from '../models/record.model.js';

const buildStudentSnapshot = (student = {}) => ({
    name: student.name || '',
    email: student.email || '',
    educationLevel: student.educationLevel || '',
    carrera: student.carrera ?? null,
    seccion: student.seccion || '',
    hasAllergies: Boolean(student.hasAllergies),
    allergies: student.allergies || (student.hasAllergies ? '' : 'Ninguna'),
    guardianEmail: student.guardianEmail || student.emergencyContact || '',
    phone: student.phone || '',
});

const buildVitals = (vitals = {}) => ({
    temperature: vitals.temperature?.toString().trim() || 'N/A',
    bloodPressure: vitals.bloodPressure?.toString().trim() || 'N/A',
    weight: vitals.weight?.toString().trim() || 'N/A',
    height: vitals.height?.toString().trim() || 'N/A',
});

export const addRecord = async (req, res) => {
    try {
        const {
            carnet,
            description,
            medication,
            medicationId,
            medicationName,
            vitals,
            student,
        } = req.body;

        if (!carnet?.toString().trim()) {
            return res.status(400).json({ message: 'El carnet es obligatorio.' });
        }
        if (!description?.toString().trim()) {
            return res.status(400).json({
                message: 'La descripción / motivo de llegada es obligatoria.',
            });
        }

        const medLabel =
            medicationName?.toString().trim() ||
            medication?.toString().trim() ||
            'Ninguna';

        const newRecord = new MedicalRecord({
            carnet: carnet.toString().trim(),
            student: buildStudentSnapshot(student || {}),
            description: description.toString().trim(),
            medication: medLabel,
            medicationId: medicationId || null,
            medicationName: medLabel === 'Ninguna' ? null : medLabel,
            vitals: buildVitals(vitals || {}),
        });

        await newRecord.save();
        res.status(201).json({
            message: 'Registro médico guardado exitosamente en la base de datos',
            record: newRecord,
        });
    } catch (err) {
        res.status(400).json({ message: err.message, error: err.message });
    }
};

export const getByCarnet = async (req, res) => {
    try {
        const { carnet } = req.params;
        const records = await MedicalRecord.find({ carnet }).sort({ date: -1 });

        if (records.length === 0) {
            return res
                .status(404)
                .json({ message: 'No se encontraron registros para este carnet N/A' });
        }

        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllRecords = async (req, res) => {
    try {
        const records = await MedicalRecord.find().sort({ date: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const canManageRecords = (role) =>
    role === 'ADMIN_ROLE' || role === 'ADMIN_PRINCIPAL';

export const updateRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.user;

        if (!canManageRecords(role)) {
            return res.status(403).json({
                message:
                    'Acceso denegado. Solo el personal médico o el Administrador Principal pueden modificar registros.',
            });
        }

        const payload = { ...req.body };

        if (payload.vitals) {
            payload.vitals = buildVitals(payload.vitals);
        }
        if (payload.student) {
            payload.student = buildStudentSnapshot(payload.student);
        }
        if (payload.medicationName) {
            payload.medication = payload.medicationName;
        }

        const updatedRecord = await MedicalRecord.findByIdAndUpdate(id, payload, {
            new: true,
        });
        if (!updatedRecord) {
            return res.status(404).json({ message: 'Registro no encontrado' });
        }

        res.json({
            message: 'Registro actualizado por el Administrador',
            updatedRecord,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.user;

        if (!canManageRecords(role)) {
            return res.status(403).json({
                message:
                    'Acceso denegado. Solo el personal médico o el Administrador Principal pueden eliminar registros.',
            });
        }

        const deletedRecord = await MedicalRecord.findByIdAndDelete(id);
        if (!deletedRecord) {
            return res.status(404).json({ message: 'Registro no encontrado' });
        }

        res.json({ message: 'Registro médico eliminado exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
