import { useEffect, useState } from 'react';
import { useMedicalRecordStore } from '../store/medicalRecordStore';
import { useAuthStore } from '../../auth/store/authStore';
import { useMedicineStore } from '../../inventory/store/useMedicineStore';
import { getStudentByCarnet } from '../../../shared/api/auth.js';
import toast from 'react-hot-toast';

const emptyForm = {
    carnet: '',
    description: '',
    medicationId: '',
    temperature: '',
    bloodPressure: '',
    weight: '',
    height: '',
};

const levelLabel = (level) => {
    if (level === 'BASICO') return 'Básico';
    if (level === 'DIVERSIFICADO') return 'Diversificado';
    return level || '—';
};

export const RegisterMedic = ({ onRecordAdded }) => {
    const { createMedicalRecord, loading } = useMedicalRecordStore();
    const token = useAuthStore((state) => state.token);
    const { medicines, fetchMedicines, consumeStock, loading: loadingMeds } =
        useMedicineStore();

    const [formData, setFormData] = useState(emptyForm);
    const [student, setStudent] = useState(null);
    const [lookingUp, setLookingUp] = useState(false);

    useEffect(() => {
        fetchMedicines();
    }, [fetchMedicines]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (name === 'carnet') {
            setStudent(null);
        }
    };

    const handleLookupStudent = async () => {
        const carnet = formData.carnet.trim();
        if (!carnet) {
            toast.error('Ingresa un carnet para buscar al estudiante.');
            return;
        }

        setLookingUp(true);
        setStudent(null);
        try {
            const data = await getStudentByCarnet(carnet);
            if (!data || data.role === 'ADMIN_ROLE' || data.role === 'ADMIN_PRINCIPAL') {
                toast.error('No se encontró un estudiante con ese carnet.');
                return;
            }
            setStudent(data);
            toast.success(`Estudiante encontrado: ${data.name}`);
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                    'No se encontró un estudiante con ese carnet.'
            );
        } finally {
            setLookingUp(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!student) {
            toast.error('Busca y confirma al estudiante por carnet antes de guardar.');
            return;
        }
        if (!formData.description.trim()) {
            toast.error('La descripción / motivo de llegada es obligatoria.');
            return;
        }

        const selectedMed = medicines.find((m) => m._id === formData.medicationId);

        const recordPayload = {
            carnet: formData.carnet.trim(),
            description: formData.description.trim(),
            student: {
                name: student.name,
                email: student.email,
                educationLevel: student.educationLevel,
                carrera: student.carrera,
                seccion: student.seccion,
                hasAllergies: student.hasAllergies,
                allergies: student.allergies,
                guardianEmail: student.guardianEmail,
                phone: student.phone,
            },
            vitals: {
                temperature: formData.temperature || undefined,
                bloodPressure: formData.bloodPressure || undefined,
                weight: formData.weight || undefined,
                height: formData.height || undefined,
            },
        };

        if (selectedMed) {
            recordPayload.medicationId = selectedMed._id;
            recordPayload.medicationName = selectedMed.name;
            recordPayload.medication = `${selectedMed.name}${
                selectedMed.dosageForm ? ` (${selectedMed.dosageForm})` : ''
            }`;
        } else {
            recordPayload.medication = 'Ninguna';
        }

        const success = await createMedicalRecord(recordPayload, token);
        if (success) {
            if (selectedMed?._id) {
                const stockResult = await consumeStock(selectedMed._id, 1);
                if (!stockResult.success) {
                    toast.error(
                        stockResult.message ||
                            'Registro guardado, pero no se pudo descontar el stock.'
                    );
                }
            }

            setFormData(emptyForm);
            setStudent(null);
            if (onRecordAdded) onRecordAdded(formData.carnet);
        }
    };

    const availableMeds = (medicines || []).filter(
        (m) => m.isActive !== false && (m.stock ?? 0) > 0
    );

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl shadow-md space-y-4 max-w-xl mx-auto"
        >
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
                Crear Registro Clínico
            </h3>

            {/* 1. Buscar alumno por carnet */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Carné del Estudiante *
                </label>
                <div className="mt-1 flex gap-2">
                    <input
                        type="text"
                        required
                        name="carnet"
                        value={formData.carnet}
                        onChange={handleChange}
                        className="flex-1 p-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        placeholder="Ej. 2021411"
                    />
                    <button
                        type="button"
                        onClick={handleLookupStudent}
                        disabled={lookingUp}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50 whitespace-nowrap"
                    >
                        {lookingUp ? 'Buscando...' : 'Buscar'}
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                    Busca el carnet para cargar automáticamente los datos del alumno.
                </p>
            </div>

            {/* 2. Datos del alumno (solo lectura) */}
            {student && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                        Datos del estudiante
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-gray-500 text-xs">Nombre</span>
                            <p className="font-semibold text-gray-900">{student.name}</p>
                        </div>
                        <div>
                            <span className="text-gray-500 text-xs">Correo</span>
                            <p className="font-medium text-gray-800 break-all">
                                {student.email || '—'}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-500 text-xs">Nivel</span>
                            <p className="font-medium text-gray-800">
                                {levelLabel(student.educationLevel)}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-500 text-xs">Carrera</span>
                            <p className="font-medium text-gray-800">
                                {student.educationLevel === 'BASICO'
                                    ? 'N/A (Básico)'
                                    : student.carrera || '—'}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-500 text-xs">Sección</span>
                            <p className="font-medium text-gray-800">
                                {student.seccion || '—'}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-500 text-xs">Alergias</span>
                            <p
                                className={`font-semibold ${
                                    student.hasAllergies
                                        ? 'text-red-600'
                                        : 'text-green-700'
                                }`}
                            >
                                {student.hasAllergies
                                    ? student.allergies || 'Sí (sin detalle)'
                                    : 'Ninguna'}
                            </p>
                        </div>
                        <div className="sm:col-span-2">
                            <span className="text-gray-500 text-xs">
                                Correo del encargado
                            </span>
                            <p className="font-medium text-gray-800 break-all">
                                {student.guardianEmail || '—'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Solo lo que llena enfermería */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Motivo de llegada / Descripción *
                </label>
                <textarea
                    required
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 w-full p-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
                    placeholder="¿Por qué llegó a enfermería? Síntomas y observaciones..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Medicamento recetado (Inventario)
                </label>
                <select
                    name="medicationId"
                    value={formData.medicationId}
                    onChange={handleChange}
                    className="mt-1 w-full p-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none bg-white text-sm"
                >
                    <option value="">Sin medicamento / Ninguna</option>
                    {loadingMeds && <option disabled>Cargando inventario...</option>}
                    {availableMeds.map((med) => (
                        <option key={med._id} value={med._id}>
                            {med.name}
                            {med.dosageForm ? ` (${med.dosageForm})` : ''} — stock:{' '}
                            {med.stock}
                        </option>
                    ))}
                </select>
                {!loadingMeds && availableMeds.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                        No hay medicamentos con stock disponible en el inventario.
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Temperatura
                    </label>
                    <input
                        type="text"
                        name="temperature"
                        value={formData.temperature}
                        onChange={handleChange}
                        className="mt-1 w-full p-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        placeholder="36.5 °C"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Presión Art.
                    </label>
                    <input
                        type="text"
                        name="bloodPressure"
                        value={formData.bloodPressure}
                        onChange={handleChange}
                        className="mt-1 w-full p-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        placeholder="120/80"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Peso</label>
                    <input
                        type="text"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        className="mt-1 w-full p-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        placeholder="65 kg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Altura
                    </label>
                    <input
                        type="text"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        className="mt-1 w-full p-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        placeholder="1.70 m"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading || !student}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg font-semibold transition disabled:bg-gray-400"
            >
                {loading ? 'Guardando...' : 'Guardar Registro'}
            </button>
        </form>
    );
};
