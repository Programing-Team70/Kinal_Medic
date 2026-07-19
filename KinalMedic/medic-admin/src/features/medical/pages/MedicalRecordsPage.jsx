import { useState, useEffect } from 'react';
import { RegisterMedic } from '../components/register.medic';
import { useMedicalRecordStore } from '../store/medicalRecordStore';
import { useAuthStore } from '../../auth/store/authStore';
import { useMedicineStore } from '../../inventory/store/useMedicineStore';

const levelLabel = (level) => {
    if (level === 'BASICO') return 'Básico';
    if (level === 'DIVERSIFICADO') return 'Diversificado';
    return level || '—';
};

export const MedicalRecordsPage = () => {
    const [searchCarnet, setSearchCarnet] = useState('');
    const [isSearched, setIsSearched] = useState(false);

    const {
        fetchAllRecords,
        fetchRecordsByCarnet,
        updateMedicalRecord,
        deleteMedicalRecord,
        records,
        loading,
    } = useMedicalRecordStore();

    const token = useAuthStore((state) => state.token);
    const userRole = useAuthStore((state) => state.user?.role || state.role);
    const { medicines, fetchMedicines } = useMedicineStore();

    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        description: '',
        medicationId: '',
        medication: '',
        temperature: '',
        bloodPressure: '',
        weight: '',
        height: '',
    });

    useEffect(() => {
        if (token) {
            fetchAllRecords(token);
            fetchMedicines();
        }
    }, [token]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchCarnet.trim()) {
            fetchRecordsByCarnet(searchCarnet, token);
            setIsSearched(true);
        }
    };

    const handleClearSearch = () => {
        setSearchCarnet('');
        setIsSearched(false);
        fetchAllRecords(token);
    };

    const handleRefresh = () => {
        if (isSearched && searchCarnet.trim()) {
            fetchRecordsByCarnet(searchCarnet, token);
        } else {
            fetchAllRecords(token);
        }
        fetchMedicines();
    };

    const startEdit = (record) => {
        setEditingId(record._id);
        setEditFormData({
            description: record.description,
            medicationId: record.medicationId || '',
            medication: record.medication || '',
            temperature: record.vitals?.temperature || '',
            bloodPressure: record.vitals?.bloodPressure || '',
            weight: record.vitals?.weight || '',
            height: record.vitals?.height || '',
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const handleEditSubmit = async (e, id) => {
        e.preventDefault();
        const selectedMed = medicines.find((m) => m._id === editFormData.medicationId);

        const updatedPayload = {
            description: editFormData.description,
            vitals: {
                temperature: editFormData.temperature,
                bloodPressure: editFormData.bloodPressure,
                weight: editFormData.weight,
                height: editFormData.height,
            },
        };

        if (selectedMed) {
            updatedPayload.medicationId = selectedMed._id;
            updatedPayload.medicationName = selectedMed.name;
            updatedPayload.medication = `${selectedMed.name}${
                selectedMed.dosageForm ? ` (${selectedMed.dosageForm})` : ''
            }`;
        } else if (editFormData.medication) {
            updatedPayload.medication = editFormData.medication;
            updatedPayload.medicationName = editFormData.medication;
        }

        const success = await updateMedicalRecord(id, updatedPayload, token);
        if (success) setEditingId(null);
    };

    const availableMeds = (medicines || []).filter((m) => m.isActive !== false);

    return (
        <div className="p-6 space-y-8 max-w-6xl mx-auto">
            <header className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900">
                    Módulo de Registros Médicos
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                    Gestión interna de expedientes clínicos de Kinal Medic
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <RegisterMedic onRecordAdded={handleRefresh} />
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <form
                        onSubmit={handleSearch}
                        className="flex gap-2 bg-white p-4 rounded-xl shadow-sm"
                    >
                        <input
                            type="text"
                            value={searchCarnet}
                            onChange={(e) => setSearchCarnet(e.target.value)}
                            placeholder="Buscar historial por carné del alumno..."
                            className="flex-1 p-2 border rounded-lg outline-none focus:border-blue-500"
                        />
                        <button
                            type="submit"
                            className="bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-900 font-medium transition"
                        >
                            Buscar
                        </button>

                        {isSearched && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-100 font-medium transition flex items-center gap-1"
                            >
                                ↩ Ver todos
                            </button>
                        )}
                    </form>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-md font-bold text-gray-700">
                                {isSearched
                                    ? `Historial Clínico de Carné: ${searchCarnet}`
                                    : 'Todos los expedientes médicos'}
                            </h3>
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md font-semibold">
                                Total expuestos: {records.length}
                            </span>
                        </div>

                        {loading && (
                            <p className="text-gray-500 text-center py-4">
                                Procesando petición...
                            </p>
                        )}

                        {!loading && records.length === 0 && (
                            <div className="bg-gray-50 text-center p-8 rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-400">
                                    {isSearched
                                        ? 'No se encontraron expedientes para este carné.'
                                        : 'No hay registros clínicos guardados en la base de datos.'}
                                </p>
                            </div>
                        )}

                        {!loading && records.length > 0 && (
                            <div className="space-y-3">
                                {records.map((record) => (
                                    <div
                                        key={record._id}
                                        className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
                                    >
                                        {editingId === record._id ? (
                                            <form
                                                onSubmit={(e) =>
                                                    handleEditSubmit(e, record._id)
                                                }
                                                className="space-y-3"
                                            >
                                                <h4 className="text-sm font-bold text-orange-600">
                                                    Editando Registro Clínico
                                                </h4>
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-600">
                                                        Descripción / Diagnóstico
                                                    </label>
                                                    <textarea
                                                        required
                                                        rows="2"
                                                        className="w-full p-2 border rounded-lg text-sm outline-none"
                                                        value={editFormData.description}
                                                        onChange={(e) =>
                                                            setEditFormData({
                                                                ...editFormData,
                                                                description: e.target.value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-600">
                                                        Medicamento (Inventario)
                                                    </label>
                                                    <select
                                                        className="w-full p-2 border rounded-lg text-sm outline-none bg-white"
                                                        value={editFormData.medicationId}
                                                        onChange={(e) =>
                                                            setEditFormData({
                                                                ...editFormData,
                                                                medicationId: e.target.value,
                                                            })
                                                        }
                                                    >
                                                        <option value="">
                                                            {editFormData.medication ||
                                                                'Sin medicamento'}
                                                        </option>
                                                        {availableMeds.map((med) => (
                                                            <option
                                                                key={med._id}
                                                                value={med._id}
                                                            >
                                                                {med.name} — stock:{' '}
                                                                {med.stock}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Temp"
                                                        className="p-2 border rounded-lg text-sm outline-none"
                                                        value={editFormData.temperature}
                                                        onChange={(e) =>
                                                            setEditFormData({
                                                                ...editFormData,
                                                                temperature: e.target.value,
                                                            })
                                                        }
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="P. Art"
                                                        className="p-2 border rounded-lg text-sm outline-none"
                                                        value={editFormData.bloodPressure}
                                                        onChange={(e) =>
                                                            setEditFormData({
                                                                ...editFormData,
                                                                bloodPressure: e.target.value,
                                                            })
                                                        }
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Peso"
                                                        className="p-2 border rounded-lg text-sm outline-none"
                                                        value={editFormData.weight}
                                                        onChange={(e) =>
                                                            setEditFormData({
                                                                ...editFormData,
                                                                weight: e.target.value,
                                                            })
                                                        }
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Altura"
                                                        className="p-2 border rounded-lg text-sm outline-none"
                                                        value={editFormData.height}
                                                        onChange={(e) =>
                                                            setEditFormData({
                                                                ...editFormData,
                                                                height: e.target.value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div className="flex gap-2 pt-2 justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={cancelEdit}
                                                        className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-orange-600"
                                                    >
                                                        Guardar Cambios
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-start border-b pb-2 mb-2">
                                                    <div className="space-y-1">
                                                        <span className="text-xs font-bold text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded-full">
                                                            Carné: {record.carnet}
                                                        </span>
                                                        {record.student?.name && (
                                                            <p className="text-sm font-semibold text-gray-900 mt-1">
                                                                {record.student.name}
                                                            </p>
                                                        )}
                                                        {record.student && (
                                                            <p className="text-xs text-gray-500">
                                                                {levelLabel(
                                                                    record.student
                                                                        .educationLevel
                                                                )}
                                                                {record.student.seccion
                                                                    ? ` · Sec. ${record.student.seccion}`
                                                                    : ''}
                                                                {record.student.hasAllergies
                                                                    ? ` · Alergias: ${
                                                                          record.student
                                                                              .allergies ||
                                                                          'Sí'
                                                                      }`
                                                                    : ''}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(
                                                                record.date
                                                            ).toLocaleDateString('es-GT', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                            })}
                                                        </span>

                                                        {(userRole === 'ADMIN_ROLE' || userRole === 'ADMIN_PRINCIPAL') && (
                                                            <div className="flex gap-1">
                                                                <button
                                                                    onClick={() =>
                                                                        startEdit(record)
                                                                    }
                                                                    title="Editar"
                                                                    className="text-gray-500 hover:text-orange-500 p-1 text-xs transition"
                                                                >
                                                                    Modificar
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        deleteMedicalRecord(
                                                                            record._id,
                                                                            token
                                                                        )
                                                                    }
                                                                    title="Eliminar"
                                                                    className="text-gray-500 hover:text-red-500 p-1 text-xs transition"
                                                                >
                                                                    Eliminar
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 text-sm">
                                                    <strong className="text-gray-900">
                                                        Motivo / Diagnóstico:
                                                    </strong>{' '}
                                                    {record.description}
                                                </p>
                                                <p className="text-gray-700 text-sm mt-1">
                                                    <strong className="text-gray-900">
                                                        Tratamiento:
                                                    </strong>{' '}
                                                    {record.medication || 'Ninguna'}
                                                </p>
                                                {record.student?.guardianEmail && (
                                                    <p className="text-gray-600 text-xs mt-1">
                                                        <strong>Encargado:</strong>{' '}
                                                        {record.student.guardianEmail}
                                                    </p>
                                                )}

                                                <div className="mt-3 pt-2 border-t border-gray-50 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-gray-50 p-2 rounded-lg text-gray-600">
                                                    <div>
                                                        <span className="font-semibold">
                                                            Temp:
                                                        </span>{' '}
                                                        {record.vitals?.temperature}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold">
                                                            Presión:
                                                        </span>{' '}
                                                        {record.vitals?.bloodPressure}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold">
                                                            Peso:
                                                        </span>{' '}
                                                        {record.vitals?.weight}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold">
                                                            Altura:
                                                        </span>{' '}
                                                        {record.vitals?.height || 'N/A'}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
