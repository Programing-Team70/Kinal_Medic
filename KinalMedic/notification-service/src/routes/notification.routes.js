import { Router } from 'express';

import { requestMedicalHelp } from '../controller/notification.controller.js';
import { validateNotification } from '../../middlewares/validate-request.js';

const router = Router();

router.post('/request-help', [validateNotification], requestMedicalHelp);

export default router;