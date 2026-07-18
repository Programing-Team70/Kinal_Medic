import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../utils/roles.js';

const studentSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: [ROLES.STUDENT, ROLES.MEDIC, ROLES.PRINCIPAL],
        default: ROLES.STUDENT,
    },
    name: { type: String, required: true },
    password: { type: String, required: true },

    carnet: {
        type: String,
        unique: true,
        sparse: true,
        required: function () {
            return this.role === ROLES.STUDENT;
        },
    },
    educationLevel: {
        type: String,
        enum: ['BASICO', 'DIVERSIFICADO'],
        required: function () {
            return this.role === ROLES.STUDENT;
        },
    },
    carrera: {
        type: String,
        default: null,
        required: function () {
            return this.role === ROLES.STUDENT && this.educationLevel === 'DIVERSIFICADO';
        },
    },
    seccion: {
        type: String,
        required: function () {
            return this.role === ROLES.STUDENT;
        },
        trim: true,
    },
    hasAllergies: {
        type: Boolean,
        default: false,
        required: function () {
            return this.role === ROLES.STUDENT;
        },
    },
    allergies: {
        type: String,
        default: 'Ninguna',
        required: function () {
            return this.role === ROLES.STUDENT && this.hasAllergies === true;
        },
    },
    guardianEmail: {
        type: String,
        required: function () {
            return this.role === ROLES.STUDENT;
        },
        trim: true,
        lowercase: true,
    },
    emergencyContact: { type: String },

    email: {
        type: String,
        unique: true,
        sparse: true,
        required: true,
        trim: true,
        lowercase: true,
    },
    phone: {
        type: String,
        required: function () {
            return this.role === ROLES.MEDIC || this.role === ROLES.PRINCIPAL;
        },
    },
});

studentSchema.pre('validate', function () {
    if (this.role === ROLES.STUDENT && this.educationLevel === 'BASICO') {
        this.carrera = null;
    }

    if (this.role === ROLES.STUDENT && this.hasAllergies === false) {
        this.allergies = 'Ninguna';
    }
});

studentSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const Student = mongoose.model('Student', studentSchema);
export default Student;
