import express, { Router } from 'express';
import { getConfig, createSession, getStatus, webhook } from '../controllers/paymentController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/config', getConfig);
router.post('/create-session', optionalAuth, createSession);
// Nedarim may post the CallBack as JSON, as a form or as JSON in text/plain.
router.post('/webhook', express.urlencoded({ extended: false }), express.text({ type: 'text/plain' }), webhook);
router.get('/:orderId/status', getStatus);

export default router;
