require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serverless-friendly Database Connection Handler
let isConnected = false;
const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log(`Connected to MongoDB Atlas! Database: "${conn.connection.name}"`);
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
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
  res.status(200).json({ status: 'OK', message: 'Backend is running correctly on Vercel' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
