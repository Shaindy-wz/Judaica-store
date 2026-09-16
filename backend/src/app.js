import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import ordersRouter from './routes/orders.js';
import authRouter from './routes/auth.js';
import couponsRouter from './routes/coupons.js';
import adminRouter from './routes/admin.js';
import searchRouter from './routes/search.js';
import reviewsRouter from './routes/reviews.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// FRONTEND_URL may hold a comma-separated list, so the same server can accept
// the local dev origin and the deployed one at the same time.
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // No origin header = same-origin request or a server-to-server call.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/auth', authRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/search', searchRouter);
app.use('/api/reviews', reviewsRouter);

// Anything under /api that reached this point is a genuine 404 — answer with
// JSON rather than falling through to the SPA shell below.
app.use('/api', notFound);

// In production one service serves both the API and the built React app, so the
// site runs on a single origin (no CORS, no second host to keep in sync).
const distDir = path.resolve(__dirname, '../../frontend/dist');

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));

  // React Router owns client-side routes, so every remaining GET returns
  // index.html and lets the router resolve the path in the browser.
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
