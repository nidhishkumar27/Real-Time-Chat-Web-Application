import express from 'express';
import { body, validationResult } from 'express-validator';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// @route   GET /api/messages/:recipientId
// @desc    Get conversation between current user and recipient
// @access  Private
router.get('/:recipientId', authenticate, async (req, res) => {
  try {
    const { recipientId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const before = req.query.before ? new Date(req.query.before) : new Date();
    
    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }
    
    // Get messages where current user is sender or recipient
    const messages = await Message.find({
      $or: [
        { sender: req.userId, recipient: recipientId },
        { sender: recipientId, recipient: req.userId },
      ],
      createdAt: { $lt: before },
    })
      .populate('sender', 'username')
      .populate('recipient', 'username')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    // Mark messages as read
    await Message.updateMany(
      {
        sender: recipientId,
        recipient: req.userId,
        read: false,
      },
      { read: true }
    );
    
    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('[Messages] Get conversation error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;



