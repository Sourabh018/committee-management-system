// routes/schedulerRoutes.js
const express = require('express');
const router = express.Router();
const scheduler = require('../services/scheduler');

// Get latest scheduled winners (for dashboard display)
router.get('/winners', (req, res) => {
  try {
    const winners = scheduler.getScheduledWinners();
    if (!winners) {
      return res.status(200).json({
        message: 'No scheduled winners yet',
        data: null
      });
    }
    res.json(winners);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching scheduled winners', error: err.message });
  }
});

// Mark winners as displayed (after showing notification)
router.post('/winners/displayed', (req, res) => {
  try {
    scheduler.markWinnersDisplayed();
    res.json({ message: '✅ Winners marked as displayed' });
  } catch (err) {
    res.status(500).json({ message: 'Error marking winners', error: err.message });
  }
});

// Get next draw time countdown
router.get('/next-draw', (req, res) => {
  try {
    const nextDraw = scheduler.getNextDrawTime();
    res.json(nextDraw);
  } catch (err) {
    res.status(500).json({ message: 'Error getting next draw time', error: err.message });
  }
});

// Get scheduler stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await scheduler.getAutoDrawStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Error getting scheduler stats', error: err.message });
  }
});

// Manual trigger draw (for testing - remove in production)
router.post('/test-draw', async (req, res) => {
  try {
    const result = await scheduler.manualTriggerDraw();
    if (!result) {
      return res.status(400).json({ message: 'Cannot draw - not enough active members' });
    }
    res.json({
      message: '✅ Manual draw completed',
      winners: result.winners,
      week: result.week,
      totalPot: result.totalPot
    });
  } catch (err) {
    res.status(500).json({ message: 'Error in manual draw', error: err.message });
  }
});

// Start scheduler
router.post('/start', (req, res) => {
  try {
    scheduler.startScheduler();
    res.json({ message: '✅ Scheduler started', status: 'running' });
  } catch (err) {
    res.status(500).json({ message: 'Error starting scheduler', error: err.message });
  }
});

// Stop scheduler
router.post('/stop', (req, res) => {
  try {
    scheduler.stopScheduler();
    res.json({ message: '⏹️ Scheduler stopped', status: 'stopped' });
  } catch (err) {
    res.status(500).json({ message: 'Error stopping scheduler', error: err.message });
  }
});

// Get scheduler status
router.get('/status', async (req, res) => {
  try {
    const stats = await scheduler.getAutoDrawStats();
    res.json({
      isRunning: stats.schedulerRunning,
      nextDraw: scheduler.getNextDrawTime(),
      stats: stats
    });
  } catch (err) {
    res.status(500).json({ message: 'Error getting scheduler status', error: err.message });
  }
});

module.exports = router;