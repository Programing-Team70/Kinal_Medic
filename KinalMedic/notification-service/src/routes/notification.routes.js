import { Router } from 'express';
import { requestMedicalHelp } from '../controller/notification.controller.js';
import { validateNotification } from '../../middlewares/validate-request.js';

const router = Router();

/**
 * @swagger
 * /api/notifications/request-help:
 *   post:
 *     summary: Enviar una alerta médica inmediata
 *     description: Envía un correo electrónico estructurado al médico especificado con los detalles del estudiante y la urgencia.
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationInput'
 *     responses:
 *       200:
 *         description: Correo enviado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationResponse'
 *       400:
 *         description: Error en la validación de los datos (middleware)
 *       500:
 *         description: Error interno al intentar enviar el correo (Nodemailer)
 */
router.post('/request-help', [validateNotification], requestMedicalHelp);

export default router;