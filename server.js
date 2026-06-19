import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import karyawanRoutes from './routes/karyawan.js';
import cutiRoutes from './routes/cuti.js';
import absensiRoutes from './routes/absensi.js';
import gajiRoutes from './routes/gaji.js';
import treatmentRoutes from './routes/treatment.js';
import slipGajiRoutes from './routes/slipGaji.js';
import publicRoutes from './routes/public.js';

// Load environment variables
dotenv.config();

// Provide safe default in development to avoid crashes on fresh clones.
// In production, require JWT_SECRET to be set for security.
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Missing JWT_SECRET environment variable. In production set `JWT_SECRET` in environment or `server/.env` and restart.');
    process.exit(1);
  } else {
    process.env.JWT_SECRET = 'dev_jwt_secret';
    console.warn('⚠️ `JWT_SECRET` not set — using development default. Set a secure value in `server/.env` or environment variables.');
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientBuildPath = path.join(__dirname, '..', 'build');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(clientBuildPath));

// Initialize MySQL database
import pool from './database/mysql.js';

console.log('✓ MySQL database initialized');

// Routes
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Gaji Demara API',
    version: '1.0.0',
    database: 'MySQL storage',
    endpoints: {
      menus: '/api/menus',
      auth: '/api/auth',
      karyawan: '/api/karyawan',
      cuti: '/api/cuti',
      absensi: '/api/absensi',
      gaji: '/api/gaji',
      treatment: '/api/treatment',
      slipGaji: '/api/slip-gaji'
    }
  });
});

app.use('/api/menus', menuRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/karyawan', karyawanRoutes);
app.use('/api/cuti', cutiRoutes);
app.use('/api/absensi', absensiRoutes);
app.use('/api/gaji', gajiRoutes);
app.use('/api/treatment', treatmentRoutes);
app.use('/api/slip-gaji', slipGajiRoutes);
app.use('/api/public', publicRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// SPA fallback for frontend routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
    if (err) {
      next(err);
    }
  });
});

// 404 handler for API and missing resources
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server with retry if port is in use
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`🚀 Server berjalan di http://localhost:${port}`);
    console.log(`📚 API Documentation tersedia di http://localhost:${port}/api`);
    console.log(`🏥 Health check di http://localhost:${port}/api/health`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} sudah digunakan. Mencoba port ${port + 1}...`);
      setTimeout(() => startServer(port + 1), 200);
    } else {
      console.error(err);
      process.exit(1);
    }
  });
}

startServer(Number(process.env.PORT) || 5000);

export default app;
