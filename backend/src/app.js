import express from 'express';
import cors from 'cors';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import ordersRouter from './routes/orders.js';
import authRouter from './routes/auth.js';
import couponsRouter from './routes/coupons.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/auth', authRouter);
app.use('/api/coupons', couponsRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
