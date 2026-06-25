import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth, adminOnly } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import { getDashboard } from '../controllers/admin/dashboardController.js';
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getUploadSignature,
} from '../controllers/admin/adminProductController.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import {
  listOrders,
  getOrder,
  updateOrderStatus,
} from '../controllers/admin/adminOrderController.js';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/admin/adminCategoryController.js';
import {
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/admin/adminCouponController.js';
import {
  listReviews,
  approveReview,
  rejectReview,
} from '../controllers/admin/adminReviewController.js';
import {
  listCustomers,
  getCustomerOrders,
} from '../controllers/admin/adminCustomerController.js';

const router = Router();

// All admin routes require a valid JWT with role: 'admin'
router.use(requireAuth, adminOnly);

// Dashboard
router.get('/dashboard', getDashboard);

// Products
router.get('/products', listProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Image upload — local storage (dev). Set CLOUDINARY_* env vars to use Cloudinary instead.
router.post('/upload', uploadSingle, (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const url = `/uploads/products/${req.file.filename}`;
  res.json({ url });
});

// Cloudinary direct-upload signature (optional, for production)
router.get('/upload-signature', getUploadSignature);

// Orders
router.get('/orders', listOrders);
router.get('/orders/:id', getOrder);
router.put('/orders/:id/status', updateOrderStatus);

// Categories
router.get('/categories', listCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Coupons
router.get('/coupons', listCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Reviews
router.get('/reviews', listReviews);
router.put('/reviews/:id/approve', approveReview);
router.put('/reviews/:id/reject', rejectReview);

// Customers
router.get('/customers', listCustomers);
router.get('/customers/:id/orders', getCustomerOrders);

export default router;
