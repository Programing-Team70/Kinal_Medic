import { Router } from "express";
import * as medicineController from "../controller/medicine.controller.js";
import { validateJWT } from "../../middlewares/JWT.middleware.js";
import { verifyAdminRole } from "../../middlewares/role.middleware.js";

const router = Router();

router.use(validateJWT, verifyAdminRole);

/**
 * @swagger
 * /inv/medicine:
 *   get:
 *     summary: Buscar inventario
 *     tags: [inventory-service]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de medicamentos activos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Medicine' } }
 */
router.get("/", medicineController.getMedicines);

/**
 * @swagger
 * /inv/medicine/{id}:
 *   get:
 *     summary: Buscar inventario (por ID)
 *     tags: [inventory-service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del medicamento.
 *       404:
 *         description: Medicamento no encontrado.
 */
router.get("/:id", medicineController.getMedicine);

/**
 * @swagger
 * /inv/medicine:
 *   post:
 *     summary: Crear un registro de inventario
 *     tags: [inventory-service]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Medicine'
 *     responses:
 *       201:
 *         description: Medicamento creado exitosamente.
 */
router.post("/", medicineController.createMedicine);

/**
 * @swagger
 * /inv/medicine/{id}:
 *   put:
 *     summary: Modificar el inventario
 *     tags: [inventory-service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Medicine'
 *     responses:
 *       200:
 *         description: Medicamento actualizado.
 */
router.put("/:id", medicineController.updateMedicine);

/**
 * @swagger
 * /inv/medicine/{id}:
 *   patch:
 *     summary: Eliminar el inventario (Desactivar)
 *     tags: [inventory-service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medicamento desactivado correctamente.
 */
router.patch("/:id", medicineController.deactivateMedicine);

export default router;