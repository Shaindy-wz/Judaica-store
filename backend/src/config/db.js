import mongoose from 'mongoose';

// Fail fast instead of leaving requests hanging: if the cluster cannot be
// reached (wrong URI, or the Atlas IP allow-list not covering the host), the
// connect attempt gives up after 8s and a queued query errors after 5s, so the
// browser gets a real error message rather than a request that never returns.
mongoose.set('bufferTimeoutMS', 5000);

// The last connect failure, reduced to a fixed code. /api/health reports it so
// a misconfigured deploy can be diagnosed without dashboard log access, and the
// codes are a closed set precisely so no hostname, URI or credential can leak
// into a public response.
let lastFailure = null;

export function getDbFailure() {
  return lastFailure;
}

function classify(err) {
  const text = `${err.name}: ${err.message}`;
  if (/MONGODB_URI is not set/.test(text)) return 'missing-uri';
  if (/Invalid scheme|Invalid connection string/i.test(text)) return 'malformed-uri';
  if (/Authentication failed|bad auth|not authorized/i.test(text)) return 'auth-failed';
  if (/IP that isn't whitelisted|IP address is not allowed/i.test(text)) return 'ip-not-allowlisted';
  if (/ENOTFOUND|EAI_AGAIN|querySrv/i.test(text)) return 'dns-failure';
  if (/ECONNREFUSED|ETIMEDOUT|ServerSelection/i.test(text)) return 'unreachable';
  return 'unknown';
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    lastFailure = 'missing-uri';
    throw new Error('MONGODB_URI is not set in the environment');
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  } catch (err) {
    lastFailure = classify(err);
    throw err;
  }
  lastFailure = null;
  console.log('MongoDB connected');
}
