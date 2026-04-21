const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { sendNotificationToUser, sendNotificationToWorkspace, broadcastToWorkspace } = require('../websocket/socket-handler');

const router = express.Router();
const prisma = new PrismaClient();

// Meeting scheduler - automatically create recurring meetings
// @route   POST /api/scheduler/schedule
// @desc    Schedule a new meeting with automatic notifications
// @access  Private
router.post('/schedule', async (req, res) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      recurring,
      recurrencePattern,
      participants,
      workspaceId,
      location,
      meetingType
    } = req.body;

    // Validate required fields
    if (!title || !startTime || !endTime || !workspaceId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, startTime, endTime, workspaceId'
      });
    }

    // Create meeting
    const meeting = await prisma.meeting.create({
      data: {
        title,
        description: description || '',
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        recurring: recurring || false,
        recurrencePattern: recurrencePattern || null,
        location: location || '',
        type: meetingType || 'REGULAR',
        status: 'SCHEDULED',
        workspace: { connect: { id: workspaceId } },
        organizer: { connect: { id: req.user?.id || '1' } },
        participants: {
          create: participants?.map(p => ({
            user: { connect: { id: p.userId } },
            status: p.status || 'PENDING',
            role: p.role || 'ATTENDEE',
            email: p.email
          })) || []
        }
      },
      include: {
        participants: {
          include: { user: true }
        },
        organizer: true
      }
    });

    // Send immediate notifications
    await sendMeetingNotifications(meeting, 'CREATED');

    // Schedule reminder notifications
    await scheduleReminders(meeting);

    res.json({
      success: true,
      data: meeting,
      message: 'Meeting scheduled successfully'
    });

  } catch (error) {
    console.error('Schedule meeting error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to schedule meeting'
    });
  }
});

// Send meeting notifications
async function sendMeetingNotifications(meeting, action) {
  const io = global.io;
  if (!io) return;

  const notificationData = {
    type: 'MEETING_' + action,
    title: action === 'CREATED' ? 'New Meeting Invitation' : 'Meeting Updated',
    message: `Meeting "${meeting.title}" ${action === 'CREATED' ? 'scheduled' : 'updated'}`,
    data: {
      meetingId: meeting.id,
      title: meeting.title,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      location: meeting.location,
      organizer: meeting.organizer
    }
  };

  // Send to each participant
  meeting.participants?.forEach(participant => {
    if (participant.user?.id) {
      // WebSocket notification
      sendNotificationToUser(io, participant.user.id, notificationData);
      
      // Email notification (if configured)
      if (participant.email) {
        sendEmailNotification(participant.email, meeting, action);
      }
    }
  });

  // Broadcast to workspace
  broadcastToWorkspace(io, meeting.workspaceId, 'meeting:scheduled', {
    meeting,
    action,
    timestamp: new Date().toISOString()
  });
}

// Schedule reminder notifications
async function scheduleReminders(meeting) {
  const reminders = [
    { time: 24 * 60 * 60 * 1000, label: '24 hours' },    // 24 hours before
    { time: 60 * 60 * 1000, label: '1 hour' },          // 1 hour before
    { time: 15 * 60 * 1000, label: '15 minutes' }       // 15 minutes before
  ];

  const startTime = new Date(meeting.startTime).getTime();
  const now = Date.now();

  reminders.forEach(({ time, label }) => {
    const reminderTime = startTime - time;
    
    if (reminderTime > now) {
      const delay = reminderTime - now;
      
      setTimeout(() => {
        sendReminderNotification(meeting, label);
      }, delay);
      
      console.log(`⏰ Reminder scheduled for meeting ${meeting.id} in ${delay}ms (${label})`);
    }
  });
}

// Send reminder notification
async function sendReminderNotification(meeting, timeLabel) {
  const io = global.io;
  if (!io) return;

  const notificationData = {
    type: 'MEETING_REMINDER',
    title: `⏰ Meeting in ${timeLabel}`,
    message: `Meeting "${meeting.title}" starts in ${timeLabel}`,
    data: {
      meetingId: meeting.id,
      title: meeting.title,
      startTime: meeting.startTime,
      location: meeting.location,
      timeLabel
    }
  };

  meeting.participants?.forEach(participant => {
    if (participant.user?.id) {
      sendNotificationToUser(io, participant.user.id, notificationData);
    }
  });
}

// Send email notification
async function sendEmailNotification(email, meeting, action) {
  // This would integrate with the existing email system
  console.log(`📧 Email notification would be sent to ${email} for meeting ${meeting.title}`);
}

// @route   POST /api/scheduler/reminders
// @desc    Get upcoming meeting reminders
// @access  Private
router.get('/reminders', async (req, res) => {
  try {
    const userId = req.user?.id || '1';
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const reminders = await prisma.meetingParticipant.findMany({
      where: {
        userId,
        status: { in: ['ACCEPTED', 'PENDING'] },
        meeting: {
          startTime: {
            gte: now,
            lte: next24Hours
          },
          status: 'SCHEDULED'
        }
      },
      include: {
        meeting: {
          include: {
            organizer: true,
            participants: {
              where: { status: 'ACCEPTED' }
            }
          }
        }
      },
      orderBy: {
        meeting: {
          startTime: 'asc'
        }
      }
    });

    res.json({
      success: true,
      data: reminders.map(r => ({
        id: r.id,
        meeting: r.meeting,
        timeUntil: new Date(r.meeting.startTime).getTime() - now.getTime(),
        status: r.status
      }))
    });

  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get reminders'
    });
  }
});

// @route   POST /api/scheduler/start-meeting/:id
// @desc    Mark meeting as started and notify participants
// @access  Private
router.post('/start-meeting/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await prisma.meeting.update({
      where: { id },
      data: { status: 'IN_PROGRESS' },
      include: {
        participants: { include: { user: true } },
        organizer: true
      }
    });

    // Notify all participants
    const io = global.io;
    if (io) {
      meeting.participants?.forEach(participant => {
        if (participant.user?.id) {
          sendNotificationToUser(io, participant.user.id, {
            type: 'MEETING_STARTED',
            title: '🎥 Meeting Started',
            message: `Meeting "${meeting.title}" has started`,
            data: {
              meetingId: meeting.id,
              joinUrl: `/meetings/${meeting.id}/join`
            }
          });
        }
      });
    }

    res.json({
      success: true,
      data: meeting,
      message: 'Meeting started and participants notified'
    });

  } catch (error) {
    console.error('Start meeting error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start meeting'
    });
  }
});

// @route   POST /api/scheduler/cancel-meeting/:id
// @desc    Cancel meeting and notify participants
// @access  Private
router.post('/cancel-meeting/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const meeting = await prisma.meeting.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        participants: { include: { user: true } },
        organizer: true
      }
    });

    // Notify all participants
    const io = global.io;
    if (io) {
      meeting.participants?.forEach(participant => {
        if (participant.user?.id) {
          sendNotificationToUser(io, participant.user.id, {
            type: 'MEETING_CANCELLED',
            title: '❌ Meeting Cancelled',
            message: `Meeting "${meeting.title}" has been cancelled${reason ? `: ${reason}` : ''}`,
            data: {
              meetingId: meeting.id,
              reason
            }
          });
        }
      });
    }

    res.json({
      success: true,
      data: meeting,
      message: 'Meeting cancelled and participants notified'
    });

  } catch (error) {
    console.error('Cancel meeting error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel meeting'
    });
  }
});

module.exports = router;
