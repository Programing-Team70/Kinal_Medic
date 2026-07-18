import { Router } from 'express';
import { addRecord, getByCarnet, updateRecord, deleteRecord, getAllRecords } from '../controller/record.controller.js';
import { auth } from '../../middlewares/auth.js';

const router = Router();

/**
 * @swagger
 * /api/records/add:
 *   post:
 *     summary: Registro médico (Crear)
 *     tags: [medical-records-service]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicalRecordInput'
 *     responses:
 *       201:
 *         description: Registro guardado exitosamente
 *       400:
 *         description: Error en los datos enviados
 */
router.post('/add', auth, addRecord);

/**
 * @swagger
 * /api/records/all:
 *   get:
 *     summary: Registro médico completo
 *     tags: [medical-records-service]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de registros clínicos encontrados exitosamente
 *       404:
 *         description: Error interno del servidor
 */
router.get('/all', auth, getAllRecords);

/**
 * @swagger
 * /api/records/{carnet}:
 *   get:
 *     summary: Registro médico (Consultar por Carnet)
 *     tags: [medical-records-service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carnet
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de registros encontrados
 *       404:
 *         description: No se encontraron registros
 */
router.get('/:carnet', auth, getByCarnet);

/**
 * @swagger
 * /api/records/update/{id}:
 *   put:
 *     summary: Modificar registro (Solo Admin)
 *     tags: [medical-records-service]
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
 *             $ref: '#/components/schemas/MedicalRecordInput'
 *     responses:
 *       200:
 *         description: Registro actualizado correctamente
 *       403:
 *         description: Acceso denegado (No es Admin)
 */
router.put('/update/:id', auth, updateRecord);

/**
 * @swagger
 * /api/records/delete/{id}:
 *   delete:
 *     summary: Eliminar registro (Solo Admin)
 *     tags: [medical-records-service]
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
 *         description: Registro eliminado exitosamente
 */
router.delete('/delete/:id', auth, deleteRecord);

export default router;