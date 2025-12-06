// controllers/winnerController.js - RANDOM WINNER + MESSAGES
const Winner = require('../models/winnerModel');
const Member = require('../models/memberModel');
const Message = require('../models/messageModel'); // We'll create this

// Helper function to shuffle array (Fisher-Yates algorithm)
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Helper function to send message to member
const sendMessageToMember = async (memberId, type, details) => {
  try {
    let messageText = '';
    
    if (type === 'WON') {
      messageText = `🎉 Congratulations! You won ₹${details.amount} in Week ${details.week}! Your prize has been added to your account.`;
    } else if (type === 'ANNOUNCEMENT') {
      messageText = `📢 New weekly draw happening today! Make sure your payment (₹500) is up to date. Good luck! 🍀`;
    } else if (type === 'PAYMENT_REMINDER') {
      messageText = `💰 Reminder: Weekly payment of ₹500 is due. Please complete your payment to stay in the draw. 📅`;
    }

    const message = new Message({
      memberId,
      type,
      message: messageText,
      timestamp: new Date(),
      read: false,
    });

    await message.save();
    console.log(`✅ Message sent to member ${memberId}: ${type}`);
    return true;
  } catch (err) {
    console.error('Error sending message:', err.message);
    return false;
  }
};

// Add Winner (manual)
exports.addWinner = async (req, res) => {
  try {
    const { memberId, week, amountWon } = req.body;

    if (!memberId || !week) {
      return res.status(400).json({ message: 'memberId and week are required' });
    }

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const winner = new Winner({
      member: memberId,
      week: week,
      amountWon: amountWon || 25000,
      status: 'SELECTED'
    });

    await winner.save();

    // Update member
    await Member.findByIdAndUpdate(memberId, {
      chitRemoved: true,
      wonInWeek: week,
      wonAmount: amountWon || 25000,
      wonDate: new Date()
    });

    // Send winning message
    await sendMessageToMember(memberId, 'WON', {
      amount: amountWon || 25000,
      week: week
    });

    res.status(201).json({ message: '✅ Winner added successfully', winner });
  } catch (err) {
    res.status(500).json({ message: 'Error adding winner', error: err.message });
  }
};

// Get All Winners
exports.getWinners = async (req, res) => {
  try {
    const winners = await Winner.find().populate('member').sort({ week: -1 });
    res.json(winners);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching winners', error: err.message });
  }
};

// Update Winner
exports.updateWinner = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const winner = await Winner.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('member');

    if (!winner) {
      return res.status(404).json({ message: 'Winner not found' });
    }

    res.json({ message: '✅ Winner updated', winner });
  } catch (err) {
    res.status(500).json({ message: 'Error updating winner', error: err.message });
  }
};

// Delete Winner
exports.deleteWinner = async (req, res) => {
  try {
    const { id } = req.params;

    const winner = await Winner.findById(id);
    if (!winner) {
      return res.status(404).json({ message: 'Winner not found' });
    }

    // Reactivate member
    await Member.findByIdAndUpdate(winner.member, {
      chitRemoved: false,
      wonInWeek: null,
      wonAmount: 0,
      wonDate: null
    });

    await Winner.findByIdAndDelete(id);

    res.json({ message: '✅ Winner deleted and member reactivated' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting winner', error: err.message });
  }
};

// Draw Winners - TRULY RANDOM SELECTION
exports.drawWinners = async (req, res) => {
  try {
    // Get ACTIVE members (with chits still in play)
    const activeMembers = await Member.find({ 
      chitRemoved: false,
      status: 'ACTIVE' 
    });

    if (activeMembers.length < 2) {
      return res.status(400).json({
        message: `Not enough active members to draw winners. Active: ${activeMembers.length}, Required: 2`,
        activeMembers: activeMembers.length,
        totalMembers: await Member.countDocuments()
      });
    }

    // TRULY RANDOM - Fisher-Yates shuffle
    const shuffled = shuffleArray(activeMembers);
    const selectedWinners = shuffled.slice(0, 2);

    // Get current week
    const winnerCount = await Winner.countDocuments();
    const currentWeek = Math.floor(winnerCount / 2) + 1;

    // Calculate pot and prize
    const totalMembers = await Member.countDocuments({ status: 'ACTIVE' });
    const totalPot = totalMembers * 500;
    const prizePerWinner = totalPot / 2;

    // Create winner records and update members
    const winnerData = [];
    for (const member of selectedWinners) {
      const winnerRecord = new Winner({
        member: member._id,
        week: currentWeek,
        amountWon: prizePerWinner,
        status: 'SELECTED'
      });
      await winnerRecord.save();

      // Update member - remove chit
      await Member.findByIdAndUpdate(member._id, {
        chitRemoved: true,
        wonInWeek: currentWeek,
        wonAmount: prizePerWinner,
        wonDate: new Date()
      });

      // Send winning message to winner
      await sendMessageToMember(member._id, 'WON', {
        amount: prizePerWinner,
        week: currentWeek
      });

      winnerData.push({
        _id: member._id,
        name: member.name,
        phone: member.phone,
        amountWon: prizePerWinner
      });
    }

    // Send announcement message to all other active members
    const otherMembers = activeMembers.filter(
      m => !selectedWinners.find(w => w._id.toString() === m._id.toString())
    );
    
    for (const member of otherMembers) {
      await sendMessageToMember(member._id, 'ANNOUNCEMENT', {
        week: currentWeek
      });
    }

    res.json({
      message: '✅ Winners drawn successfully (RANDOM SELECTION)',
      week: currentWeek,
      winners: winnerData,
      totalPot: totalPot,
      prizePerWinner: prizePerWinner,
      remainingMembers: totalMembers - 2,
      totalMembers: totalMembers,
      randomnessInfo: '✓ Used Fisher-Yates shuffle for true randomness'
    });
  } catch (err) {
    res.status(500).json({ message: 'Error drawing winners', error: err.message });
  }
};

// Get Winner History
exports.getWinnerHistory = async (req, res) => {
  try {
    const history = await Winner.find()
      .populate('member', 'name phone')
      .sort({ week: -1, createdAt: -1 });

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching history', error: err.message });
  }
};

// Get Winners by Week
exports.getWinnersByWeek = async (req, res) => {
  try {
    const { id: week } = req.params;

    const winners = await Winner.find({ week: parseInt(week) })
      .populate('member', 'name phone');

    if (winners.length === 0) {
      return res.status(404).json({ message: 'No winners found for this week' });
    }

    res.json(winners);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching winners', error: err.message });
  }
};

// Get Cycle Status
exports.getCycleStatus = async (req, res) => {
  try {
    const totalMembers = await Member.countDocuments({ status: 'ACTIVE' });
    const membersWon = await Member.countDocuments({ 
      chitRemoved: true,
      status: 'ACTIVE' 
    });
    const remainingChits = totalMembers - membersWon;

    const winnersCount = await Winner.countDocuments();
    const currentWeek = winnersCount > 0 ? Math.ceil(winnersCount / 2) : 0;

    const progressPercentage = totalMembers > 0 
      ? ((membersWon / totalMembers) * 100).toFixed(1) 
      : 0;

    res.json({
      totalMembers,
      membersWon,
      remainingChits,
      weeksCompleted: currentWeek,
      progress: `${progressPercentage}%`,
      cycleComplete: remainingChits === 0,
      randomnessInfo: '✓ Winners selected using Fisher-Yates algorithm'
    });
  } catch (err) {
    res.status(500).json({ message: 'Error getting cycle status', error: err.message });
  }
};

// Start New Cycle
exports.startNewCycle = async (req, res) => {
  try {
    const cycleId = req.body.cycleId || 1;

    // Reactivate all members
    const result = await Member.updateMany(
      {},
      {
        chitRemoved: false,
        wonInWeek: null,
        wonAmount: 0,
        wonDate: null,
        cycleId: cycleId
      }
    );

    // Send payment reminder to all members
    const allMembers = await Member.find({ status: 'ACTIVE' });
    for (const member of allMembers) {
      await sendMessageToMember(member._id, 'PAYMENT_REMINDER', {});
    }

    res.json({
      message: '✅ New cycle started! All chits reactivated.',
      membersReset: result.modifiedCount,
      cycleId: cycleId,
      notificationsSent: allMembers.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Error starting new cycle', error: err.message });
  }
};