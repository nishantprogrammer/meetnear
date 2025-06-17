import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    type: {
      type: String,
      required: [true, 'Session type is required'],
      enum: ['coffee', 'lunch', 'dinner', 'activity', 'other'],
      default: 'coffee',
    },
    status: {
      type: String,
      enum: ['scheduled', 'active', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (v) {
            return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
          },
          message: 'Invalid coordinates',
        },
      },
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String,
      },
      venue: {
        name: String,
        type: String,
      },
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
      validate: {
        validator: function (v) {
          return v > new Date();
        },
        message: 'Start time must be in the future',
      },
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
      validate: {
        validator: function (v) {
          return v > this.startTime;
        },
        message: 'End time must be after start time',
      },
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        status: {
          type: String,
          enum: ['invited', 'accepted', 'declined', 'attended'],
          default: 'invited',
        },
        joinedAt: Date,
        leftAt: Date,
      },
    ],
    maxParticipants: {
      type: Number,
      min: [2, 'Minimum 2 participants required'],
      max: [50, 'Maximum 50 participants allowed'],
      default: 10,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    visibility: {
      type: String,
      enum: ['public', 'private', 'invite-only'],
      default: 'public',
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
    },
    rating: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    feedback: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    cancellationReason: String,
    cancellationTime: Date,
    cancellationBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
sessionSchema.index({ location: '2dsphere' });
sessionSchema.index({ startTime: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ type: 1 });
sessionSchema.index({ tags: 1 });
sessionSchema.index({ creator: 1 });
sessionSchema.index({ 'participants.user': 1 });

// Virtuals
sessionSchema.virtual('duration').get(function () {
  return this.endTime - this.startTime;
});

sessionSchema.virtual('isActive').get(function () {
  const now = new Date();
  return this.startTime <= now && this.endTime >= now;
});

sessionSchema.virtual('isUpcoming').get(function () {
  return this.startTime > new Date();
});

// Methods
sessionSchema.methods.addParticipant = async function (userId) {
  if (this.participants.length >= this.maxParticipants) {
    throw new Error('Session is full');
  }

  if (this.participants.some(p => p.user.toString() === userId.toString())) {
    throw new Error('User is already a participant');
  }

  this.participants.push({
    user: userId,
    status: 'invited',
    joinedAt: new Date(),
  });

  return this.save();
};

sessionSchema.methods.removeParticipant = async function (userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (!participant) {
    throw new Error('User is not a participant');
  }

  participant.status = 'declined';
  participant.leftAt = new Date();

  return this.save();
};

sessionSchema.methods.cancel = async function (userId, reason) {
  if (this.status === 'cancelled') {
    throw new Error('Session is already cancelled');
  }

  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancellationTime = new Date();
  this.cancellationBy = userId;

  return this.save();
};

// Static methods
sessionSchema.statics.findNearby = async function (coordinates, maxDistance = 10000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates,
        },
        $maxDistance: maxDistance,
      },
    },
    status: 'scheduled',
    startTime: { $gt: new Date() },
  }).populate('creator', 'name avatar');
};

const Session = mongoose.model('Session', sessionSchema);

export default Session;
