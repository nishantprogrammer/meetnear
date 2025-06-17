import nodemailer from 'nodemailer';
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase-admin/messaging';
import { logger } from './logger.js';
import config from '../config.js';
import { cache } from './cache.js';

class Notification {
  constructor() {
    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });

    // Initialize Firebase Admin
    if (config.firebase) {
      this.firebaseApp = initializeApp(config.firebase);
      this.messaging = getMessaging(this.firebaseApp);
    }
  }

  // Send notification through multiple channels
  async send(notification) {
    try {
      const {
        userId,
        type,
        title,
        message,
        data = {},
        channels = ['email', 'push'],
        priority = 'normal',
      } = notification;

      // Get user preferences
      const user = await this.getUserPreferences(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Filter channels based on user preferences
      const enabledChannels = channels.filter(
        channel => user.preferences?.notifications?.[channel] !== false
      );

      // Send through each enabled channel
      const results = await Promise.allSettled(
        enabledChannels.map(channel =>
          this.sendToChannel(channel, {
            userId,
            type,
            title,
            message,
            data,
            priority,
            user,
          })
        )
      );

      // Log results
      results.forEach((result, index) => {
        const channel = enabledChannels[index];
        if (result.status === 'fulfilled') {
          logger.info('Notification sent successfully', {
            channel,
            type,
            userId,
          });
        } else {
          logger.error('Notification failed', {
            channel,
            type,
            userId,
            error: result.reason,
          });
        }
      });

      return {
        success: results.some(r => r.status === 'fulfilled'),
        results: results.map((r, i) => ({
          channel: enabledChannels[i],
          success: r.status === 'fulfilled',
          error: r.status === 'rejected' ? r.reason : null,
        })),
      };
    } catch (error) {
      logger.error('Notification error:', error);
      throw error;
    }
  }

  // Send to specific channel
  async sendToChannel(channel, notification) {
    switch (channel) {
      case 'email':
        return this.sendEmail(notification);
      case 'push':
        return this.sendPush(notification);
      case 'sms':
        return this.sendSMS(notification);
      default:
        throw new Error(`Unsupported channel: ${channel}`);
    }
  }

  // Send email notification
  async sendEmail({ userId, type, title, message, data, user }) {
    try {
      const emailTemplate = await this.getEmailTemplate(type);
      if (!emailTemplate) {
        throw new Error(`Email template not found for type: ${type}`);
      }

      const html = this.renderTemplate(emailTemplate, {
        title,
        message,
        data,
        user: user.name,
      });

      const mailOptions = {
        from: config.email.from,
        to: user.email,
        subject: title,
        html,
      };

      await this.emailTransporter.sendMail(mailOptions);
    } catch (error) {
      logger.error('Email notification error:', error);
      throw error;
    }
  }

  // Send push notification
  async sendPush({ userId, type, title, message, data, priority, user }) {
    try {
      if (!this.messaging) {
        throw new Error('Firebase not configured');
      }

      const message = {
        token: user.fcmToken,
        notification: {
          title,
          body: message,
        },
        data: {
          type,
          ...data,
        },
        android: {
          priority: priority === 'high' ? 'high' : 'normal',
          notification: {
            channelId: type,
            priority: priority === 'high' ? 'max' : 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      await this.messaging.send(message);
    } catch (error) {
      logger.error('Push notification error:', error);
      throw error;
    }
  }

  // Send SMS notification
  async sendSMS({ userId, message, user }) {
    try {
      if (!config.sms) {
        throw new Error('SMS not configured');
      }

      // Implement SMS sending logic here
      // This is a placeholder for SMS integration
      logger.info('SMS notification sent', {
        userId,
        phone: user.phone,
      });
    } catch (error) {
      logger.error('SMS notification error:', error);
      throw error;
    }
  }

  // Get user preferences with caching
  async getUserPreferences(userId) {
    const cacheKey = `user:${userId}:preferences`;

    // Try to get from cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // If not in cache, get from database
    const user = await this.fetchUserFromDatabase(userId);
    if (user) {
      // Cache for 1 hour
      await cache.set(cacheKey, user, 3600);
    }

    return user;
  }

  // Get email template
  async getEmailTemplate(type) {
    const cacheKey = `email:template:${type}`;

    // Try to get from cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // If not in cache, get from database or file system
    const template = await this.fetchEmailTemplate(type);
    if (template) {
      // Cache for 24 hours
      await cache.set(cacheKey, template, 86400);
    }

    return template;
  }

  // Render template with data
  renderTemplate(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  // Fetch user from database (placeholder)
  async fetchUserFromDatabase(userId) {
    // Implement database fetch logic
    return null;
  }

  // Fetch email template (placeholder)
  async fetchEmailTemplate(type) {
    // Implement template fetch logic
    return null;
  }
}

export const notification = new Notification();
