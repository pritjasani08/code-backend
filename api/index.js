// Serverless function wrapper for Express backend
// This file wraps the Express app to work as a Vercel serverless function

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import database connection (will connect when function is invoked)
try {
  require('../config/database');
} catch (error) {
  console.error('Database connection error:', error.message);
}

const app = express();

// Middleware - CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      process.env.VERCEL ? `https://${process.env.VERCEL}` : null,
      process.env.FRONTEND_DOMAIN
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      // In production, allow any Vercel preview/deployment URL
      if (origin.includes('vercel.app') || origin.includes('vercel.dev')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files statically (if they exist)
try {
  app.use('/uploads', express.static(path.join(__dirname, '../backend/uploads')));
} catch (error) {
  console.warn('Could not serve uploads directory:', error.message);
}

// Routes
app.use('/api/auth', require('../routes/auth'));
app.use('/api/users', require('../routes/users'));
app.use('/api/announcements', require('../routes/announcements'));
app.use('/api/team', require('../routes/team'));
app.use('/api/events', require('../routes/events'));
app.use('/api/admin', require('../routes/admin'));
app.use('/api/upload', require('../routes/upload'));
app.use('/api/resources', require('../routes/resources'));
app.use('/api/code', require('../routes/code'));
app.use('/api/aptitude', require('../routes/aptitude'));
app.use('/api/concept', require('../routes/concept'));
app.use('/api', require('../routes/contact'));


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', 
    message: 'Server is running',
     timestamp: new Date().toISOString() });
});

// Export the Express app as a serverless function
// Vercel will automatically handle this as a serverless function

module.exports = app;

