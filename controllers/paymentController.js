// controllers/paymentController.js
const Payment = require('../models/paymentModel');
const Member = require('../models/memberModel');

// Get today's date range
const getTodayDateRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return { start: today, end: tomorrow };
};

// Add Payment - ONLY 1 PER MEMBER PER DAY
exports.addPayment = async (req, res) => {
  try {
    const { memberId, month, date } = req.body;

    if (!memberId || !month || !date) {
      return res.status(400).json({
        message: '❌ Select member, month, and date'
      });
    }

    // Check member exists
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: '❌ Member not found' });
    }

    // ✅ REMOVED: Check if already won - Winners can still pay until cycle ends!
    // This allows all members to pay throughout the entire cycle

    // CHECK: Only 1 payment per member per day
    const { start, end } = getTodayDateRange();
    
    const existingPaymentToday = await Payment.findOne({
      memberId,
      date: {
        $gte: start,
        $lt: end
      }
    });

    if (existingPaymentToday) {
      return res.status(409).json({
        message: `❌ ${member.name} already paid today! Only 1 payment per day allowed.`,
        status: 'DUPLICATE_PAYMENT_TODAY'
      });
    }

    // Create payment
    const amount = 500;

    const payment = new Payment({
      memberId,
      amount,
      month,
      date: new Date(date)
    });

    await payment.save();
    await payment.populate('memberId', 'name phone');

    res.status(201).json({
      message: '✅ Payment added',
      data: payment
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Error adding payment' });
  }
};

// Get All Payments
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('memberId', 'name phone chitRemoved wonInWeek')
      .sort({ date: -1 });

    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching payments' });
  }
};

// Get Single Payment
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('memberId', 'name phone');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching payment' });
  }
};

// Update Payment
exports.updatePayment = async (req, res) => {
  try {
    const { memberId, month, date } = req.body;

    if (!memberId || !month || !date) {
      return res.status(400).json({
        message: '❌ Missing required fields'
      });
    }

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const amount = 500;

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        memberId,
        amount,
        month,
        date: new Date(date)
      },
      { new: true }
    ).populate('memberId', 'name phone');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({
      message: '✅ Payment updated',
      data: payment
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating payment' });
  }
};

// Delete Payment
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ message: '✅ Payment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting payment' });
  }
};

// Get Payment Summary
exports.getPaymentSummary = async (req, res) => {
  try {
    const payments = await Payment.find();
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const count = payments.length;

    res.json({
      totalPayments: total,
      paymentCount: count,
      averagePerPayment: count > 0 ? (total / count).toFixed(2) : 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error calculating summary' });
  }
};

// Get Payments by Member
exports.getPaymentsByMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    const payments = await Payment.find({ memberId })
      .populate('memberId', 'name phone')
      .sort({ date: -1 });

    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching payments' });
  }
};

// Get Payments by Month
exports.getPaymentsByMonth = async (req, res) => {
  try {
    const { month } = req.params;

    const payments = await Payment.find({ month })
      .populate('memberId', 'name phone')
      .sort({ date: -1 });

    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching payments' });
  }
};

// Get TODAY'S payments
exports.getTodayPayments = async (req, res) => {
  try {
    const { start, end } = getTodayDateRange();

    const todayPayments = await Payment.find({
      date: {
        $gte: start,
        $lt: end
      }
    })
      .populate('memberId', 'name phone')
      .sort({ createdAt: -1 });

    res.json({
      date: new Date().toLocaleDateString(),
      count: todayPayments.length,
      total: todayPayments.reduce((sum, p) => sum + p.amount, 0),
      payments: todayPayments
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching today payments' });
  }
};