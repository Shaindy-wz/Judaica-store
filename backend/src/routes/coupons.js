import { Router } from 'express';
import { validate } from '../controllers/couponController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/validate', optionalAuth, validate);

export default router;
