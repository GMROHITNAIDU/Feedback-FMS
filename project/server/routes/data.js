import { Router } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Feedback from '../models/Feedback.js';
import { authenticate, requireAdmin } from '../middleware.js';
const router = Router();
const models = { profiles: User, products: Product, feedback: Feedback };
const serialize = (doc) => {
  const obj = doc.toObject ? doc.toObject() : doc;
  if (obj._id) { obj.id = obj._id.toString(); delete obj._id; }
  delete obj.__v; delete obj.password;
  for (const key of ['user_id', 'product_id']) if (obj[key] && typeof obj[key] !== 'string') obj[key] = obj[key].toString();
  return obj;
};
router.use(authenticate);
router.get('/:table', async (req, res) => {
  try {
    const { table } = req.params; const Model = models[table];
    if (!Model) return res.status(404).json({ message: 'Unknown collection' });
    const filter = {};
    for (const [key, value] of Object.entries(req.query)) {
      if (['orderBy', 'ascending', 'limit', 'in_id'].includes(key)) continue;
      if (key === 'id' || key === 'user_id' || key === 'product_id') {
        if (key === 'id') filter._id = value;
        else filter[key] = value;
      }
    }
    if (req.query.in_id) filter._id = { $in: String(req.query.in_id).split(',').filter(mongoose.isValidObjectId) };
    if (table === 'profiles') {
      if (req.user.role !== 'admin') filter._id = req.user._id;
      const docs = await Model.find(filter).sort({ created_at: -1 }).limit(500);
      return res.json(docs.map(serialize));
    }
    if (table === 'feedback' && req.user.role !== 'admin') filter.user_id = req.user._id;
    let query = Model.find(filter);
    if (req.query.orderBy) query = query.sort({ [req.query.orderBy]: req.query.ascending === 'true' ? 1 : -1 });
    if (req.query.limit) query = query.limit(Math.min(Number(req.query.limit) || 100, 500));
    const docs = await query;
    const rows = docs.map(serialize);
    if (table === 'feedback' && String(req.query.withProduct) === 'true') {
      const productIds = [...new Set(rows.map((r) => r.product_id))];
      const products = await Product.find({ _id: { $in: productIds } });
      const byId = Object.fromEntries(products.map((p) => [p._id.toString(), serialize(p)]));
      rows.forEach((r) => { r.product = byId[r.product_id]; });
    }
    res.json(rows);
  } catch (error) { res.status(400).json({ message: error.message }); }
});
router.post('/:table', async (req, res) => {
  try {
    const { table } = req.params; const Model = models[table];
    if (!Model || table === 'profiles') return res.status(404).json({ message: 'Unsupported collection' });
    if (table === 'products') { if (req.user.role !== 'admin') return res.status(403).json({ message: 'Administrator access required' }); }
    let payload = { ...req.body };
    if (table === 'feedback') {
      payload.user_id = req.user._id;
      if (!await Product.exists({ _id: payload.product_id })) return res.status(400).json({ message: 'Selected product does not exist.' });
    }
    const doc = await Model.create(payload);
    res.status(201).json(serialize(doc));
  } catch (error) { res.status(400).json({ message: error.message }); }
});
router.patch('/:table/:id', async (req, res) => {
  try {
    const { table, id } = req.params; const Model = models[table];
    if (!Model || !mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Record not found' });
    if (table === 'profiles' || table === 'products' || table === 'feedback') {
      if (req.user.role !== 'admin') return res.status(403).json({ message: 'Administrator access required' });
    }
    const allowed = table === 'products' ? ['name', 'description'] : ['status', 'sentiment', 'category', 'admin_reply'];
    const payload = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const doc = await Model.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: 'Record not found' });
    res.json(serialize(doc));
  } catch (error) { res.status(400).json({ message: error.message }); }
});
router.delete('/:table/:id', async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Administrator access required' });
    const Model = models[req.params.table];
    if (!Model || !mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Record not found' });
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Record not found' });
    if (req.params.table === 'products') await Feedback.deleteMany({ product_id: doc._id });
    if (req.params.table === 'profiles') await Feedback.deleteMany({ user_id: doc._id });
    res.json({ message: 'Deleted successfully' });
  } catch (error) { res.status(400).json({ message: error.message }); }
});
export default router;
