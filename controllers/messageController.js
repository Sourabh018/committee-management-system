// ============================================
// controllers/messageController.js
// ============================================

const Message = require('../models/messageModel');

// Get all messages for a member
const getMessages = async (req, res) => {
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
const getUnreadMessages = async (req, res) => {
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
const markAsRead = async (req, res) => {
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
const deleteMessage = async (req, res) => {
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
const getMessageStats = async (req, res) => {
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

// Export all functions
module.exports = {
  getMessages,
  getUnreadMessages,
  markAsRead,
  deleteMessage,
  getMessageStats
};