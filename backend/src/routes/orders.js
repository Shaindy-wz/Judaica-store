import { Router } from 'express';
import { create, myOrders, getById, mockPay } from '../controllers/orderController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/mock-pay', optionalAuth, mockPay);
router.post('/', requireAuth, create);
router.get('/my', requireAuth, myOrders);
router.get('/:id', requireAuth, getById);

export default router;
