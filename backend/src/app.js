import express from 'express';
import cors from 'cors';
import compression from 'compression';
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
import healthRouter from './routes/health.js';
import imagesRouter from './routes/images.js';
import paymentsRouter from './routes/payments.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Render terminates HTTPS at its proxy; trust it so req.protocol is 'https'.
app.set('trust proxy', 1);

// FRONTEND_URL may hold a comma-separated list, so the same server can accept
// the local dev origin and the deployed one at the same time.
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Once the store has its own domain, PUBLIC_URL names it. Pages opened on any
// other host (the *.onrender.com address) are sent there, so customers, search
// engines and the login cookie all end up on one address. /api is left alone:
// the host's health check and in-flight payment callbacks still use it.
const canonicalUrl = process.env.PUBLIC_URL ? new URL(process.env.PUBLIC_URL) : null;

app.use((req, res, next) => {
  if (!canonicalUrl || req.hostname === canonicalUrl.hostname) return next();
  if (req.hostname === 'localhost' || req.path.startsWith('/api')) return next();
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  return res.redirect(301, `${canonicalUrl.origin}${req.originalUrl}`);
});

// gzip every text response (JS bundle, CSS, JSON) — roughly a 70% cut in bytes.
// Images are already compressed, so the filter skips them.
app.use(compression());

// Browsers send an Origin header even on same-origin POSTs, so the store's own
// pages are always allowed — whatever domain it is reached on — and an
// incomplete FRONTEND_URL can no longer break logins and image uploads.
app.use(cors((req, callback) => {
  const origin = req.get('origin');
  const sameOrigin = origin === `${req.protocol}://${req.get('host')}`;
  const allowed = !origin || sameOrigin || allowedOrigins.includes(origin);
  callback(allowed ? null : new Error(`Origin ${origin} is not allowed by CORS`), {
    origin: allowed,
    credentials: true,
  });
}));
app.use(cookieParser());
// A product import posts a whole spreadsheet, far past the 100kb default. The
// global parser skips that route; it parses its own body once the admin check
// has passed (routes/admin.js), so anonymous requests never get the big limit.
const jsonBody = express.json();
app.use((req, res, next) => (req.path === '/api/admin/products/import' ? next() : jsonBody(req, res, next)));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Mounted first and DB-free so the host's health check answers instantly, even
// during a cold start or while MongoDB is unreachable.
app.use('/api/health', healthRouter);

app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/auth', authRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/search', searchRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/images', imagesRouter);
app.use('/api/payments', paymentsRouter);

// Anything under /api that reached this point is a genuine 404 — answer with
// JSON rather than falling through to the SPA shell below.
app.use('/api', notFound);

// In production one service serves both the API and the built React app, so the
// site runs on a single origin (no CORS, no second host to keep in sync).
const distDir = path.resolve(__dirname, '../../frontend/dist');

if (fs.existsSync(distDir)) {
  // Vite fingerprints every file under /assets, so a new build always means a
  // new URL — those can be cached for a year. index.html must never be cached
  // or the browser keeps loading the previous build's asset names.
  app.use(express.static(distDir, {
    setHeaders(res, filePath) {
      if (filePath.includes(`${path.sep}assets${path.sep}`)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  }));

  // React Router owns client-side routes, so every remaining GET returns
  // index.html and lets the router resolve the path in the browser.
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    // sendFile bypasses the static middleware above, so repeat the rule here.
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
