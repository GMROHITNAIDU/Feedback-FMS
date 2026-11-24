import jwt from 'jsonwebtoken';
import User from './models/User.js';

export async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ message: 'Authentication required' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Account no longer exists' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired session. Please sign in again.' });
  }
}
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Administrator access required' });
  next();
}
