import { Router } from 'express';
import { listPending, approve, reject } from '../../controllers/reviewController.js';

const router = Router();

router.get('/', listPending);
router.put('/:id/approve', approve);
router.put('/:id/reject', reject);

export default router;
