import mongoose from 'mongoose';

const { Schema } = mongoose;

const CategorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  image: String,
  parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  order: { type: Number, default: 0 },
});

export default mongoose.model('Category', CategorySchema);
