import mongoose from 'mongoose';

// Fail fast instead of leaving requests hanging: if the cluster cannot be
// reached (wrong URI, or the Atlas IP allow-list not covering the host), the
// connect attempt gives up after 8s and a queued query errors after 5s, so the
// browser gets a real error message rather than a request that never returns.
mongoose.set('bufferTimeoutMS', 5000);

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set in the environment');
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log('MongoDB connected');
}
