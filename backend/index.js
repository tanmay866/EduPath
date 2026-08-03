import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import { verifyEmailConfig } from './config/mailConfig.js';

// Import all routes
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import resumeGeneratorRoutes from './routes/resumeGeneratorRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import atsRoutes from './routes/atsRoutes.js';
import csRoutes from './routes/csRoutes.js';
import mockInterviewRoutes from './routes/mockInterviewRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';
import progressRoutes from './routes/progress.js';

import { errorHandler, notFound } from './middlewares/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Render terminates TLS at its proxy, so req.ip is the proxy's address unless we
// trust one hop. Rate limiting keys on req.ip — without this every request looks
// like it came from the same client and the limits apply to everyone at once.
app.set('trust proxy', 1);

const configuredFrontendOrigin = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
const isDevelopment = process.env.NODE_ENV !== 'production';

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (origin.replace(/\/+$/, '') === configuredFrontendOrigin) {
    return true;
  }

  if (isDevelopment) {
    return /^http:\/\/(localhost|127\.0\.0\.1|\[::1\]|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2}):\d+$/.test(origin);
  }

  return false;
};

// Connect to MongoDB
connectDB();

// Verify email configuration
verifyEmailConfig();

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Security headers. This service only ever returns JSON, so CSP protects nothing
// here and is disabled to avoid surprises; CORP has to be cross-origin because the
// frontend is served from a different origin than this API.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Rate limiting
const rateLimitResponse = (message) => ({ success: false, message });

// Broad ceiling for the whole API. Generous enough that normal use never sees it.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: rateLimitResponse('Too many requests. Please try again in a few minutes.'),
});

// Brute-force guard. skipSuccessfulRequests means only failed logins count, so a
// legitimate user is never locked out by their own successful sign-ins.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: rateLimitResponse('Too many failed login attempts. Please try again in 15 minutes.'),
});

// Endpoints that send email or create accounts — abuse here costs real money and
// inbox reputation, so successful requests count too.
const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: rateLimitResponse('Too many requests for this action. Please try again in an hour.'),
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/signup', sensitiveLimiter);
app.use('/api/auth/forgot-password', sensitiveLimiter);
app.use('/api/contact/send', sensitiveLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/resume-generator', resumeGeneratorRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/cs', csRoutes);
app.use('/api/mock-interview', mockInterviewRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/progress', progressRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EduPath API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to EduPath API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      profile: '/api/profile',
      quiz: '/api/quiz',
      contact: '/api/contact',
      resume: '/api/resume',
      resumeGenerator: '/api/resume-generator',
      portfolio: '/api/portfolio',
      ats: '/api/ats',
      cs: '/api/cs',
      mockInterview: '/api/mock-interview',
      roadmap: '/api/roadmap',
      progress: '/api/progress',
    },
  });
});

// 404 handler - must be after all other routes
app.use(notFound);

// Global error handler - must be last
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`EduPath Server is running`);
  console.log(`Port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Started at: ${new Date().toLocaleString()}`);
  console.log('='.repeat(50));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

export default app;
