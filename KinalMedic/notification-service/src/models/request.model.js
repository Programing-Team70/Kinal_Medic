import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema(
    {
        message: { type: String, required: true },
        doctorId: { type: String, default: '' },
        doctorName: { type: String, default: '' },
        doctorEmail: { type: String, default: '' },
        respondedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const locationSchema = new mongoose.Schema(
    {
        campusZone: { type: String, default: '' },
        detail: { type: String, default: '' },
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null },
        accuracy: { type: Number, default: null },
        mapsUrl: { type: String, default: null },
        capturedAt: { type: Date, default: null },
    },
    { _id: false }
);

const requestSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['MEDICAL_HELP', 'EMERGENCY'],
            required: true,
        },
        status: {
            type: String,
            enum: ['PENDING', 'RESPONDED'],
            default: 'PENDING',
        },
        urgency: {
            type: String,
            enum: ['LEVE', 'MODERADA', 'EMERGENCIA'],
            default: 'LEVE',
        },
        description: { type: String, default: '' },

        studentId: { type: String, index: true, default: '' },
        studentName: { type: String, required: true },
        studentCarnet: { type: String, required: true, index: true },
        studentEmail: { type: String, default: '', index: true },
        guardianEmail: { type: String, default: '' },

        recipientEmails: {
            type: [String],
            default: [],
            index: true,
        },

        location: { type: locationSchema, default: null },

        response: { type: responseSchema, default: null },
    },
    { timestamps: true, versionKey: false }
);

requestSchema.index({ createdAt: -1 });
requestSchema.index({ recipientEmails: 1, status: 1 });

export default mongoose.model('MedicalRequest', requestSchema);
