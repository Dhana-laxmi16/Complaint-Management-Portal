require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ---------- Connect to MongoDB ----------
connectDB();

// ---------- Global Middleware ----------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve uploaded attachments statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- API Routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Complaint Management Portal API is running.' });
});

// ---------- Serve Frontend (static files) ----------
app.use(express.static(path.join(__dirname, 'public')));

// Fallback: any non-API route serves index.html (keeps direct links to pages working)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
    if (err) next();
  });
});

// ---------- Global error handler ----------
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Complaint Management Portal server running on http://localhost:${PORT}`);
});
