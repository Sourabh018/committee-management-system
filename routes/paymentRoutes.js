// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Create Payment
router.post('/', paymentController.addPayment);
router.post('/add', paymentController.addPayment);

// Get All Payments
router.get('/', paymentController.getPayments);

// Get Payment Summary
router.get('/summary/total', paymentController.getPaymentSummary);

// Get Payments by Month
router.get('/month/:month', paymentController.getPaymentsByMonth);

// Get Payments by Member (AFTER specific routes)
router.get('/member/:memberId', paymentController.getPaymentsByMember);

// Single payment operations (AFTER specific routes)
router.get('/:id', paymentController.getPayment);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);

module.exports = router;