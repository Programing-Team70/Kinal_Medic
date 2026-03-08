import MedicalRecord from '../models/record.model.js';

export const addRecord = async (req, res) => {
    try {
        const { carnet, description, medication, vitals } = req.body;

        const newRecord = new MedicalRecord({
            carnet,
            description,
            medication,
            vitals
        });

        await newRecord.save();
        res.status(201).json({
            message: "Registro médico guardado exitosamente en la base de datos",
            record: newRecord
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getByCarnet = async (req, res) => {
    try {
        const { carnet } = req.params;
        const records = await MedicalRecord.find({ carnet }).sort({ date: -1 });
        
        if (records.length === 0) {
            return res.status(404).json({ message: "No se encontraron registros para este carnet N/A" });
        }
        
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};