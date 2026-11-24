import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  full_name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('User', userSchema);
