import { Router } from 'express';
import { addRecord, getByCarnet } from '../controller/record.controller.js';
import { auth } from '../../middlewares/auth.js';

const router = Router();

router.post('/add', auth, addRecord);

router.get('/:carnet', auth, getByCarnet);

export default router;