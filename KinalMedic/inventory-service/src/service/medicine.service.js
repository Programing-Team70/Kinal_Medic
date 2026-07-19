import Medicine from "../models/medicine.model.js";

export const getAllMedicines = async () => {
    return await Medicine.find({ isActive: true });
};

export const getMedicineById = async (id) => {
    return await Medicine.findById(id);
};

export const createMedicine = async (data) => {
    const medicine = new Medicine(data);
    return await medicine.save();
};

export const updateMedicine = async (id, data) => {
    return await Medicine.findByIdAndUpdate(
        id,
        data,
        { new: true }
    );
};

export const deactivateMedicine = async (id) => {
    return await Medicine.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
    );
};

/**
 * Descuenta stock al recetar un medicamento en un registro clínico.
 * @param {string} id - ID del medicamento
 * @param {number} quantity - Unidades a descontar (default 1)
 */
export const consumeStock = async (id, quantity = 1) => {
    const qty = Number(quantity) || 1;
    if (qty < 1) {
        const err = new Error('La cantidad a descontar debe ser al menos 1.');
        err.statusCode = 400;
        throw err;
    }

    const medicine = await Medicine.findOne({ _id: id, isActive: true });
    if (!medicine) {
        const err = new Error('Medicamento no encontrado o inactivo.');
        err.statusCode = 404;
        throw err;
    }

    if (medicine.stock < qty) {
        const err = new Error(
            `Stock insuficiente de "${medicine.name}". Disponible: ${medicine.stock}`
        );
        err.statusCode = 400;
        throw err;
    }

    medicine.stock -= qty;
    await medicine.save();
    return medicine;
};