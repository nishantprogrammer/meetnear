import mongoose from 'mongoose';
import { User } from '../../models/User.js';
import { testUtils } from '../setup.js';

describe('User Model', () => {
  describe('Schema Validation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        phone: '+1234567890',
      };

      const user = await User.create(userData);
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.phone).toBe(userData.phone);
      expect(user.password).not.toBe(userData.password); // Password should be hashed
    });

    it('should fail to create user with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail to create user with short password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        name: 'Test User',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe('Methods', () => {
    it('should correctly compare passwords', async () => {
      const user = await testUtils.createTestUser();
      expect(await user.comparePassword('password123')).toBe(true);
      expect(await user.comparePassword('wrongpassword')).toBe(false);
    });

    it('should generate valid JWT token', async () => {
      const user = await testUtils.createTestUser();
      const token = user.generateAuthToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should update user profile', async () => {
      const user = await testUtils.createTestUser();
      const updates = {
        name: 'Updated Name',
        bio: 'New bio',
        location: {
          type: 'Point',
          coordinates: [0, 0],
        },
      };

      await user.updateProfile(updates);
      expect(user.name).toBe(updates.name);
      expect(user.bio).toBe(updates.bio);
      expect(user.location).toEqual(updates.location);
    });
  });

  describe('Indexes', () => {
    it('should have unique email index', async () => {
      const user1 = await testUtils.createTestUser();
      const user2 = await testUtils.createTestUser();
      await expect(user2.save()).rejects.toThrow();
    });

    it('should have geospatial index on location', async () => {
      const indexes = await User.collection.indexes();
      const locationIndex = indexes.find(index => index.key.location === '2dsphere');
      expect(locationIndex).toBeDefined();
    });
  });

  describe('Hooks', () => {
    it('should hash password before saving', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const user = await User.create(userData);
      expect(user.password).not.toBe(userData.password);
    });

    it('should update timestamps', async () => {
      const user = await testUtils.createTestUser();
      const { createdAt } = user;
      const { updatedAt } = user;

      await new Promise(resolve => setTimeout(resolve, 1000));
      user.name = 'Updated Name';
      await user.save();

      expect(user.createdAt).toEqual(createdAt);
      expect(user.updatedAt).not.toEqual(updatedAt);
    });
  });

  describe('Virtuals', () => {
    it('should return public profile', async () => {
      const user = await testUtils.createTestUser();
      const { publicProfile } = user;

      expect(publicProfile).not.toHaveProperty('password');
      expect(publicProfile).not.toHaveProperty('resetPasswordToken');
      expect(publicProfile).not.toHaveProperty('resetPasswordExpires');
    });
  });
});
