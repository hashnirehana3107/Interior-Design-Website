require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS: allow localhost in dev, and Vercel frontend URL in production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI).then((conn) => {
  console.log(`Connected to MongoDB Atlas! Database: "${conn.connection.name}"`);
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/consultations', require('./routes/consultations'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/hero-slides', require('./routes/heroSlides'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/services', require('./routes/services'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/contact-settings', require('./routes/contactSettings'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/subscribers', require('./routes/subscribers'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/about', require('./routes/about'));
app.use('/api/users', require('./routes/users'));
app.use('/api/home-settings', require('./routes/homePageSettings'));
app.use('/api/global-settings', require('./routes/globalSettings'));
app.use('/api/auth-branding', require('./routes/authBranding'));


app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running correctly' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
