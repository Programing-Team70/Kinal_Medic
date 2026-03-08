import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
    carnet: { 
        type: String, 
        required: true, 
        index: true 
    },
    
    description: { type: String, required: true },
    medication: { type: String, default: "Ninguna" },
    
    vitals: {
        temperature: { type: String, default: "N/A" },
        bloodPressure: { type: String, default: "N/A" },
        weight: { type: String, default: "N/A" }
    },

    date: { 
        type: Date, 
        default: Date.now 
    }
});

export default mongoose.model('MedicalRecord', recordSchema);