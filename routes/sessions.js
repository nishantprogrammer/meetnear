const express = require('express');
const router = express.Router();
const { validate } = require('../middleware/validation');
const { auth } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');
const { Session } = require('../models/session');
const { User } = require('../models/user');
const { sendNotification } = require('../utils/notifications');
const { logger } = require('../utils/logger');
const { calculateMeetingPoint } = require('../utils/location');

// Create session
router.post('/', auth, rateLimiter, validate('createSession'), async (req, res) => {
  try {
    const { title, description, location, startTime, endTime, maxParticipants } = req.body;

    const session = new Session({
      title,
      description,
      location,
      startTime,
      endTime,
      maxParticipants,
      creator: req.user.id,
      participants: [req.user.id],
      status: 'pending',
    });

    await session.save();

    // Notify nearby users
    const nearbyUsers = await User.find({
      _id: { $ne: req.user.id },
      location: {
        $near: {
          $geometry: location,
          $maxDistance: 5000, // 5km radius
        },
      },
      isActive: true,
    });

    await Promise.all(
      nearbyUsers.map(user =>
        sendNotification({
          userId: user._id,
          type: 'NEW_SESSION',
          title: 'New Session Nearby',
          body: `${req.user.name} created a new session: ${title}`,
          data: { sessionId: session._id },
        })
      )
    );

    res.status(201).json(session);
  } catch (error) {
    logger.error('Error creating session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get session details
router.get('/:id', auth, rateLimiter, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('creator', 'name profilePicture')
      .populate('participants', 'name profilePicture');

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    logger.error('Error fetching session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update session
router.put('/:id', auth, rateLimiter, validate('updateSession'), async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.creator.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = [
      'title',
      'description',
      'location',
      'startTime',
      'endTime',
      'maxParticipants',
      'status',
    ];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }

    updates.forEach(update => (session[update] = req.body[update]));
    await session.save();

    // Notify participants of changes
    await Promise.all(
      session.participants.map(userId =>
        sendNotification({
          userId,
          type: 'SESSION_UPDATED',
          title: 'Session Updated',
          body: `Session "${session.title}" has been updated`,
          data: { sessionId: session._id },
        })
      )
    );

    res.json(session);
  } catch (error) {
    logger.error('Error updating session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join session
router.post('/:id/join', auth, rateLimiter, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.status !== 'pending') {
      return res.status(400).json({ error: 'Session is not accepting participants' });
    }

    if (session.participants.includes(req.user.id)) {
      return res.status(400).json({ error: 'Already joined' });
    }

    if (session.participants.length >= session.maxParticipants) {
      return res.status(400).json({ error: 'Session is full' });
    }

    session.participants.push(req.user.id);
    await session.save();

    // Notify creator
    await sendNotification({
      userId: session.creator,
      type: 'NEW_PARTICIPANT',
      title: 'New Participant',
      body: `${req.user.name} joined your session`,
      data: { sessionId: session._id },
    });

    res.json({ message: 'Joined session successfully' });
  } catch (error) {
    logger.error('Error joining session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leave session
router.post('/:id/leave', auth, rateLimiter, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (!session.participants.includes(req.user.id)) {
      return res.status(400).json({ error: 'Not a participant' });
    }

    session.participants = session.participants.filter(id => id.toString() !== req.user.id);

    // If creator leaves, assign new creator
    if (session.creator.toString() === req.user.id && session.participants.length > 0) {
      session.creator = session.participants[0];
    }

    await session.save();

    // Notify remaining participants
    await Promise.all(
      session.participants.map(userId =>
        sendNotification({
          userId,
          type: 'PARTICIPANT_LEFT',
          title: 'Participant Left',
          body: `${req.user.name} left the session`,
          data: { sessionId: session._id },
        })
      )
    );

    res.json({ message: 'Left session successfully' });
  } catch (error) {
    logger.error('Error leaving session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Calculate meeting point
router.post('/:id/meeting-point', auth, rateLimiter, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('participants', 'location');

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (!session.participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not a participant' });
    }

    const locations = session.participants.filter(p => p.location).map(p => p.location);

    if (locations.length < 2) {
      return res.status(400).json({ error: 'Need at least 2 participants with locations' });
    }

    const meetingPoint = await calculateMeetingPoint(locations);
    session.meetingPoint = meetingPoint;
    await session.save();

    // Notify participants
    await Promise.all(
      session.participants.map(userId =>
        sendNotification({
          userId,
          type: 'MEETING_POINT_UPDATED',
          title: 'Meeting Point Updated',
          body: 'The meeting point has been calculated',
          data: { sessionId: session._id },
        })
      )
    );

    res.json({ meetingPoint });
  } catch (error) {
    logger.error('Error calculating meeting point:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get nearby sessions
router.get('/nearby', auth, rateLimiter, async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Location required' });
    }

    const nearbySessions = await Session.find({
      status: 'pending',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(radius),
        },
      },
    })
      .populate('creator', 'name profilePicture')
      .populate('participants', 'name profilePicture')
      .limit(50);

    res.json(nearbySessions);
  } catch (error) {
    logger.error('Error fetching nearby sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's sessions
router.get('/user/sessions', auth, rateLimiter, async (req, res) => {
  try {
    const sessions = await Session.find({
      participants: req.user.id,
    })
      .populate('creator', 'name profilePicture')
      .populate('participants', 'name profilePicture')
      .sort({ startTime: -1 });

    res.json(sessions);
  } catch (error) {
    logger.error('Error fetching user sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel session
router.post('/:id/cancel', auth, rateLimiter, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.creator.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    session.status = 'cancelled';
    await session.save();

    // Notify participants
    await Promise.all(
      session.participants.map(userId =>
        sendNotification({
          userId,
          type: 'SESSION_CANCELLED',
          title: 'Session Cancelled',
          body: `Session "${session.title}" has been cancelled`,
          data: { sessionId: session._id },
        })
      )
    );

    res.json({ message: 'Session cancelled successfully' });
  } catch (error) {
    logger.error('Error cancelling session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Complete session
router.post('/:id/complete', auth, rateLimiter, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.creator.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    session.status = 'completed';
    await session.save();

    // Notify participants
    await Promise.all(
      session.participants.map(userId =>
        sendNotification({
          userId,
          type: 'SESSION_COMPLETED',
          title: 'Session Completed',
          body: `Session "${session.title}" has been completed`,
          data: { sessionId: session._id },
        })
      )
    );

    res.json({ message: 'Session completed successfully' });
  } catch (error) {
    logger.error('Error completing session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
