import * as medicineService from "../service/medicine.service.js";

export const getMedicines = async (req, res, next) => {
    try {
        const medicines = await medicineService.getAllMedicines();
        res.status(200).json({
            success: true,
            data: medicines
        });
    } catch (error) {
        next(error);
    }
};

export const getMedicine = async (req, res, next) => {
    try {
        const medicine = await medicineService.getMedicineById(req.params.id);
        if(!medicine){
            return res.status(404).json({message: "Medicamento no encontrado."});
        }
        res.json(medicine);
    } catch (error) {
        next(error);
    }
};

export const createMedicine = async (req, res, next) => {
    try {
        const medicine = await medicineService.createMedicine(req.body);
        res.status(201).json(medicine);
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
        res.json(medicine);
    } catch (error) {
        next(error);
    }
};

export const deactivateMedicine = async (req, res, next) => {
    try {
        const medicine = await medicineService.deactivateMedicine(req.params.id);
        res.json({
            message: "Medicamento desactivado.",
            medicine
        });
    } catch (error) {
        next(error);
    }
};