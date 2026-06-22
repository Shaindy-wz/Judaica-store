import { Router } from 'express';
import { list, updateStatus } from '../../controllers/adminOrderController.js';

const router = Router();

router.get('/', list);
router.put('/:id/status', updateStatus);

export default router;
