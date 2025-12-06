// server.js - COMPLETE PRODUCTION READY WITH AUTH
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== MONGODB CONNECTION ====================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/committee-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ==================== IMPORT ROUTES ====================
const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const winnerRoutes = require('./routes/winnerRoutes');
const schedulerRoutes = require('./routes/schedulerRoutes');
const resetRoutes = require('./routes/resetRoutes');
const messageRoutes = require('./routes/messageRoutes');

// ==================== IMPORT SCHEDULER ====================
const scheduler = require('./services/scheduler');

// ==================== USE ROUTES ====================
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/winners', winnerRoutes);
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/reset', resetRoutes);
app.use('/api/messages', messageRoutes);

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    message: 'API is working',
    schedulerRunning: scheduler.isRunning,
    timestamp: new Date().toISOString()
  });
});

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Internal Server Error', 
    error: err.message 
  });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth routes: http://localhost:${PORT}/api/auth/login`);
  
  // Start the scheduler on server startup
  scheduler.startScheduler();
  console.log('🎯 Auto-scheduler started - Winners drawn daily at 8 PM');
  console.log('🎲 Winner selection: TRULY RANDOM (Fisher-Yates algorithm)');
  console.log('💬 Message system: ACTIVE');
});
