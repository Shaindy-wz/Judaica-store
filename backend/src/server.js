import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

// The HTTP server starts first and the database connects behind it. On a host
// that health-checks the service, a database outage used to kill the process on
// boot, so the host never marked the service live and every request hung until
// it timed out. Now the service always answers — /api/health reports the real
// database state and data routes fail fast with a readable error.
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const RETRY_MS = 10_000;

async function connectWithRetry() {
  try {
    await connectDB();
  } catch (err) {
    console.error(
      `MongoDB connection failed: ${err.message} — retrying in ${RETRY_MS / 1000}s`
    );
    setTimeout(connectWithRetry, RETRY_MS);
  }
}

connectWithRetry();
