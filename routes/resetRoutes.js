// routes/resetRoutes.js
const express = require('express');
const router = express.Router();
const resetController = require('../controllers/resetController');
const { protect } = require('../middleware/authMiddleware');

/**
 * All reset routes require authentication
 * User must be logged in to access these endpoints
 */

/**
 * POST /api/reset/all
 * Reset all data (members, winners, payments)
 * Requires authentication + admin password in request body
 */
router.post('/all', protect, resetController.resetAllData);

/**
 * POST /api/reset/members
 * Reset only members
 * Requires authentication + admin password in request body
 */
router.post('/members', protect, resetController.resetMembers);

/**
 * POST /api/reset/winners
 * Reset only winners and start new cycle
 * Requires authentication + admin password in request body
 */
router.post('/winners', protect, resetController.resetWinners);

/**
 * POST /api/reset/payments
 * Reset only payment records
 * Requires authentication + admin password in request body
 */
router.post('/payments', protect, resetController.resetPayments);

module.exports = router;