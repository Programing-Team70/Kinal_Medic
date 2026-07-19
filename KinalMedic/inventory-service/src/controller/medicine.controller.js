import * as medicineService from "../service/medicine.service.js";

export const getMedicines = async (req, res, next) => {
    try {
        const medicines = await medicineService.getAllMedicines();
        res.status(200).json(medicines); 
    } catch (error) {
        next(error);
    }
};

export const getMedicine = async (req, res, next) => {
    try {
        const medicine = await medicineService.getMedicineById(req.params.id);
        if (!medicine) {
            return res.status(404).json({ message: "Medicamento no encontrado." });
        }
        res.status(200).json(medicine);
    } catch (error) {
        next(error);
    }
};

export const createMedicine = async (req, res, next) => {
    try {
        const medicine = await medicineService.createMedicine(req.body);
        res.status(201).json({
            message: "Medicamento registrado exitosamente.",
            medicine
        });
    } catch (error) {
        next(error);
    }
};

export const updateMedicine = async (req, res, next) => {
    try {
        const medicine = await medicineService.updateMedicine(
            req.params.id,
            req.body
        );
        res.status(200).json({
            message: "Medicamento actualizado con éxito.",
            updatedMedicine: medicine
        });
    } catch (error) {
        next(error);
    }
};

export const deactivateMedicine = async (req, res, next) => {
    try {
        const medicine = await medicineService.deactivateMedicine(req.params.id);
        res.status(200).json({
            message: "Medicamento desactivado del inventario.",
            medicine
        });
    } catch (error) {
        next(error);
    }
};

export const consumeStock = async (req, res, next) => {
    try {
        const quantity = req.body?.quantity ?? 1;
        const medicine = await medicineService.consumeStock(req.params.id, quantity);
        res.status(200).json({
            message: "Stock actualizado tras la receta.",
            medicine,
        });
    } catch (error) {
        next(error);
    }
};