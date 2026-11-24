import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware.js';
const router = Router();
const publicUser = (u) => ({ id: u._id.toString(), full_name: u.full_name, email: u.email, role: u.role, created_at: u.created_at });
const issue = (u) => ({ token: jwt.sign({ id: u._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' }), user: publicUser(u) });

router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, admin_code } = req.body;
    if (!full_name?.trim() || !email?.trim() || !password || password.length < 6) return res.status(400).json({ message: 'Name, valid email and password (minimum 6 characters) are required.' });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: 'An account with this email already exists.' });
    const role = admin_code && process.env.ADMIN_SECRET && admin_code === process.env.ADMIN_SECRET ? 'admin' : 'customer';
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ full_name: full_name.trim(), email: normalizedEmail, password: passwordHash, role });
    res.status(201).json(issue(user));
  } catch (error) { res.status(500).json({ message: error.message || 'Registration failed' }); }
});
router.post('/login', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) return res.status(401).json({ message: 'Invalid email or password.' });
    res.json(issue(user));
  } catch (error) { res.status(500).json({ message: error.message || 'Login failed' }); }
});
router.get('/me', authenticate, (req, res) => res.json({ user: publicUser(req.user) }));
export default router;
