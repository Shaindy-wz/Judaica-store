import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';

await mongoose.connect(process.env.MONGODB_URI);

const email = 'admin@judaica-store.com';
const password = 'Admin1234!';

const existing = await User.findOne({ email });
if (existing) {
  existing.role = 'admin';
  await existing.save();
  console.log('Updated existing user to admin:', email);
} else {
  await User.create({
    email,
    passwordHash: await bcrypt.hash(password, 12),
    firstName: 'Admin',
    lastName: 'Store',
    role: 'admin',
  });
  console.log('Admin user created:', email, '/', password);
}

await mongoose.disconnect();
