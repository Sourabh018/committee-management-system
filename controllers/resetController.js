// controllers/resetController.js
const Member = require('../models/memberModel');
const Winner = require('../models/winnerModel');
const Payment = require('../models/paymentModel');

// Admin password from .env (MUST be set in production!)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Validate that password is set
if (!ADMIN_PASSWORD) {
  console.error('❌ CRITICAL: ADMIN_PASSWORD not set in .env file!');
  console.error('⚠️  Please set ADMIN_PASSWORD in your .env file before using reset functionality');
}

// Reset all data
exports.resetAllData = async (req, res) => {
  try {
    const { password } = req.body;

    // Verify admin password
    if (!password || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        message: '❌ Incorrect admin password!',
        success: false
      });
    }

    // Get counts BEFORE deletion
    const memberCount = await Member.countDocuments();
    const winnerCount = await Winner.countDocuments();
    const paymentCount = await Payment.countDocuments();

    // Delete all data
    await Member.deleteMany({});
    await Winner.deleteMany({});
    await Payment.deleteMany({});

    console.log(`✅ Reset data: ${memberCount} members, ${winnerCount} winners, ${paymentCount} payments deleted`);

    res.json({
      message: '✅ All data has been reset successfully!',
      success: true,
      membersDeleted: memberCount,
      winnersDeleted: winnerCount,
      paymentsDeleted: paymentCount,
    });

  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({
      message: 'Error resetting data',
      error: err.message,
      success: false
    });
  }
};

// Reset only members (keep winners & payments history)
exports.resetMembers = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        message: '❌ Incorrect admin password!',
        success: false
      });
    }

    const deletedMembers = await Member.deleteMany({});

    res.json({
      message: '✅ All members have been reset!',
      success: true,
      membersDeleted: deletedMembers.deletedCount,
    });

  } catch (err) {
    console.error('Reset members error:', err);
    res.status(500).json({
      message: 'Error resetting members',
      error: err.message,
      success: false
    });
  }
};

// Reset only winners (start new cycle)
exports.resetWinners = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        message: '❌ Incorrect admin password!',
        success: false
      });
    }

    // Get count BEFORE deletion
    const winnerCount = await Winner.countDocuments();

    // Delete all winners
    await Winner.deleteMany({});

    // Reactivate all members
    await Member.updateMany(
      {},
      {
        chitRemoved: false,
        wonInWeek: null,
        wonAmount: 0,
        wonDate: null,
      }
    );

    res.json({
      message: '✅ Winners have been reset! New cycle started.',
      success: true,
      winnersDeleted: winnerCount,
      membersReactivated: await Member.countDocuments(),
    });

  } catch (err) {
    console.error('Reset winners error:', err);
    res.status(500).json({
      message: 'Error resetting winners',
      error: err.message,
      success: false
    });
  }
};

// Reset only payments
exports.resetPayments = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        message: '❌ Incorrect admin password!',
        success: false
      });
    }

    const deletedPayments = await Payment.deleteMany({});

    res.json({
      message: '✅ All payments have been reset!',
      success: true,
      paymentsDeleted: deletedPayments.deletedCount,
    });

  } catch (err) {
    console.error('Reset payments error:', err);
    res.status(500).json({
      message: 'Error resetting payments',
      error: err.message,
      success: false
    });
  }
};