import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';

// Credentials come from the environment so the same script can create the first
// admin or reset a forgotten password, without a password ever living in git:
//   ADMIN_EMAIL=me@example.com ADMIN_PASSWORD='...' npm run create:admin
const email = (process.env.ADMIN_EMAIL || 'admin@judaica-store.com').toLowerCase().trim();
const password = process.env.ADMIN_PASSWORD || 'Admin1234!';

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set — point it at the database you want to change.');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });

const passwordHash = await bcrypt.hash(password, 12);
const existing = await User.findOne({ email });

if (existing) {
  // Promote and reset in one step — this is the "I lost the admin password" path.
  existing.role = 'admin';
  existing.passwordHash = passwordHash;
  await existing.save();
  console.log(`Admin updated, password reset: ${email}`);
} else {
  await User.create({
    email,
    passwordHash,
    firstName: 'Admin',
    lastName: 'Store',
    role: 'admin',
  });
  console.log(`Admin created: ${email}`);
}

console.log('Sign in at /admin/login');
await mongoose.disconnect();
