import { useState } from 'react';
import { useMedicalRecordStore } from '../store/medicalRecordStore';
import { useAuthStore } from '../../auth/store/authStore'; 

export const RegisterMedic = ({ onRecordAdded }) => {
    const { createMedicalRecord, loading } = useMedicalRecordStore();
    const token = useAuthStore((state) => state.token); 

    const [formData, setFormData] = useState({
        carnet: '',
        description: '',
        medication: '',
        temperature: '',
        bloodPressure: '',
        weight: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const recordPayload = {
            carnet: formData.carnet,
            description: formData.description,
            medication: formData.medication || undefined, 
            vitals: {
                temperature: formData.temperature || undefined,
                bloodPressure: formData.bloodPressure || undefined,
                weight: formData.weight || undefined
            }
        };

        const success = await createMedicalRecord(recordPayload, token);
        if (success) {
            setFormData({
                carnet: '',
                description: '',
                medication: '',
                temperature: '',
                bloodPressure: '',
                weight: ''
            });
            if (onRecordAdded) onRecordAdded(formData.carnet);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-4 max-w-xl mx-auto">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Crear Registro Clínico</h3>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Carné del Estudiante *</label>
                <input 
                    type="text" required name="carnet" value={formData.carnet} onChange={handleChange}
                    className="mt-1 w-full p-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
                    placeholder="Ej. 2024332"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Descripción / Diagnóstico *</label>
                <textarea 
                    required name="description" value={formData.description} onChange={handleChange} rows="3"
                    className="mt-1 w-full p-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
                    placeholder="Motivo de la consulta y estado del paciente..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Medicamento Recetado</label>
                <input 
                    type="text" name="medication" value={formData.medication} onChange={handleChange}
                    className="mt-1 w-full p-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
                    placeholder="Ej. Paracetamol 500mg cada 8 horas"
                />
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Temperatura</label>
                    <input 
                        type="text" name="temperature" value={formData.temperature} onChange={handleChange}
                        className="mt-1 w-full p-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        placeholder="36.5 °C"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Presión Art.</label>
                    <input 
                        type="text" name="bloodPressure" value={formData.bloodPressure} onChange={handleChange}
                        className="mt-1 w-full p-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        placeholder="120/80"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Peso</label>
                    <input 
                        type="text" name="weight" value={formData.weight} onChange={handleChange}
                        className="mt-1 w-full p-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        placeholder="65 kg"
                    />
                </div>
            </div>

            <button 
                type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg font-semibold transition disabled:bg-gray-400"
            >
                {loading ? 'Guardando...' : 'Guardar Registro'}
            </button>
        </form>
    );
};