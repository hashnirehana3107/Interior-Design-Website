require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Global Mongoose Query Timeout Protection (Prevents queries from hanging backend > 8s)
mongoose.plugin((schema) => {
  schema.pre(['find', 'findOne', 'findOneAndUpdate', 'countDocuments'], function () {
    if (!this.getOptions().maxTimeMS) {
      this.maxTimeMS(8000);
    }
  });
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection Handler with Promise Caching for Vercel Serverless
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:Admin%40123@cluster0.910rlkg.mongodb.net/interior_design_db?retryWrites=true&w=majority';
let isConnected = false;
let cachedPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (mongoose.connection.readyState === 2 && cachedPromise) return cachedPromise;

  if (!cachedPromise) {
    const opts = {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
      family: 4, // Force IPv4 resolution for Vercel serverless compatibility
    };

    cachedPromise = mongoose.connect(MONGODB_URI, opts)
      .then((conn) => {
        isConnected = true;
        console.log(`Connected to MongoDB Atlas! Database: "${conn.connection.db.databaseName}"`);
        return conn;
      })
      .catch((err) => {
        cachedPromise = null;
        isConnected = false;
        console.error('MongoDB connection error:', err.message);
        throw err;
      });
  }

  return cachedPromise;
};

// Instantly start connecting on serverless cold start
connectDB().catch((err) => {
  console.warn('Initial serverless pre-connect warning:', err.message);
});

// ── Startup Cache Pre-Warmer ──
// Fires internal HTTP requests right after server starts so
// all major endpoints are cached BEFORE the admin dashboard arrives.
const prewarmCache = () => {
  const http = require('http');
  const endpoints = [
    '/api/hero-slides',
    '/api/home-settings',
    '/api/projects/hero',
    '/api/projects',          // ← important: run early and awaited
    '/api/services/hero',
    '/api/services',
    '/api/services/process',
    '/api/services/why-features',
    '/api/gallery/hero',
    '/api/gallery/items',
    '/api/blog/hero',
    '/api/blog/posts',
    '/api/testimonials/hero',
    '/api/testimonials',
    '/api/about',
    '/api/global-settings',
    '/api/auth-branding',
    '/api/contact-settings',
    '/api/contact-settings/features',
    '/api/careers/hero',
    '/api/careers/jobs',
  ];

  console.log('Pre-warming cache for', endpoints.length, 'endpoints...');

  // Run sequentially so each slow Atlas query completes before triggering the next
  const warmNext = (idx) => {
    if (idx >= endpoints.length) {
      console.log('Cache pre-warm complete. All endpoints ready.');
      return;
    }
    const path = endpoints[idx];
    console.log(`[Pre-warm ${idx + 1}/${endpoints.length}] ${path}`);
    const req = http.get({ host: '127.0.0.1', port: PORT, path, timeout: 25000 }, res => {
      res.resume();
      res.on('end', () => warmNext(idx + 1));
    });
    req.on('timeout', () => { req.destroy(); warmNext(idx + 1); });
    req.on('error', () => warmNext(idx + 1));
  };

  setTimeout(() => warmNext(0), 800);
};

// Per-request fallback: ensure DB is connected before handling routes
app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    next();
  } catch (err) {
    console.error('Database middleware connection failure:', err.message);
    return res.status(503).json({ message: 'Server is starting up. Please try again in a few seconds.' });
  }
});

// Helper to mount routes with and without /api prefix for Vercel serverless compatibility
const mountRoute = (path, router) => {
  app.use(path, router);
  if (path.startsWith('/api/')) {
    app.use(path.substring(4), router);
  }
};

// Routes
mountRoute('/api/auth', require('./routes/auth'));
mountRoute('/api/consultations', require('./routes/consultations'));
mountRoute('/api/contact', require('./routes/contact'));
mountRoute('/api/hero-slides', require('./routes/heroSlides'));
mountRoute('/api/projects', require('./routes/projects'));
mountRoute('/api/services', require('./routes/services'));
mountRoute('/api/gallery', require('./routes/gallery'));
mountRoute('/api/contact-settings', require('./routes/contactSettings'));
mountRoute('/api/blog', require('./routes/blog'));
mountRoute('/api/subscribers', require('./routes/subscribers'));
mountRoute('/api/testimonials', require('./routes/testimonials'));
mountRoute('/api/about', require('./routes/about'));
mountRoute('/api/users', require('./routes/users'));
mountRoute('/api/home-settings', require('./routes/homePageSettings'));
mountRoute('/api/global-settings', require('./routes/globalSettings'));
mountRoute('/api/auth-branding', require('./routes/authBranding'));
mountRoute('/api/careers', require('./routes/careers'));

app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running correctly.' });
});

if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      prewarmCache();
    });
  });
}

module.exports = app;
