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