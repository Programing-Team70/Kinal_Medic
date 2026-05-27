import { useState, useEffect } from 'react';
import { RegisterMedic } from '../components/register.medic';
import { useMedicalRecordStore } from '../store/medicalRecordStore';
import { useAuthStore } from '../../auth/store/authStore';

export const MedicalRecordsPage = () => {
    const [searchCarnet, setSearchCarnet] = useState('');
    const [isSearched, setIsSearched] = useState(false);
    
    const { fetchAllRecords, fetchRecordsByCarnet, updateMedicalRecord, deleteMedicalRecord, records, loading } = useMedicalRecordStore();
    
    const token = useAuthStore((state) => state.token);
    const userRole = useAuthStore((state) => state.user?.role || state.role); 

    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        description: '', medication: '', temperature: '', bloodPressure: '', weight: ''
    });

    useEffect(() => {
        if (token) {
            fetchAllRecords(token);
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
    };

    const startEdit = (record) => {
        setEditingId(record._id);
        setEditFormData({
            description: record.description,
            medication: record.medication,
            temperature: record.vitals?.temperature || '',
            bloodPressure: record.vitals?.bloodPressure || '',
            weight: record.vitals?.weight || ''
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const handleEditSubmit = async (e, id) => {
        e.preventDefault();
        const updatedPayload = {
            description: editFormData.description,
            medication: editFormData.medication,
            vitals: {
                temperature: editFormData.temperature,
                bloodPressure: editFormData.bloodPressure,
                weight: editFormData.weight
            }
        };

        const success = await updateMedicalRecord(id, updatedPayload, token);
        if (success) setEditingId(null);
    };

    return (
        <div className="p-6 space-y-8 max-w-6xl mx-auto">
            <header className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900">Módulo de Registros Médicos</h2>
                <p className="text-gray-500 text-sm mt-1">Gestión interna de expedientes clínicos de Kinal Medic</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulario de creación (Panel Izquierdo) */}
                <div className="lg:col-span-1">
                    <RegisterMedic onRecordAdded={handleRefresh} />
                </div>

                {/* Historial y Buscador (Panel Derecho) */}
                <div className="lg:col-span-2 space-y-4">
                    <form onSubmit={handleSearch} className="flex gap-2 bg-white p-4 rounded-xl shadow-sm">
                        <input 
                            type="text" value={searchCarnet} onChange={(e) => setSearchCarnet(e.target.value)}
                            placeholder="Buscar historial por carné del alumno..."
                            className="flex-1 p-2 border rounded-lg outline-none focus:border-blue-500"
                        />
                        <button type="submit" className="bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-900 font-medium transition">
                            Buscar
                        </button>

                        {/* Boton dinamico de regresar a ver todos los registros */}
                        {isSearched && (
                            <button 
                                type="button" onClick={handleClearSearch}
                                className="bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-100 font-medium transition flex items-center gap-1"
                            >
                                ↩ Ver todos
                            </button>
                        )}
                    </form>

                    <div className="space-y-4">
                        {/* Título dinámico según el estado */}
                        <div className="flex justify-between items-center">
                            <h3 className="text-md font-bold text-gray-700">
                                {isSearched ? `Historial Clínico de Carné: ${searchCarnet}` : 'Todos los expedientes médicos'}
                            </h3>
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md font-semibold">
                                Total expuestos: {records.length}
                            </span>
                        </div>

                        {loading && <p className="text-gray-500 text-center py-4">Procesando petición...</p>}

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
                                    <div key={record._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                        
                                        {/* Modo de edición activado */}
                                        {editingId === record._id ? (
                                            <form onSubmit={(e) => handleEditSubmit(e, record._id)} className="space-y-3">
                                                <h4 className="text-sm font-bold text-orange-600">Editando Registro Clínico</h4>
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-600">Descripción / Diagnóstico</label>
                                                    <textarea 
                                                        required rows="2" className="w-full p-2 border rounded-lg text-sm outline-none"
                                                        value={editFormData.description} 
                                                        onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-600">Medicamento</label>
                                                    <input 
                                                        type="text" className="w-full p-2 border rounded-lg text-sm outline-none"
                                                        value={editFormData.medication} 
                                                        onChange={(e) => setEditFormData({...editFormData, medication: e.target.value})}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <input type="text" placeholder="Temp" className="p-2 border rounded-lg text-sm outline-none" value={editFormData.temperature} onChange={(e) => setEditFormData({...editFormData, temperature: e.target.value})}/>
                                                    <input type="text" placeholder="P. Art" className="p-2 border rounded-lg text-sm outline-none" value={editFormData.bloodPressure} onChange={(e) => setEditFormData({...editFormData, bloodPressure: e.target.value})}/>
                                                    <input type="text" placeholder="Peso" className="p-2 border rounded-lg text-sm outline-none" value={editFormData.weight} onChange={(e) => setEditFormData({...editFormData, weight: e.target.value})}/>
                                                </div>
                                                <div className="flex gap-2 pt-2 justify-end">
                                                    <button type="button" onClick={cancelEdit} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium">Cancelar</button>
                                                    <button type="submit" className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-orange-600">Guardar Cambios</button>
                                                </div>
                                            </form>
                                        ) : (
                                            /* Modo de lectura normal */
                                            <>
                                                <div className="flex justify-between items-start border-b pb-2 mb-2">
                                                    <div>
                                                        <span className="text-xs font-bold text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded-full">
                                                            Carné: {record.carnet}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(record.date).toLocaleDateString('es-GT', {
                                                                year: 'numeric', month: 'short', day: 'numeric'
                                                            })}
                                                        </span>
                                                        
                                                        {userRole === 'ADMIN_ROLE' && (
                                                            <div className="flex gap-1">
                                                                <button onClick={() => startEdit(record)} title="Editar" className="text-gray-500 hover:text-orange-500 p-1 text-xs transition">Modificar</button>
                                                                <button onClick={() => deleteMedicalRecord(record._id, token)} title="Eliminar" className="text-gray-500 hover:text-red-500 p-1 text-xs transition">Eliminar</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 text-sm"><strong className="text-gray-900">Diagnóstico:</strong> {record.description}</p>
                                                <p className="text-gray-700 text-sm mt-1"><strong className="text-gray-900">Tratamiento:</strong> {record.medication}</p>
                                                
                                                <div className="mt-3 pt-2 border-t border-gray-50 grid grid-cols-3 gap-2 text-xs bg-gray-50 p-2 rounded-lg text-gray-600">
                                                    <div><span className="font-semibold">Temp:</span> {record.vitals?.temperature}</div>
                                                    <div><span className="font-semibold">Presión Art:</span> {record.vitals?.bloodPressure}</div>
                                                    <div><span className="font-semibold">Peso:</span> {record.vitals?.weight}</div>
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