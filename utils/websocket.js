import { Server } from 'socket.io';
import { logger } from './logger.js';
import config from '../config.js';
import { cache } from './cache.js';
import jwt from 'jsonwebtoken';

class WebSocket {
  constructor(server) {
    // Initialize Socket.IO server
    this.io = new Server(server, {
      cors: {
        origin: config.cors.origins,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // Store connected clients
    this.clients = new Map();

    // Store room participants
    this.rooms = new Map();

    // Initialize event handlers
    this.initializeEventHandlers();
  }

  // Initialize event handlers
  initializeEventHandlers() {
    this.io.on('connection', async socket => {
      try {
        // Authenticate connection
        const user = await this.authenticateConnection(socket);
        if (!user) {
          socket.disconnect();
          return;
        }

        // Store client information
        this.clients.set(socket.id, {
          userId: user.id,
          socket,
          rooms: new Set(),
        });

        // Join user's personal room
        await this.joinRoom(socket, `user:${user.id}`);

        // Handle disconnection
        socket.on('disconnect', () => this.handleDisconnect(socket));

        // Handle room events
        socket.on('join', roomId => this.joinRoom(socket, roomId));
        socket.on('leave', roomId => this.leaveRoom(socket, roomId));

        // Handle chat events
        socket.on('message', data => this.handleMessage(socket, data));
        socket.on('typing', data => this.handleTyping(socket, data));

        // Handle presence events
        socket.on('presence', data => this.handlePresence(socket, data));

        // Log connection
        logger.info('Client connected', {
          socketId: socket.id,
          userId: user.id,
        });
      } catch (error) {
        logger.error('Connection error:', error);
        socket.disconnect();
      }
    });
  }

  // Authenticate connection
  async authenticateConnection(socket) {
    try {
      const { token } = socket.handshake.auth;
      if (!token) {
        throw new Error('Authentication token required');
      }

      const decoded = jwt.verify(token, config.jwt.secret);
      return decoded;
    } catch (error) {
      logger.error('Authentication error:', error);
      return null;
    }
  }

  // Handle disconnection
  async handleDisconnect(socket) {
    try {
      const client = this.clients.get(socket.id);
      if (!client) return;

      // Leave all rooms
      for (const roomId of client.rooms) {
        await this.leaveRoom(socket, roomId);
      }

      // Remove client
      this.clients.delete(socket.id);

      // Log disconnection
      logger.info('Client disconnected', {
        socketId: socket.id,
        userId: client.userId,
      });
    } catch (error) {
      logger.error('Disconnection error:', error);
    }
  }

  // Join room
  async joinRoom(socket, roomId) {
    try {
      const client = this.clients.get(socket.id);
      if (!client) return;

      // Join socket room
      await socket.join(roomId);
      client.rooms.add(roomId);

      // Update room participants
      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, new Set());
      }
      this.rooms.get(roomId).add(client.userId);

      // Notify room
      this.io.to(roomId).emit('userJoined', {
        roomId,
        userId: client.userId,
        timestamp: new Date(),
      });

      // Log room join
      logger.info('Client joined room', {
        socketId: socket.id,
        userId: client.userId,
        roomId,
      });
    } catch (error) {
      logger.error('Join room error:', error);
    }
  }

  // Leave room
  async leaveRoom(socket, roomId) {
    try {
      const client = this.clients.get(socket.id);
      if (!client) return;

      // Leave socket room
      await socket.leave(roomId);
      client.rooms.delete(roomId);

      // Update room participants
      if (this.rooms.has(roomId)) {
        this.rooms.get(roomId).delete(client.userId);
        if (this.rooms.get(roomId).size === 0) {
          this.rooms.delete(roomId);
        }
      }

      // Notify room
      this.io.to(roomId).emit('userLeft', {
        roomId,
        userId: client.userId,
        timestamp: new Date(),
      });

      // Log room leave
      logger.info('Client left room', {
        socketId: socket.id,
        userId: client.userId,
        roomId,
      });
    } catch (error) {
      logger.error('Leave room error:', error);
    }
  }

  // Handle message
  async handleMessage(socket, data) {
    try {
      const client = this.clients.get(socket.id);
      if (!client) return;

      const { roomId, content, type = 'text' } = data;

      // Validate room membership
      if (!client.rooms.has(roomId)) {
        throw new Error('Not a member of this room');
      }

      // Create message object
      const message = {
        id: this.generateMessageId(),
        roomId,
        senderId: client.userId,
        content,
        type,
        timestamp: new Date(),
      };

      // Broadcast to room
      this.io.to(roomId).emit('message', message);

      // Store message in cache
      const cacheKey = `room:${roomId}:messages`;
      await cache.lpush(cacheKey, message);
      await cache.ltrim(cacheKey, 0, 99); // Keep last 100 messages

      // Log message
      logger.info('Message sent', {
        messageId: message.id,
        roomId,
        senderId: client.userId,
      });
    } catch (error) {
      logger.error('Message handling error:', error);
      socket.emit('error', { message: error.message });
    }
  }

  // Handle typing indicator
  async handleTyping(socket, data) {
    try {
      const client = this.clients.get(socket.id);
      if (!client) return;

      const { roomId, isTyping } = data;

      // Validate room membership
      if (!client.rooms.has(roomId)) {
        throw new Error('Not a member of this room');
      }

      // Broadcast to room
      socket.to(roomId).emit('typing', {
        roomId,
        userId: client.userId,
        isTyping,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Typing indicator error:', error);
    }
  }

  // Handle presence
  async handlePresence(socket, data) {
    try {
      const client = this.clients.get(socket.id);
      if (!client) return;

      const { status, lastSeen } = data;

      // Update user presence in cache
      const cacheKey = `user:${client.userId}:presence`;
      await cache.set(
        cacheKey,
        {
          status,
          lastSeen: lastSeen || new Date(),
        },
        300
      ); // 5 minutes expiry

      // Broadcast to user's rooms
      for (const roomId of client.rooms) {
        this.io.to(roomId).emit('presence', {
          userId: client.userId,
          status,
          lastSeen,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      logger.error('Presence update error:', error);
    }
  }

  // Get room participants
  getRoomParticipants(roomId) {
    return Array.from(this.rooms.get(roomId) || []);
  }

  // Get user's rooms
  getUserRooms(userId) {
    const rooms = [];
    for (const [roomId, participants] of this.rooms.entries()) {
      if (participants.has(userId)) {
        rooms.push(roomId);
      }
    }
    return rooms;
  }

  // Generate unique message ID
  generateMessageId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Broadcast to all clients
  broadcast(event, data) {
    this.io.emit(event, data);
  }

  // Broadcast to specific room
  broadcastToRoom(roomId, event, data) {
    this.io.to(roomId).emit(event, data);
  }

  // Broadcast to specific user
  broadcastToUser(userId, event, data) {
    this.io.to(`user:${userId}`).emit(event, data);
  }
}

export const websocket = new WebSocket();
