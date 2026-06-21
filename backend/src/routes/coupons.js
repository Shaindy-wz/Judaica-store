import { Router } from 'express';
import { validate } from '../controllers/couponController.js';

const router = Router();

router.post('/validate', validate);

export default router;
