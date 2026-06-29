import { Router } from 'express';
import { list, getBySlug, featured, newArrivals } from '../controllers/productController.js';

const router = Router();

router.get('/', list);
router.get('/featured', featured);
router.get('/new', newArrivals);
router.get('/:slug', getBySlug);

export default router;
