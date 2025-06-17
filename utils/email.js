const nodemailer = require('nodemailer');
const { logger } = require('./logger');
const { ExternalServiceError } = require('./errors');

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP connection
const verifySMTPConnection = async () => {
  try {
    await transporter.verify();
    logger.info('SMTP connection verified successfully');
    return true;
  } catch (error) {
    logger.error('SMTP connection verification failed:', error);
    throw new ExternalServiceError('Email service unavailable');
  }
};

// Send email
const sendEmail = async options => {
  try {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw new ExternalServiceError('Failed to send email');
  }
};

// Send welcome email
const sendWelcomeEmail = async user => {
  const options = {
    to: user.email,
    subject: 'Welcome to MeetNear!',
    html: `
      <h1>Welcome to MeetNear, ${user.name}!</h1>
      <p>We're excited to have you join our community.</p>
      <p>Here are some things you can do to get started:</p>
      <ul>
        <li>Complete your profile</li>
        <li>Add your interests</li>
        <li>Start exploring nearby sessions</li>
        <li>Connect with other users</li>
      </ul>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Best regards,<br>The MeetNear Team</p>
    `,
  };

  return sendEmail(options);
};

// Send verification email
const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const options = {
    to: user.email,
    subject: 'Verify Your Email Address',
    html: `
      <h1>Email Verification</h1>
      <p>Hi ${user.name},</p>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationUrl}">Verify Email</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
      <p>Best regards,<br>The MeetNear Team</p>
    `,
  };

  return sendEmail(options);
};

// Send password reset email
const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const options = {
    to: user.email,
    subject: 'Reset Your Password',
    html: `
      <h1>Password Reset</h1>
      <p>Hi ${user.name},</p>
      <p>You requested to reset your password. Click the link below to set a new password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
      <p>Best regards,<br>The MeetNear Team</p>
    `,
  };

  return sendEmail(options);
};

// Send session invitation email
const sendSessionInvitationEmail = async (user, session, inviter) => {
  const sessionUrl = `${process.env.FRONTEND_URL}/sessions/${session._id}`;

  const options = {
    to: user.email,
    subject: `You're Invited to ${session.title}`,
    html: `
      <h1>Session Invitation</h1>
      <p>Hi ${user.name},</p>
      <p>${inviter.name} has invited you to join their session:</p>
      <h2>${session.title}</h2>
      <p>${session.description}</p>
      <p><strong>When:</strong> ${new Date(session.startTime).toLocaleString()}</p>
      <p><strong>Where:</strong> ${session.location.address}</p>
      <p>Click the link below to view the session details:</p>
      <p><a href="${sessionUrl}">View Session</a></p>
      <p>Best regards,<br>The MeetNear Team</p>
    `,
  };

  return sendEmail(options);
};

// Send session reminder email
const sendSessionReminderEmail = async (user, session) => {
  const sessionUrl = `${process.env.FRONTEND_URL}/sessions/${session._id}`;

  const options = {
    to: user.email,
    subject: `Reminder: ${session.title} is starting soon`,
    html: `
      <h1>Session Reminder</h1>
      <p>Hi ${user.name},</p>
      <p>This is a reminder that your session is starting soon:</p>
      <h2>${session.title}</h2>
      <p>${session.description}</p>
      <p><strong>When:</strong> ${new Date(session.startTime).toLocaleString()}</p>
      <p><strong>Where:</strong> ${session.location.address}</p>
      <p>Click the link below to view the session details:</p>
      <p><a href="${sessionUrl}">View Session</a></p>
      <p>Best regards,<br>The MeetNear Team</p>
    `,
  };

  return sendEmail(options);
};

// Send payment confirmation email
const sendPaymentConfirmationEmail = async (user, payment) => {
  const options = {
    to: user.email,
    subject: 'Payment Confirmation',
    html: `
      <h1>Payment Confirmation</h1>
      <p>Hi ${user.name},</p>
      <p>Your payment has been processed successfully:</p>
      <p><strong>Amount:</strong> ${payment.amount} ${payment.currency}</p>
      <p><strong>Date:</strong> ${new Date(payment.createdAt).toLocaleString()}</p>
      <p><strong>Transaction ID:</strong> ${payment.transactionId}</p>
      <p>Thank you for your payment!</p>
      <p>Best regards,<br>The MeetNear Team</p>
    `,
  };

  return sendEmail(options);
};

// Send subscription confirmation email
const sendSubscriptionConfirmationEmail = async (user, subscription) => {
  const options = {
    to: user.email,
    subject: 'Subscription Confirmation',
    html: `
      <h1>Subscription Confirmation</h1>
      <p>Hi ${user.name},</p>
      <p>Your subscription has been activated successfully:</p>
      <p><strong>Plan:</strong> ${subscription.plan.name}</p>
      <p><strong>Amount:</strong> ${subscription.amount} ${subscription.currency}</p>
      <p><strong>Billing Cycle:</strong> ${subscription.billingCycle}</p>
      <p><strong>Next Billing Date:</strong> ${new Date(subscription.nextBillingDate).toLocaleString()}</p>
      <p>Thank you for subscribing to MeetNear Premium!</p>
      <p>Best regards,<br>The MeetNear Team</p>
    `,
  };

  return sendEmail(options);
};

module.exports = {
  verifySMTPConnection,
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendSessionInvitationEmail,
  sendSessionReminderEmail,
  sendPaymentConfirmationEmail,
  sendSubscriptionConfirmationEmail,
};
