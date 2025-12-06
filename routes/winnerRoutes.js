// routes/winnerRoutes.js
const express = require('express');
const router = express.Router();

// Import all functions from controller
const {
  addWinner,
  getWinners,
  updateWinner,
  deleteWinner,
  drawWinners,
  getWinnerHistory,
  getWinnersByWeek,
  getCycleStatus,
  startNewCycle
} = require('../controllers/winnerController');

// CRUD Operations
router.post('/', addWinner);
router.post('/add', addWinner);
router.get('/', getWinners);

// Cycle Management (BEFORE /:id routes)
router.get('/cycle/status', getCycleStatus);
router.post('/cycle/start', startNewCycle);
router.get('/history', getWinnerHistory);
router.get('/week/:id', getWinnersByWeek);

// Draw Winners with chit removal
router.post('/draw/run', drawWinners);

// Update & Delete (AFTER specific routes)
router.put('/:id', updateWinner);
router.delete('/:id', deleteWinner);

module.exports = router;