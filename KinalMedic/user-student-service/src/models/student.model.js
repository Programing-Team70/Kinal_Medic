import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const studentSchema = new mongoose.Schema({
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    name: { type: String, required: true },
    password: { type: String, required: true },

    carnet: { 
        type: String, 
        unique: true, 
        sparse: true, 
        required: function() { return this.role === 'student'; } 
    },
    carrera: { 
        type: String, 
        required: function() { return this.role === 'student'; } 
    },
    emergencyContact: { type: String },
    allergies: { type: String },

    email: { 
        type: String, 
        unique: true, 
        sparse: true,
        required: function() { return this.role === 'admin'; } 
    },
    phone: { 
        type: String, 
        required: function() { return this.role === 'admin'; } 
    }
});

studentSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const Student = mongoose.model('Student', studentSchema);
export default Student;