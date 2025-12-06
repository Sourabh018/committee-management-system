// controllers/memberController.js
const Member = require('../models/memberModel');

// Create Member - WITH UNIQUE PHONE CHECK
exports.createMember = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        message: '❌ Enter name and phone'
      });
    }

    // Check if phone already exists
    const existingMember = await Member.findOne({ phone: phone.trim() });
    if (existingMember) {
      return res.status(409).json({
        message: `❌ This phone number already exists! Member: ${existingMember.name}`,
        status: 'DUPLICATE_PHONE'
      });
    }

    const member = new Member({
      name: name.trim(),
      phone: phone.trim(),
      status: 'ACTIVE'
    });

    await member.save();

    res.status(201).json({
      message: '✅ Member added',
      data: member
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: '❌ This phone number already exists!',
        status: 'DUPLICATE_PHONE'
      });
    }
    console.error(err);
    res.status(500).json({ message: '❌ Error adding member' });
  }
};

// Get All Members
exports.getMembers = async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching members' });
  }
};

// Get Active Members (with chits)
exports.getActiveMembers = async (req, res) => {
  try {
    const activeMembers = await Member.find({ 
      chitRemoved: false,
      status: 'ACTIVE'
    }).sort({ createdAt: -1 });

    res.json(activeMembers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching active members' });
  }
};

// Get Won Members
exports.getWonMembers = async (req, res) => {
  try {
    const wonMembers = await Member.find({ 
      chitRemoved: true
    }).sort({ wonInWeek: 1 });

    res.json(wonMembers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching won members' });
  }
};

// Get Single Member
exports.getMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching member' });
  }
};

// Update Member
exports.updateMember = async (req, res) => {
  try {
    const { name, phone, status } = req.body;

    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { name: name?.trim(), phone: phone?.trim(), status },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({
      message: '✅ Member updated',
      data: member
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating member' });
  }
};

// Delete Member
exports.deleteMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json({ message: '✅ Member deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting member' });
  }
};

// Get Cycle Stats
exports.getCycleStats = async (req, res) => {
  try {
    const total = await Member.countDocuments();
    const wonMembers = await Member.countDocuments({ chitRemoved: true });
    const activeMembers = total - wonMembers;

    res.json({
      totalMembers: total,
      activeChits: activeMembers,
      wonMembers: wonMembers,
      progress: total > 0 ? ((wonMembers / total) * 100).toFixed(2) + '%' : '0%'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

// Get Remaining Members (Active - Not Won)
exports.getRemainingMembers = async (req, res) => {
  try {
    const totalMembers = await Member.countDocuments();
    const wonMembers = await Member.countDocuments({ chitRemoved: true });
    const remainingMembers = totalMembers - wonMembers;
    const remainingPercentage = totalMembers > 0 
      ? ((remainingMembers / totalMembers) * 100).toFixed(1) 
      : 0;

    res.json({
      success: true,
      totalMembers,
      wonMembers,
      remainingMembers,
      remainingPercentage,
      progress: {
        remaining: remainingPercentage,
        completed: totalMembers > 0 
          ? ((wonMembers / totalMembers) * 100).toFixed(1) 
          : 0
      }
    });
  } catch (err) {
    console.error('Error fetching remaining members:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching remaining members',
      error: err.message
    });
  }
};