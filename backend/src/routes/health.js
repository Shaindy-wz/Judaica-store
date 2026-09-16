import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Deliberately free of any database query: the host's health check must be able
// to answer even while MongoDB is unreachable, otherwise the service never goes
// live and every request hangs instead of returning a readable error.
router.get('/', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    db: states[mongoose.connection.readyState] ?? 'unknown',
  });
});

export default router;
