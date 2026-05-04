import { Router } from 'express';
import * as studentController from '../controller/student.controller.js';
import { login } from '../controller/auth.controller.js';
import { verifyToken, isAdmin } from '../../middlewares/auth.js';

const router = Router();

/**
 * @swagger
 * /api/students/login:
 *   post:
 *     summary: Iniciar sesión (ADMIN y STUDENT) con su validación Token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales incorrectas
 */
router.post('/login', login);

/**
 * @swagger
 * /api/students/register:
 *   post:
 *     summary: Registrar un nuevo estudiante 
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentRegister'
 *     responses:
 *       201:
 *         description: Estudiante registrado con éxito
 */
router.post('/register', studentController.register); 

/**
 * 
 * @swagger
 * /api/students/create:
 *   post:
 *     summary: Registrar un estudiante (Admin puede hacer esto con Token)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentRegister'
 *     responses:
 *       201:
 *         description: Estudiante registrado con éxito
 */
router.post('/create', studentController.register);

/**
 * @swagger
 * /api/students/me:
 *   get:
 *     summary: Obtener mi perfil alumno (Token requerido STUDENT)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del perfil del usuario autenticado
 */
router.get('/me', verifyToken, studentController.getMyProfile);

/**
 * @swagger
 * /api/students/all:
 *   get:
 *     summary: Listar todos los estudiantes (Solo Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de estudiantes
 */
router.get('/all', verifyToken, isAdmin, studentController.getStudents);

/**
 * @swagger
 * /api/students/update/{id}:
 *   put:
 *     summary: Actualizar datos de usuario
 *     tags: [Admin]
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
 *             $ref: '#/components/schemas/StudentUpdate'
 *     responses:
 *       200:
 *         description: Usuario actualizado
 */
router.put('/update/:id', verifyToken, studentController.updateUser);

/**
 * @swagger
 * /api/students/delete/{id}:
 *   delete:
 *     summary: Eliminar un usuario
 *     tags: [Admin]
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
 *         description: Usuario eliminado
 */
router.delete('/delete/:id', verifyToken, studentController.deleteUser);

/**
 * @swagger
 * /api/students/carnet/{carnet}:
 *   get:
 *     summary: Buscar estudiante por carnet (Solo Admin)
 *     tags: [Admin]
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
 *         description: Estudiante encontrado
 */
router.get('/carnet/:carnet', verifyToken, isAdmin, studentController.getStudentByCarnet);

export default router;