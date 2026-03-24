import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
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

import { errorHandler, notFound } from './middlewares/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Verify email configuration
verifyEmailConfig();

// Basic CORS - Allow all origins for testing
app.use(cors());

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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/resume-generator', resumeGeneratorRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/ats', atsRoutes);

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
      resumeGenerator: '/api/resume-generator',
      portfolio: '/api/portfolio',
      ats: '/api/ats',
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