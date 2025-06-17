import { io as Client } from 'socket.io-client';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { websocket } from '../utils/websocket.js';
import { testUtils } from './setup.js';

describe('WebSocket', () => {
  let httpServer;
  let ioServer;
  let clientSocket;
  let user;

  beforeAll(async () => {
    // Create test user
    user = await testUtils.createTestUser();
    const token = testUtils.generateAuthToken(user);

    // Create HTTP server
    httpServer = createServer();
    ioServer = new Server(httpServer);
    await new Promise(resolve => httpServer.listen(resolve));

    // Create client socket
    clientSocket = Client(`http://localhost:${httpServer.address().port}`, {
      auth: { token },
    });

    // Initialize WebSocket server
    websocket.initialize(ioServer);
  });

  afterAll(() => {
    clientSocket.close();
    httpServer.close();
  });

  describe('Connection', () => {
    it('should connect with valid token', done => {
      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        done();
      });
    });

    it('should disconnect with invalid token', done => {
      const invalidClient = Client(`http://localhost:${httpServer.address().port}`, {
        auth: { token: 'invalid-token' },
      });

      invalidClient.on('connect_error', error => {
        expect(error.message).toBe('Authentication failed');
        invalidClient.close();
        done();
      });
    });
  });

  describe('Room Management', () => {
    it('should join room', done => {
      const roomId = 'test-room';

      clientSocket.emit('join', roomId);

      clientSocket.on('userJoined', data => {
        expect(data.roomId).toBe(roomId);
        expect(data.userId).toBe(user.id);
        done();
      });
    });

    it('should leave room', done => {
      const roomId = 'test-room';

      clientSocket.emit('leave', roomId);

      clientSocket.on('userLeft', data => {
        expect(data.roomId).toBe(roomId);
        expect(data.userId).toBe(user.id);
        done();
      });
    });
  });

  describe('Messaging', () => {
    it('should send and receive message', done => {
      const roomId = 'test-room';
      const message = {
        content: 'Hello, World!',
        type: 'text',
      };

      clientSocket.emit('join', roomId);
      clientSocket.emit('message', { roomId, ...message });

      clientSocket.on('message', data => {
        expect(data.content).toBe(message.content);
        expect(data.type).toBe(message.type);
        expect(data.senderId).toBe(user.id);
        done();
      });
    });

    it('should handle typing indicator', done => {
      const roomId = 'test-room';

      clientSocket.emit('typing', { roomId, isTyping: true });

      clientSocket.on('typing', data => {
        expect(data.roomId).toBe(roomId);
        expect(data.userId).toBe(user.id);
        expect(data.isTyping).toBe(true);
        done();
      });
    });
  });

  describe('Presence', () => {
    it('should update presence status', done => {
      const status = 'online';

      clientSocket.emit('presence', { status });

      clientSocket.on('presence', data => {
        expect(data.userId).toBe(user.id);
        expect(data.status).toBe(status);
        done();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid room join', done => {
      const invalidRoomId = null;

      clientSocket.emit('join', invalidRoomId);

      clientSocket.on('error', error => {
        expect(error.message).toBe('Invalid room ID');
        done();
      });
    });

    it('should handle invalid message format', done => {
      const invalidMessage = {
        content: null,
        type: 'invalid',
      };

      clientSocket.emit('message', invalidMessage);

      clientSocket.on('error', error => {
        expect(error.message).toBe('Invalid message format');
        done();
      });
    });
  });

  describe('Performance', () => {
    it('should handle multiple concurrent connections', async () => {
      const connections = 100;
      const clients = [];

      for (let i = 0; i < connections; i++) {
        const client = Client(`http://localhost:${httpServer.address().port}`, {
          auth: { token: testUtils.generateAuthToken(user) },
        });
        clients.push(client);
      }

      await Promise.all(
        clients.map(client => new Promise(resolve => client.on('connect', resolve)))
      );

      expect(clients.every(client => client.connected)).toBe(true);

      // Cleanup
      clients.forEach(client => client.close());
    });
  });
});
