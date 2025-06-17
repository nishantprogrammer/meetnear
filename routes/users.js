const express = require('express');
const router = express.Router();
const { validate } = require('../middleware/validation');
const { auth } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');
const { User } = require('../models/user');
const { upload } = require('../utils/upload');
const { sendNotification } = require('../utils/notifications');
const { logger } = require('../utils/logger');

// Get user profile
router.get('/profile', auth, rateLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -tokens')
      .populate('interests', 'name');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', auth, rateLimiter, validate('updateProfile'), async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'bio', 'interests', 'preferences', 'location'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    updates.forEach(update => (user[update] = req.body[update]));
    await user.save();

    res.json(user);
  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload profile picture
router.post('/profile/picture', auth, rateLimiter, upload.single('picture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete old picture if exists
    if (user.profilePicture) {
      await deleteFile(user.profilePicture);
    }

    user.profilePicture = req.file.path;
    await user.save();

    res.json({ profilePicture: user.profilePicture });
  } catch (error) {
    logger.error('Error uploading profile picture:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get nearby users
router.get('/nearby', auth, rateLimiter, async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Location required' });
    }

    const nearbyUsers = await User.find({
      _id: { $ne: req.user.id },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(radius),
        },
      },
      isActive: true,
    })
      .select('name profilePicture bio interests location')
      .limit(50);

    res.json(nearbyUsers);
  } catch (error) {
    logger.error('Error fetching nearby users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Block user
router.post('/block/:userId', auth, rateLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const userToBlock = await User.findById(req.params.userId);

    if (!userToBlock) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.blockedUsers.includes(req.params.userId)) {
      return res.status(400).json({ error: 'User already blocked' });
    }

    user.blockedUsers.push(req.params.userId);
    await user.save();

    // Remove from each other's connections
    await User.updateMany(
      { _id: { $in: [req.user.id, req.params.userId] } },
      { $pull: { connections: { $in: [req.user.id, req.params.userId] } } }
    );

    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    logger.error('Error blocking user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Report user
router.post('/report/:userId', auth, rateLimiter, validate('reportUser'), async (req, res) => {
  try {
    const { reason, details } = req.body;
    const user = await User.findById(req.user.id);
    const reportedUser = await User.findById(req.params.userId);

    if (!reportedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const report = {
      reporter: req.user.id,
      reason,
      details,
      timestamp: new Date(),
    };

    reportedUser.reports.push(report);
    await reportedUser.save();

    // Notify admins
    await sendNotification({
      type: 'USER_REPORT',
      title: 'New User Report',
      body: `User ${user.name} reported ${reportedUser.name}`,
      data: { reportId: report._id },
    });

    res.json({ message: 'User reported successfully' });
  } catch (error) {
    logger.error('Error reporting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user connections
router.get('/connections', auth, rateLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      'connections',
      'name profilePicture bio location'
    );

    res.json(user.connections);
  } catch (error) {
    logger.error('Error fetching user connections:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add connection
router.post('/connections/:userId', auth, rateLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const userToConnect = await User.findById(req.params.userId);

    if (!userToConnect) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.connections.includes(req.params.userId)) {
      return res.status(400).json({ error: 'Already connected' });
    }

    user.connections.push(req.params.userId);
    userToConnect.connections.push(req.user.id);

    await Promise.all([user.save(), userToConnect.save()]);

    // Send notification
    await sendNotification({
      userId: req.params.userId,
      type: 'NEW_CONNECTION',
      title: 'New Connection',
      body: `${user.name} connected with you`,
    });

    res.json({ message: 'Connection added successfully' });
  } catch (error) {
    logger.error('Error adding connection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove connection
router.delete('/connections/:userId', auth, rateLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const userToRemove = await User.findById(req.params.userId);

    if (!userToRemove) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.connections = user.connections.filter(id => id.toString() !== req.params.userId);
    userToRemove.connections = userToRemove.connections.filter(id => id.toString() !== req.user.id);

    await Promise.all([user.save(), userToRemove.save()]);

    res.json({ message: 'Connection removed successfully' });
  } catch (error) {
    logger.error('Error removing connection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user preferences
router.get('/preferences', auth, rateLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('preferences');

    res.json(user.preferences);
  } catch (error) {
    logger.error('Error fetching user preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user preferences
router.put('/preferences', auth, rateLimiter, validate('updatePreferences'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.preferences = { ...user.preferences, ...req.body };
    await user.save();

    res.json(user.preferences);
  } catch (error) {
    logger.error('Error updating user preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user activity
router.get('/activity', auth, rateLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('activity')
      .populate('activity.session', 'title description location')
      .populate('activity.user', 'name profilePicture');

    res.json(user.activity);
  } catch (error) {
    logger.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete account
router.delete('/account', auth, rateLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Delete user data
    await Promise.all([
      User.deleteOne({ _id: req.user.id }),
      Session.deleteMany({ participants: req.user.id }),
      Message.deleteMany({ $or: [{ sender: req.user.id }, { receiver: req.user.id }] }),
    ]);

    // Delete profile picture
    if (user.profilePicture) {
      await deleteFile(user.profilePicture);
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    logger.error('Error deleting account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
