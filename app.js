// backend/app.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const memberRoutes = require('./routes/memberRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const winnerRoutes = require('./routes/winnerRoutes');
const resetRoutes = require('./routes/resetRoutes');
const authRoutes = require('./routes/authRoutes');  // ADD THIS

// Register routes
app.use('/api/members', memberRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/winners', winnerRoutes);
app.use('/api/reset', resetRoutes);
app.use('/api/auth', authRoutes);  // ADD THIS

// Database & Server start
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});