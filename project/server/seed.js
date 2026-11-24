import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Product from './models/Product.js';
import Feedback from './models/Feedback.js';

await mongoose.connect(process.env.MONGODB_URI);
const adminPassword = process.env.DEMO_ADMIN_PASSWORD || 'Admin@123';
const customerPassword = process.env.DEMO_CUSTOMER_PASSWORD || 'Customer@123';
const adminHash = await bcrypt.hash(adminPassword, 12);
const customerHash = await bcrypt.hash(customerPassword, 12);
const admin = await User.findOneAndUpdate({ email: 'admin@demo.com' }, { $set: { full_name: 'Demo Administrator', password: adminHash, role: 'admin' } }, { upsert: true, new: true });
const customer = await User.findOneAndUpdate({ email: 'customer@demo.com' }, { $set: { full_name: 'Demo Customer', password: customerHash, role: 'customer' } }, { upsert: true, new: true });
const products = [
  ['FeedbackHub Pro', 'Premium feedback management platform with advanced analytics and team collaboration features.'],
  ['PulseSurvey', 'Lightweight survey tool for collecting quick customer pulse checks and NPS scores.'],
  ['InsightBoard', 'Real-time analytics dashboard for visualizing customer feedback trends and sentiment analysis.'],
  ['VoiceLoop', 'Closed-loop feedback system that automates follow-ups and tracks resolution across teams.'],
];
for (const [name, description] of products) await Product.updateOne({ name }, { $setOnInsert: { name, description } }, { upsert: true });
const productDocs = await Product.find();
if (await Feedback.countDocuments() === 0) {
  const comments = [
    ['Review', 5, 'Absolutely love the dashboard layout. The analytics view is incredibly useful.', 'Product Quality', 'Positive', 'Resolved'],
    ['Review', 4, 'Great visualization. Would love more chart customization options.', 'Service', 'Positive', 'In Review'],
    ['Suggestion', 4, 'CSV export for individual survey responses would be helpful.', 'Other', 'Neutral', 'Pending'],
    ['Complaint', 2, 'The mobile experience is slow when loading large reports.', 'Delivery', 'Negative', 'Pending'],
    ['Review', 5, 'The admin reply feature makes follow-up much smoother.', 'Product Quality', 'Positive', 'Resolved'],
  ];
  await Feedback.insertMany(comments.map((v, i) => ({ user_id: customer._id, product_id: productDocs[i % productDocs.length]._id, type: v[0], rating: v[1], comment: v[2], category: v[3], sentiment: v[4], status: v[5], admin_reply: v[5] === 'Resolved' ? 'Thank you for sharing your feedback!' : null, created_at: new Date(Date.now() - i * 86400000) })));
}
console.log('Seed complete. Demo admin: admin@demo.com / ' + adminPassword + '; demo customer: customer@demo.com / ' + customerPassword);
await mongoose.disconnect();
