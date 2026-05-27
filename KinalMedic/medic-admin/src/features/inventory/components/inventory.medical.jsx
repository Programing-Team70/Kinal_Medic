import React, { useEffect, useState } from "react";
import { useMedicineStore } from "../store/useMedicineStore.js";

export const InventoryMedical = () => {
    const { medicines, loading, error, fetchMedicines, addMedicine, updateMedicine, deactivateMedicine } = useMedicineStore();
    
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        genericName: "",
        description: "",
        category: "otro",
        dosageForm: "tableta",
        stock: 0,
        expirationDate: ""
    });

    useEffect(() => {
        fetchMedicines();
    }, [fetchMedicines]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const filteredMedicines = medicines.filter((med) => {
        const matchesSearch = 
            med.name?.toLowerCase().includes(search.toLowerCase()) ||
            med.genericName?.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        if (filter === "lowStock") return med.stock <= 5; 
        if (filter === "expiring") {
            const monthsToExpire = (new Date(med.expirationDate) - new Date()) / (1000 * 60 * 60 * 24 * 30);
            return monthsToExpire <= 6 && monthsToExpire > 0;
        }
        return true;
    });

    const handleAddOpen = () => {
        setSelectedMedicine(null);
        setFormData({
            name: "",
            genericName: "",
            description: "",
            category: "otro",
            dosageForm: "tableta",
            stock: 0,
            expirationDate: ""
        });
        setIsModalOpen(true);
    };

    const handleEditOpen = (med) => {
        setSelectedMedicine(med);
        setFormData({
            name: med.name || "",
            genericName: med.genericName || "",
            description: med.description || "",
            category: med.category || "otro",
            dosageForm: med.dosageForm || "tableta",
            stock: med.stock || 0,
            expirationDate: med.expirationDate ? med.expirationDate.split("T")[0] : ""
        });
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "stock" ? parseInt(value) || 0 : value
        }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        let res;
        if (selectedMedicine) {
            res = await updateMedicine(selectedMedicine._id, formData);
        } else {
            res = await addMedicine(formData);
        }

        if (res.success) {
            alert(res.message);
            setIsModalOpen(false);
        } else {
            alert(res.message);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar ${name} del inventario?`)) {
            const result = await deactivateMedicine(id);
            if (result.success) alert(result.message);
            else alert(`Error: ${result.message}`);
        }
    };

    return (
        <div className="p-6 bg-[#f4f6f9] min-h-screen font-sans text-gray-700">
            {/* Encabezado Principal */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-[#0d3b66] uppercase tracking-wide">
                    Gestión de Inventario de Medicamentos
                </h1>
                <button 
                    onClick={handleAddOpen}
                    className="bg-[#00509d] hover:bg-[#003f8a] text-white font-semibold text-sm px-4 py-2.5 rounded shadow transition-all"
                >
                    + AÑADIR MEDICAMENTO
                </button>
            </div>

            {/* Buscador y Filtros superiores */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
                <div className="relative w-full sm:w-96">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o principio activo..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-4 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <button onClick={() => setFilter("all")}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${filter === "all" ? "bg-[#e2eafc] text-[#0d3b66] border-blue-300" : "bg-white text-gray-500 border-gray-200"}`}>
                        Todo
                    </button>
                    <button onClick={() => setFilter("lowStock")}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${filter === "lowStock" ? "bg-red-50 text-red-700 border-red-200" : "bg-white text-gray-500 border-gray-200"}`}>
                        Stock Bajo
                    </button>
                    <button onClick={() => setFilter("expiring")}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${filter === "expiring" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-white text-gray-500 border-gray-200"}`}>
                        Por Caducar
                    </button>
                </div>
            </div>

            {loading && <div className="text-center py-10 font-medium text-gray-500">Procesando inventario...</div>}
            {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">{error}</div>}

            {/* Tabla de Medicamentos */}
            {!loading && !error && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-[#212529] font-bold text-[15px] bg-gray-50/50">
                                    <th className="p-4 pl-6">Medicamento</th>
                                    <th className="p-4">Principio Activo</th>
                                    <th className="p-4">Forma / Categoría</th>
                                    <th className="p-4 text-center">Stock Actual</th>
                                    <th className="p-4 text-center">Caducidad</th>
                                    <th className="p-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-[14px]">
                                {filteredMedicines.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12 text-gray-400 font-medium">No se encontraron medicamentos.</td>
                                    </tr>
                                ) : (
                                    filteredMedicines.map((med) => {
                                        const isLowStock = med.stock <= 5;
                                        return (
                                            <tr key={med._id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="p-4 pl-6 font-semibold text-gray-900 flex items-center gap-2">
                                                    <span>{isLowStock ? "⚠️" : "💊"}</span>{med.name}
                                                </td>
                                                <td className="p-4 text-gray-500">{med.genericName}</td>
                                                <td className="p-4 text-gray-400 capitalize">{med.dosageForm} • <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{med.category}</span></td>
                                                <td className="p-4 text-center">
                                                    <div className={`inline-block w-12 py-1 rounded text-center text-sm font-bold ${isLowStock ? "bg-red-400 text-white" : "bg-gray-100 text-gray-800"}`}>
                                                        {med.stock}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-700">{formatDate(med.expirationDate)}</span>
                                                </td>
                                                <td className="p-4 text-center space-x-3">
                                                    <button onClick={() => handleEditOpen(med)} className="text-blue-600 hover:text-blue-800 font-medium">Editar</button>
                                                    <button onClick={() => handleDelete(med._id, med.name)} className="text-red-500 hover:text-red-700 font-medium">Eliminar</button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal de formulario flotante */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 z-50">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-[#0d3b66] p-4 text-white flex justify-between items-center">
                            <h3 className="font-bold text-lg">{selectedMedicine ? "Modificar Medicamento" : "+Añadir Medicamento"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="font-bold hover:text-gray-200">✕</button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-sm">
                            <div>
                                <label className="block font-semibold mb-1">Nombre Comercial</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full border p-2 rounded-lg bg-gray-50 focus:outline-blue-500" />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Principio Activo</label>
                                <input type="text" name="genericName" value={formData.genericName} onChange={handleInputChange} required className="w-full border p-2 rounded-lg bg-gray-50 focus:outline-blue-500" />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Descripción</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} required rows="2" className="w-full border p-2 rounded-lg bg-gray-50 focus:outline-blue-500"></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold mb-1">Categoría</label>
                                    <select name="category" value={formData.category} onChange={handleInputChange} className="w-full border p-2 rounded-lg bg-gray-50 focus:outline-blue-500">
                                        <option value="analgesico">Analgésico</option>
                                        <option value="antibiotico">Antibiótico</option>
                                        <option value="anti inflammatorio">Antiinflamatorio</option>
                                        <option value="antipirético">Antipirético</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Forma de Aplicación</label>
                                    <select name="dosageForm" value={formData.dosageForm} onChange={handleInputChange} className="w-full border p-2 rounded-lg bg-gray-50 focus:outline-blue-500">
                                        <option value="tableta">Tableta</option>
                                        <option value="capsula">Cápsula</option>
                                        <option value="jarabe">Jarabe</option>
                                        <option value="inyección">Inyección</option>
                                        <option value="crema">Crema</option>
                                        <option value="gotas">Gotas</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold mb-1">Stock Inicial</label>
                                    <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} min="0" required className="w-full border p-2 rounded-lg bg-gray-50 focus:outline-blue-500" />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Vencimiento</label>
                                    <input type="date" name="expirationDate" value={formData.expirationDate} onChange={handleInputChange} required className="w-full border p-2 rounded-lg bg-gray-50 focus:outline-blue-500" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-gray-500 hover:bg-gray-50">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-[#00509d] text-white font-semibold rounded-lg hover:bg-[#003f8a]">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};