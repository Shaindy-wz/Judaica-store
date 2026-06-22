import { Router } from 'express';
import { create, myOrders, getById, getInvoice } from '../controllers/orderController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, create);
router.get('/my', requireAuth, myOrders);
router.get('/:id', requireAuth, getById);
router.get('/:id/invoice', requireAuth, getInvoice);

export default router;
