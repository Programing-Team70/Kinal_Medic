import mongoose from 'mongoose';

const studentSnapshotSchema = new mongoose.Schema(
    {
        name: { type: String, default: '' },
        email: { type: String, default: '' },
        educationLevel: { type: String, default: '' },
        carrera: { type: String, default: null },
        seccion: { type: String, default: '' },
        hasAllergies: { type: Boolean, default: false },
        allergies: { type: String, default: 'Ninguna' },
        guardianEmail: { type: String, default: '' },
        phone: { type: String, default: '' },
    },
    { _id: false }
);

const recordSchema = new mongoose.Schema({
    carnet: {
        type: String,
        required: true,
        index: true,
        trim: true,
    },

    student: {
        type: studentSnapshotSchema,
        default: () => ({}),
    },

    description: { type: String, required: true },

    medication: { type: String, default: 'Ninguna' },

    medicationId: { type: String, default: null },
    medicationName: { type: String, default: null },

    vitals: {
        temperature: { type: String, default: 'N/A' },
        bloodPressure: { type: String, default: 'N/A' },
        weight: { type: String, default: 'N/A' },
        height: { type: String, default: 'N/A' },
    },

    date: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model('MedicalRecord', recordSchema);
