import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler.middleware';
import { env } from './config/env';

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow dev access
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing with safe size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate Limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Max 500 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api/', generalLimiter);

// Serve local static uploaded profile photos
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Root welcome route
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    name: 'PRISM API — LGBTQ+ Friendly Profile Discovery Platform',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      profiles: '/api/profiles',
      featured: '/api/profiles/featured',
    },
  });
});

// Health Check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'PRISM API',
    uptime: process.uptime(),
  });
});

// Mount Routes on both /api/v1 and /api
app.use('/api/v1', apiRoutes);
app.use('/api', apiRoutes);

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
