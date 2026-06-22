import { Router } from 'express';
import { list, getBySlug, featured, newArrivals } from '../controllers/productController.js';
import { getProductReviews, submitReview } from '../controllers/reviewController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', list);
router.get('/featured', featured);
router.get('/new', newArrivals);
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', requireAuth, submitReview);
router.get('/:slug', getBySlug);

export default router;
