import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
export default mongoose.model('Product', productSchema);
