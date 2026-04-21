const express = require('express');
const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');
const emailService = require('../services/emailService');

const router = express.Router();
const prisma = new PrismaClient();

// Email configuration (using environment variables)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  }
});

// Email templates
const emailTemplates = {
  meetingInvitation: (meeting, participant) => ({
    subject: `Meeting Invitation: ${meeting.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">📅 Meeting Invitation</h2>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
              <h3 style="color: #1e40af; margin: 0 0 10px 0;">${meeting.title}</h3>
              <p style="color: #666; margin: 5px 0;"><strong>When:</strong> ${new Date(meeting.startTime).toLocaleString()}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Where:</strong> ${meeting.location || 'Virtual'}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Duration:</strong> ${calculateDuration(meeting.startTime, meeting.endTime)}</p>
            </div>
            
            ${meeting.description ? `
            <div style="margin-bottom: 20px;">
              <h4 style="color: #333; margin-bottom: 10px;">Description:</h4>
              <p style="color: #666; line-height: 1.5;">${meeting.description}</p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/meetings/${meeting.id}" 
                 style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Meeting Details
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      </div>
    `
  }),
  
  meetingReminder: (meeting) => ({
    subject: `Reminder: ${meeting.title} starts in 1 hour`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px;">
          <div style="background: white; padding: 30px; border-radius: 8px; text-align: center;">
            <h2 style="color: #856404; margin-bottom: 20px;">⏰ Meeting Reminder</h2>
            
            <div style="background: #fff; padding: 20px; border-radius: 6px; border: 2px solid #ffc107; margin-bottom: 20px;">
              <h3 style="color: #856404; margin: 0 0 10px 0;">${meeting.title}</h3>
              <p style="color: #666; margin: 5px 0;"><strong>Starts in 1 hour:</strong> ${new Date(meeting.startTime).toLocaleString()}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Location:</strong> ${meeting.location || 'Virtual'}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/meetings/${meeting.id}" 
                 style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Join Meeting
              </a>
            </div>
          </div>
        </div>
      </div>
    `
  }),
  
  meetingUpdate: (meeting, changes) => ({
    subject: `Meeting Updated: ${meeting.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #d1ecf1; padding: 20px; border-radius: 8px;">
          <div style="background: white; padding: 30px; border-radius: 8px;">
            <h2 style="color: #0c5460; margin-bottom: 20px;">📝 Meeting Updated</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
              <h3 style="color: #0c5460; margin: 0 0 10px 0;">${meeting.title}</h3>
              <p style="color: #666; margin: 5px 0;"><strong>Updated:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="background: #e9ecef; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
              <h4 style="color: #495057; margin: 0 0 10px 0;">Changes:</h4>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                ${Object.entries(changes).map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`).join('')}
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/meetings/${meeting.id}" 
                 style="background: #17a2b8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Updated Meeting
              </a>
            </div>
          </div>
        </div>
      </div>
    `
  })
};

// Helper function to calculate meeting duration
function calculateDuration(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const duration = Math.round((end - start) / (1000 * 60));
  return `${duration} minutes`;
}

// Send email function
const sendEmail = async (to, template) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || '"İş Takip Platformu" <noreply@istakip.com>',
      to,
      subject: template.subject,
      html: template.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email send failed:', error);
    return { success: false, error: error.message };
  }
};

// Mock email queue for testing
let emailQueue = [];

// @route   POST /api/emails/send-invitation
// @desc    Send meeting invitation email
// @access  Private
router.post('/send-invitation', asyncHandler(async (req, res) => {
  const { meetingId, participantId } = req.body;
  
  // In a real app, fetch meeting and participant from database
  const mockMeeting = {
    id: meetingId,
    title: 'Project Kickoff Meeting',
    description: 'Initial project kickoff to discuss requirements and timeline',
    startTime: '2026-04-10T10:00:00Z',
    endTime: '2026-04-10T11:30:00Z',
    location: 'Conference Room A'
  };
  
  const mockParticipant = {
    id: participantId,
    email: 'participant@example.com',
    firstName: 'John',
    lastName: 'Doe'
  };
  
  // Send invitation email
  const result = await sendEmail(mockParticipant.email, emailTemplates.meetingInvitation(mockMeeting, mockParticipant));
  
  if (result.success) {
    // Add to email queue for tracking
    emailQueue.push({
      id: Date.now().toString(),
      type: 'invitation',
      to: mockParticipant.email,
      meetingId,
      participantId,
      sentAt: new Date(),
      messageId: result.messageId
    });
  }
  
  res.json({
    success: result.success,
    message: result.success ? 'Invitation email sent successfully' : 'Failed to send invitation email',
    emailId: result.messageId
  });
}));

// @route   POST /api/emails/send-reminder
// @desc    Send meeting reminder email
// @access  Private
router.post('/send-reminder', asyncHandler(async (req, res) => {
  const { meetingId } = req.body;
  
  // In a real app, fetch meeting from database
  const mockMeeting = {
    id: meetingId,
    title: 'Weekly Standup',
    startTime: '2026-04-08T09:00:00Z',
    location: 'Virtual - Zoom'
  };
  
  // Send reminder email
  const result = await sendEmail('participant@example.com', emailTemplates.meetingReminder(mockMeeting));
  
  if (result.success) {
    // Add to email queue for tracking
    emailQueue.push({
      id: Date.now().toString(),
      type: 'reminder',
      to: 'participant@example.com',
      meetingId,
      sentAt: new Date(),
      messageId: result.messageId
    });
  }
  
  res.json({
    success: result.success,
    message: result.success ? 'Reminder email sent successfully' : 'Failed to send reminder email',
    emailId: result.messageId
  });
}));

// @route   POST /api/emails/send-update
// @desc    Send meeting update email
// @access  Private
router.post('/send-update', asyncHandler(async (req, res) => {
  const { meetingId, changes } = req.body;
  
  // In a real app, fetch meeting from database
  const mockMeeting = {
    id: meetingId,
    title: 'Client Presentation',
    startTime: '2026-04-15T14:00:00Z',
    endTime: '2026-04-15T16:00:00Z',
    location: 'Client Office'
  };
  
  // Send update email
  const result = await sendEmail('participant@example.com', emailTemplates.meetingUpdate(mockMeeting, changes));
  
  if (result.success) {
    // Add to email queue for tracking
    emailQueue.push({
      id: Date.now().toString(),
      type: 'update',
      to: 'participant@example.com',
      meetingId,
      changes,
      sentAt: new Date(),
      messageId: result.messageId
    });
  }
  
  res.json({
    success: result.success,
    message: result.success ? 'Update email sent successfully' : 'Failed to send update email',
    emailId: result.messageId
  });
}));

// @route   GET /api/emails/queue
// @desc    Get email queue for testing
// @access  Private
router.get('/queue', (req, res) => {
  res.json({
    emails: emailQueue
  });
});

// @route   POST /api/emails/test
// @desc    Test Gmail SMTP configuration
// @access  Private
router.post('/test', asyncHandler(async (req, res) => {
  const testResult = await emailService.testEmailConfiguration();
  
  res.json({
    success: testResult.success,
    message: testResult.success ? 'Gmail SMTP test başarılı! Test email gönderildi.' : 'Gmail SMTP test başarısız!',
    error: testResult.error
  });
}));

module.exports = router;
