import mongoose from 'mongoose';

const { Schema } = mongoose;

// Uploaded product images live in MongoDB rather than on disk: the host's
// filesystem is wiped on every restart/redeploy, the database is not.
const ImageSchema = new Schema({
  data: { type: Buffer, required: true },
  contentType: { type: String, required: true },
  size: { type: Number, required: true },
  originalName: String,
}, { timestamps: true });

export default mongoose.model('Image', ImageSchema);
