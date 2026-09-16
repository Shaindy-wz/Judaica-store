import express from 'express';
import mongoose from 'mongoose';
import { getDbFailure } from '../config/db.js';

const router = express.Router();

// Deliberately free of any database query: the host's health check must be able
// to answer even while MongoDB is unreachable, otherwise the service never goes
// live and every request hangs instead of returning a readable error.
router.get('/', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const db = states[mongoose.connection.readyState] ?? 'unknown';
  const failure = getDbFailure();

  // `reason` is one of a closed set of codes from db.js, never a raw driver
  // message, so this stays safe to expose on a public endpoint.
  res.json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    db,
    ...(db !== 'connected' && failure ? { reason: failure } : {}),
  });
});

export default router;
