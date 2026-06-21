import { Router } from 'express';
import { create, myOrders, getById } from '../controllers/orderController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, create);
router.get('/my', requireAuth, myOrders);
router.get('/:id', requireAuth, getById);

export default router;
