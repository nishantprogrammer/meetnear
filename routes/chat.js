const express = require('express');
const router = express.Router();
const { validate } = require('../middleware/validation');
const { auth } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');
const { Message } = require('../models/message');
const { Conversation } = require('../models/conversation');
const { User } = require('../models/user');
const { sendNotification } = require('../utils/notifications');
const { logger } = require('../utils/logger');
const { upload } = require('../utils/upload');

// Get conversations
router.get('/conversations', auth, rateLimiter, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .populate('participants', 'name profilePicture')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'name profilePicture',
        },
      })
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    logger.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get conversation messages
router.get('/conversations/:id/messages', auth, rateLimiter, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const messages = await Message.find({
      conversation: req.params.id,
    })
      .populate('sender', 'name profilePicture')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: req.params.id,
        sender: { $ne: req.user.id },
        read: false,
      },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    logger.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create conversation
router.post(
  '/conversations',
  auth,
  rateLimiter,
  validate('createConversation'),
  async (req, res) => {
    try {
      const { participants, type = 'direct' } = req.body;

      // Check if conversation already exists
      const existingConversation = await Conversation.findOne({
        type: 'direct',
        participants: { $all: [req.user.id, ...participants] },
      });

      if (existingConversation) {
        return res.json(existingConversation);
      }

      const conversation = new Conversation({
        type,
        participants: [req.user.id, ...participants],
        createdBy: req.user.id,
      });

      await conversation.save();

      // Notify participants
      await Promise.all(
        participants.map(userId =>
          sendNotification({
            userId,
            type: 'NEW_CONVERSATION',
            title: 'New Conversation',
            body: 'You have a new conversation',
            data: { conversationId: conversation._id },
          })
        )
      );

      res.status(201).json(conversation);
    } catch (error) {
      logger.error('Error creating conversation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Send message
router.post(
  '/conversations/:id/messages',
  auth,
  rateLimiter,
  upload.single('attachment'),
  async (req, res) => {
    try {
      const conversation = await Conversation.findById(req.params.id);

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      if (!conversation.participants.includes(req.user.id)) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const message = new Message({
        conversation: req.params.id,
        sender: req.user.id,
        content: req.body.content,
        type: req.body.type || 'text',
        attachment: req.file ? req.file.path : undefined,
      });

      await message.save();

      // Update conversation last message
      conversation.lastMessage = message._id;
      await conversation.save();

      // Notify other participants
      const otherParticipants = conversation.participants.filter(
        id => id.toString() !== req.user.id
      );

      await Promise.all(
        otherParticipants.map(userId =>
          sendNotification({
            userId,
            type: 'NEW_MESSAGE',
            title: 'New Message',
            body: req.body.content || 'New attachment',
            data: {
              conversationId: conversation._id,
              messageId: message._id,
            },
          })
        )
      );

      res.status(201).json(message);
    } catch (error) {
      logger.error('Error sending message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete message
router.delete('/messages/:id', auth, rateLimiter, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete attachment if exists
    if (message.attachment) {
      await deleteFile(message.attachment);
    }

    await message.remove();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    logger.error('Error deleting message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark conversation as read
router.post('/conversations/:id/read', auth, rateLimiter, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Message.updateMany(
      {
        conversation: req.params.id,
        sender: { $ne: req.user.id },
        read: false,
      },
      { read: true }
    );

    res.json({ message: 'Conversation marked as read' });
  } catch (error) {
    logger.error('Error marking conversation as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unread count
router.get('/unread', auth, rateLimiter, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    });

    const unreadCounts = await Promise.all(
      conversations.map(async conversation => {
        const count = await Message.countDocuments({
          conversation: conversation._id,
          sender: { $ne: req.user.id },
          read: false,
        });

        return {
          conversationId: conversation._id,
          unreadCount: count,
        };
      })
    );

    res.json(unreadCounts);
  } catch (error) {
    logger.error('Error fetching unread counts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leave conversation
router.post('/conversations/:id/leave', auth, rateLimiter, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not a participant' });
    }

    conversation.participants = conversation.participants.filter(
      id => id.toString() !== req.user.id
    );

    if (conversation.participants.length === 0) {
      await conversation.remove();
    } else {
      await conversation.save();
    }

    res.json({ message: 'Left conversation successfully' });
  } catch (error) {
    logger.error('Error leaving conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add participants to conversation
router.post(
  '/conversations/:id/participants',
  auth,
  rateLimiter,
  validate('addParticipants'),
  async (req, res) => {
    try {
      const { participants } = req.body;
      const conversation = await Conversation.findById(req.params.id);

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      if (conversation.type === 'direct') {
        return res.status(400).json({ error: 'Cannot add participants to direct conversation' });
      }

      if (!conversation.participants.includes(req.user.id)) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const newParticipants = participants.filter(id => !conversation.participants.includes(id));

      conversation.participants.push(...newParticipants);
      await conversation.save();

      // Notify new participants
      await Promise.all(
        newParticipants.map(userId =>
          sendNotification({
            userId,
            type: 'ADDED_TO_CONVERSATION',
            title: 'Added to Conversation',
            body: 'You have been added to a conversation',
            data: { conversationId: conversation._id },
          })
        )
      );

      res.json(conversation);
    } catch (error) {
      logger.error('Error adding participants:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Remove participant from conversation
router.delete('/conversations/:id/participants/:userId', auth, rateLimiter, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.type === 'direct') {
      return res.status(400).json({ error: 'Cannot remove participants from direct conversation' });
    }

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    conversation.participants = conversation.participants.filter(
      id => id.toString() !== req.params.userId
    );

    if (conversation.participants.length === 0) {
      await conversation.remove();
    } else {
      await conversation.save();
    }

    // Notify removed participant
    await sendNotification({
      userId: req.params.userId,
      type: 'REMOVED_FROM_CONVERSATION',
      title: 'Removed from Conversation',
      body: 'You have been removed from a conversation',
      data: { conversationId: conversation._id },
    });

    res.json({ message: 'Participant removed successfully' });
  } catch (error) {
    logger.error('Error removing participant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
