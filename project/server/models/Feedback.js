import mongoose from 'mongoose';
const feedbackSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  type: { type: String, enum: ['Review', 'Suggestion', 'Complaint'], required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: null },
  category: { type: String, enum: ['Product Quality', 'Service', 'Pricing', 'Delivery', 'Other', null], default: null },
  sentiment: { type: String, enum: ['Positive', 'Negative', 'Neutral'], default: 'Neutral' },
  status: { type: String, enum: ['Pending', 'In Review', 'Resolved'], default: 'Pending' },
  admin_reply: { type: String, default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
export default mongoose.model('Feedback', feedbackSchema);
