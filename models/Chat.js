import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    type: {
      type: String,
      enum: ['text', 'image', 'location', 'system'],
      default: 'text',
    },
    metadata: {
      imageUrl: String,
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: [Number],
      },
    },
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const chatSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['session', 'direct'],
      required: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
    },
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['admin', 'member'],
          default: 'member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        leftAt: Date,
        lastRead: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    messages: [messageSchema],
    status: {
      type: String,
      enum: ['active', 'archived', 'deleted'],
      default: 'active',
    },
    settings: {
      notifications: {
        type: Boolean,
        default: true,
      },
      muteUntil: Date,
    },
    metadata: {
      title: String,
      description: String,
      image: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
chatSchema.index({ type: 1 });
chatSchema.index({ session: 1 });
chatSchema.index({ 'participants.user': 1 });
chatSchema.index({ 'messages.sender': 1 });
chatSchema.index({ 'messages.createdAt': -1 });
chatSchema.index({ status: 1 });

// Virtuals
chatSchema.virtual('unreadCount', {
  ref: 'User',
  localField: 'participants.user',
  foreignField: '_id',
  count: true,
});

// Methods
chatSchema.methods.addParticipant = async function (userId, role = 'member') {
  if (this.participants.some(p => p.user.toString() === userId.toString())) {
    throw new Error('User is already a participant');
  }

  this.participants.push({
    user: userId,
    role,
    joinedAt: new Date(),
  });

  return this.save();
};

chatSchema.methods.removeParticipant = async function (userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (!participant) {
    throw new Error('User is not a participant');
  }

  participant.leftAt = new Date();

  return this.save();
};

chatSchema.methods.addMessage = async function (senderId, content, type = 'text', metadata = {}) {
  const message = {
    sender: senderId,
    content,
    type,
    metadata,
    readBy: [
      {
        user: senderId,
        readAt: new Date(),
      },
    ],
  };

  this.messages.push(message);

  // Update lastRead for sender
  const participant = this.participants.find(p => p.user.toString() === senderId.toString());
  if (participant) {
    participant.lastRead = new Date();
  }

  return this.save();
};

chatSchema.methods.markAsRead = async function (userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (!participant) {
    throw new Error('User is not a participant');
  }

  participant.lastRead = new Date();

  // Mark all unread messages as read
  this.messages.forEach(message => {
    if (!message.readBy.some(r => r.user.toString() === userId.toString())) {
      message.readBy.push({
        user: userId,
        readAt: new Date(),
      });
    }
  });

  return this.save();
};

chatSchema.methods.deleteMessage = async function (messageId, userId) {
  const message = this.messages.id(messageId);
  if (!message) {
    throw new Error('Message not found');
  }

  if (message.sender.toString() !== userId.toString()) {
    throw new Error('Not authorized to delete this message');
  }

  message.deleted = true;
  message.deletedAt = new Date();
  message.deletedBy = userId;

  return this.save();
};

// Static methods
chatSchema.statics.findByParticipants = async function (userIds) {
  return this.findOne({
    type: 'direct',
    'participants.user': { $all: userIds },
    'participants.2': { $exists: false },
  });
};

chatSchema.statics.findUserChats = async function (userId) {
  return this.find({
    'participants.user': userId,
    status: 'active',
  })
    .populate('participants.user', 'name avatar')
    .populate('session', 'title type')
    .sort('-updatedAt');
};

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
