import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.use('/api/auth', authRoutes);
app.use('/api', dataRoutes);
app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ message: 'Internal server error' }); });

const port = process.env.PORT || 5000;
try {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing in server/.env');
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas');
  app.listen(port, () => console.log(`API server running at http://localhost:${port}`));
} catch (error) { console.error('Server startup failed:', error.message); process.exit(1); }
