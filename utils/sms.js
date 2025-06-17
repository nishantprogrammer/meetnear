import twilio from 'twilio';
import { Vonage } from '@vonage/server-sdk';
import { logger } from './logger.js';
import config from '../config.js';
import { cache } from './cache.js';

class SMS {
  constructor() {
    // Initialize Twilio client
    if (config.sms.twilio) {
      this.twilio = twilio(config.sms.twilio.accountSid, config.sms.twilio.authToken);
    }

    // Initialize Vonage client
    if (config.sms.vonage) {
      this.vonage = new Vonage({
        apiKey: config.sms.vonage.apiKey,
        apiSecret: config.sms.vonage.apiSecret,
      });
    }

    // Set default provider
    this.defaultProvider = config.sms.defaultProvider || 'twilio';
  }

  // Send SMS message
  async send(options) {
    try {
      const {
        to,
        message,
        provider = this.defaultProvider,
        from = config.sms.defaultFrom,
        priority = 'normal',
        retryCount = 3,
      } = options;

      // Validate phone number
      if (!this.validatePhoneNumber(to)) {
        throw new Error('Invalid phone number');
      }

      // Rate limiting check
      const canSend = await this.checkRateLimit(to);
      if (!canSend) {
        throw new Error('Rate limit exceeded');
      }

      // Send based on provider
      let result;
      if (provider === 'twilio' && this.twilio) {
        result = await this.sendViaTwilio(to, message, from);
      } else if (provider === 'vonage' && this.vonage) {
        result = await this.sendViaVonage(to, message, from);
      } else {
        throw new Error('SMS provider not configured');
      }

      // Log success
      logger.info('SMS sent successfully', {
        to,
        provider,
        messageId: result.messageId,
      });

      return result;
    } catch (error) {
      logger.error('SMS send error:', error);
      throw error;
    }
  }

  // Send via Twilio
  async sendViaTwilio(to, message, from) {
    try {
      const result = await this.twilio.messages.create({
        body: message,
        to,
        from,
      });

      return {
        provider: 'twilio',
        messageId: result.sid,
        status: result.status,
      };
    } catch (error) {
      logger.error('Twilio SMS error:', error);
      throw error;
    }
  }

  // Send via Vonage
  async sendViaVonage(to, message, from) {
    try {
      const result = await this.vonage.sms.send({
        to,
        from,
        text: message,
      });

      return {
        provider: 'vonage',
        messageId: result.messageId,
        status: result.status,
      };
    } catch (error) {
      logger.error('Vonage SMS error:', error);
      throw error;
    }
  }

  // Send verification code
  async sendVerificationCode(phone) {
    try {
      // Generate verification code
      const code = this.generateVerificationCode();

      // Store code in cache with 10-minute expiry
      const cacheKey = `sms:verification:${phone}`;
      await cache.set(cacheKey, code, 600);

      // Send SMS
      await this.send({
        to: phone,
        message: `Your verification code is: ${code}. Valid for 10 minutes.`,
        priority: 'high',
      });

      return true;
    } catch (error) {
      logger.error('Verification code send error:', error);
      throw error;
    }
  }

  // Verify code
  async verifyCode(phone, code) {
    try {
      const cacheKey = `sms:verification:${phone}`;
      const storedCode = await cache.get(cacheKey);

      if (!storedCode || storedCode !== code) {
        return false;
      }

      // Delete code after successful verification
      await cache.del(cacheKey);
      return true;
    } catch (error) {
      logger.error('Code verification error:', error);
      throw error;
    }
  }

  // Check rate limit
  async checkRateLimit(phone) {
    try {
      const cacheKey = `sms:ratelimit:${phone}`;
      const count = (await cache.get(cacheKey)) || 0;

      if (count >= config.sms.rateLimit.maxPerHour) {
        return false;
      }

      // Increment counter
      await cache.increment(cacheKey);

      // Set expiry if first message
      if (count === 0) {
        await cache.expire(cacheKey, 3600); // 1 hour
      }

      return true;
    } catch (error) {
      logger.error('Rate limit check error:', error);
      return false;
    }
  }

  // Generate verification code
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Validate phone number
  validatePhoneNumber(phone) {
    // Basic phone number validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
  }

  // Get message status
  async getStatus(messageId, provider = this.defaultProvider) {
    try {
      let status;
      if (provider === 'twilio' && this.twilio) {
        const message = await this.twilio.messages(messageId).fetch();
        status = message.status;
      } else if (provider === 'vonage' && this.vonage) {
        const result = await this.vonage.sms.get(messageId);
        status = result.status;
      } else {
        throw new Error('SMS provider not configured');
      }

      return {
        provider,
        messageId,
        status,
      };
    } catch (error) {
      logger.error('Get message status error:', error);
      throw error;
    }
  }

  // Get account balance
  async getBalance(provider = this.defaultProvider) {
    try {
      let balance;
      if (provider === 'twilio' && this.twilio) {
        const account = await this.twilio.api.accounts(config.sms.twilio.accountSid).fetch();
        balance = account.balance;
      } else if (provider === 'vonage' && this.vonage) {
        const result = await this.vonage.account.getBalance();
        balance = result.value;
      } else {
        throw new Error('SMS provider not configured');
      }

      return {
        provider,
        balance,
      };
    } catch (error) {
      logger.error('Get balance error:', error);
      throw error;
    }
  }
}

export const sms = new SMS();
