import { Router } from 'express';
import {
    requestMedicalHelp,
    requestEmergencyHelp,
    listRequests,
    respondToRequest,
} from '../controller/notification.controller.js';
import {
    validateNotification,
    validateEmergency,
} from '../../middlewares/validate-request.js';
import { verifyToken } from '../../middlewares/auth.js';

const router = Router();

router.post(
    '/request-help',
    verifyToken,
    validateNotification,
    requestMedicalHelp
);

router.post('/emergency', verifyToken, validateEmergency, requestEmergencyHelp);

router.get('/requests', verifyToken, listRequests);

router.post('/requests/:id/respond', verifyToken, respondToRequest);

export default router;
