import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { redis } from '../utils/cache.js';
import { logger } from '../utils/logger.js';

let mongoServer;
let httpServer;
let ioServer;
let ioClient;

// Setup before all tests
beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create HTTP server for WebSocket testing
  httpServer = createServer();
  ioServer = new Server(httpServer);
  await new Promise(resolve => httpServer.listen(resolve));

  // Create WebSocket client
  ioClient = Client(`http://localhost:${httpServer.address().port}`);
  await new Promise(resolve => ioClient.on('connect', resolve));
});

// Cleanup after all tests
afterAll(async () => {
  // Close MongoDB connection
  await mongoose.disconnect();
  await mongoServer.stop();

  // Close WebSocket connections
  ioClient.close();
  await new Promise(resolve => httpServer.close(resolve));

  // Close Redis connection
  await redis.quit();
});

// Reset database before each test
beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
  await redis.flushall();
});

// Global test utilities
global.testUtils = {
  createTestUser: async (userData = {}) => {
    const User = mongoose.model('User');
    return await User.create({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      ...userData,
    });
  },

  createTestSession: async (sessionData = {}) => {
    const Session = mongoose.model('Session');
    return await Session.create({
      title: 'Test Session',
      description: 'Test Description',
      location: {
        type: 'Point',
        coordinates: [0, 0],
      },
      ...sessionData,
    });
  },

  createTestChat: async (chatData = {}) => {
    const Chat = mongoose.model('Chat');
    return await Chat.create({
      participants: [],
      messages: [],
      ...chatData,
    });
  },

  generateAuthToken: user => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  },
};

// Mock external services
jest.mock('../utils/notification.js', () => ({
  sendNotification: jest.fn(),
  sendEmail: jest.fn(),
  sendPush: jest.fn(),
}));

jest.mock('../utils/sms.js', () => ({
  sendSMS: jest.fn(),
  sendVerificationCode: jest.fn(),
}));

// Configure test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.FIREBASE_CONFIG = JSON.stringify({
  apiKey: 'test-key',
  authDomain: 'test.firebaseapp.com',
  projectId: 'test-project',
  storageBucket: 'test.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef',
});
