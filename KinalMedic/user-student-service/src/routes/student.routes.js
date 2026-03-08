import { Router } from 'express';
import * as studentController from '../controller/student.controller.js';
import { login } from '../controller/auth.controller.js';
import { verifyToken, isAdmin } from '../../middlewares/auth.js';

const router = Router();

router.post('/register', studentController.register); 
router.post('/login', login);

router.get('/me', verifyToken, studentController.getMyProfile);

router.get('/all', verifyToken, isAdmin, studentController.getStudents);
router.post('/create', verifyToken, isAdmin, studentController.createStudent);
router.get('/carnet/:carnet', verifyToken, isAdmin, studentController.getStudentByCarnet);

export default router;