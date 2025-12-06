// routes/memberRoutes.js
const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
router.get('/remaining', memberController.getRemainingMembers);


// Create Member
router.post('/', memberController.createMember);
router.post('/add', memberController.createMember);

// Get All Members
router.get('/', memberController.getMembers);

// Get Active Members (with chits)
router.get('/active', memberController.getActiveMembers);

// Get Won Members (already won)
router.get('/won', memberController.getWonMembers);

// Get Cycle Stats
router.get('/stats/cycle', memberController.getCycleStats);

// Single member operations (AFTER specific routes)
router.get('/:id', memberController.getMember);
router.put('/:id', memberController.updateMember);
router.delete('/:id', memberController.deleteMember);

module.exports = router;