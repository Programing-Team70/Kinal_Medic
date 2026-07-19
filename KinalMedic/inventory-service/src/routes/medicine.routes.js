import { Router } from "express";
import * as medicineController from "../controller/medicine.controller.js";
import { validateJWT } from "../../middlewares/JWT.middleware.js";
import { verifyAdminRole } from "../../middlewares/role.middleware.js";

const router = Router();

router.use(validateJWT, verifyAdminRole);

/**
 * @swagger
 * /inv/medicine/all:
 *   get:
 *     summary: Obtener todo el inventario de medicamentos
 *     tags: [inventory-service]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Arreglo con todos los medicamentos registrados.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Medicine' } }
 */
router.get("/all", medicineController.getMedicines);

/**
 * @swagger
 * /inv/medicine/find/{id}:
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
router.get("/find/:id", medicineController.getMedicine);

/**
 * @swagger
 * /inv/medicine/add:
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
router.post("/add", medicineController.createMedicine);

/**
 * @swagger
 * /inv/medicine/update/{id}:
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
router.put("/update/:id", medicineController.updateMedicine);

/**
 * @swagger
 * /inv/medicine/deactivate/{id}:
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
router.patch("/deactivate/:id", medicineController.deactivateMedicine);

/**
 * @swagger
 * /inv/medicine/consume/{id}:
 *   patch:
 *     summary: Descontar stock al recetar un medicamento
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity: { type: number, example: 1 }
 *     responses:
 *       200:
 *         description: Stock descontado correctamente.
 *       400:
 *         description: Stock insuficiente o cantidad inválida.
 */
router.patch("/consume/:id", medicineController.consumeStock);

export default router;