// ============================================
// routes/messageRoutes.js
// ============================================
const express = require('express');
const router = express.Router();
const {
  getMessages,
  getUnreadMessages,
  markAsRead,
  deleteMessage,
  getMessageStats
} = require('../controllers/messageController');

// Get all messages for a member
router.get('/member/:memberId', getMessages);

// Get unread messages only
router.get('/member/:memberId/unread', getUnreadMessages);

// Mark message as read
router.put('/:messageId/read', markAsRead);

// Delete message
router.delete('/:messageId', deleteMessage);

// Get message statistics
router.get('/stats/all', getMessageStats);

module.exports = router;

// ============================================
// controllers/messageController.js
// ============================================

const Message = require('../models/messageModel');

// Get all messages for a member
exports.getMessages = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { limit = 50 } = req.query;

    const messages = await Message.find({ memberId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching messages', error: err.message });
  }
};

// Get unread messages only
exports.getUnreadMessages = async (req, res) => {
  try {
    const { memberId } = req.params;

    const unreadMessages = await Message.find({ 
      memberId,
      read: false 
    }).sort({ timestamp: -1 });

    res.json(unreadMessages);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching unread messages', error: err.message });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { read: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: '✅ Message marked as read', data: message });
  } catch (err) {
    res.status(500).json({ message: 'Error updating message', error: err.message });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const result = await Message.findByIdAndDelete(messageId);

    if (!result) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: '✅ Message deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting message', error: err.message });
  }
};

// Get message statistics
exports.getMessageStats = async (req, res) => {
  try {
    const totalMessages = await Message.countDocuments();
    const unreadCount = await Message.countDocuments({ read: false });
    const wonMessages = await Message.countDocuments({ type: 'WON' });
    const announcementMessages = await Message.countDocuments({ type: 'ANNOUNCEMENT' });
    const reminderMessages = await Message.countDocuments({ type: 'PAYMENT_REMINDER' });

    res.json({
      totalMessages,
      unreadCount,
      readCount: totalMessages - unreadCount,
      byType: {
        won: wonMessages,
        announcement: announcementMessages,
        paymentReminder: reminderMessages
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error getting stats', error: err.message });
  }
};