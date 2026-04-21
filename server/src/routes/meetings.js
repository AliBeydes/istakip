const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/meetings
// @desc    Get all meetings for a workspace
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { workspaceId, status, startDate, endDate } = req.query;
  
  if (!workspaceId) {
    return res.status(400).json({ error: 'workspaceId is required' });
  }

  const where = { workspaceId };
  
  if (status) where.status = status;
  if (startDate || endDate) {
    where.startTime = {};
    if (startDate) where.startTime.gte = new Date(startDate);
    if (endDate) where.startTime.lte = new Date(endDate);
  }

  const meetings = await prisma.meeting.findMany({
    where,
    include: {
      organizer: {
        select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
      },
      attendees: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
          }
        }
      }
    },
    orderBy: { startTime: 'desc' }
  });

  res.json({ meetings });
}));

// @route   GET /api/meetings/:id
// @desc    Get meeting by ID
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: {
      organizer: {
        select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
      },
      attendees: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
          }
        }
      },
      documents: {
        include: {
          document: true
        }
      }
    }
  });

  if (!meeting) {
    return res.status(404).json({ error: 'Meeting not found' });
  }

  res.json({ meeting });
}));

// @route   POST /api/meetings
// @desc    Create a new meeting
// @access  Private
router.post('/', asyncHandler(async (req, res) => {
  const { 
    title, 
    description, 
    startTime, 
    endTime, 
    workspaceId,
    type = 'ONLINE',
    location,
    meetingLink,
    attendees = []
  } = req.body;

  // Validation
  if (!title || !startTime || !endTime || !workspaceId) {
    return res.status(400).json({ 
      error: 'Missing required fields: title, startTime, endTime, workspaceId' 
    });
  }

  const meeting = await prisma.meeting.create({
    data: {
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      workspaceId,
      organizerId: req.user.id,
      type,
      location,
      meetingLink,
      status: 'SCHEDULED'
    },
    include: {
      organizer: {
        select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
      },
      attendees: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
          }
        }
      }
    }
  });

  // Add attendees if provided
  if (attendees.length > 0) {
    const attendeeData = attendees.map(attendee => ({
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      meetingId: meeting.id,
      userId: attendee.userId,
      status: 'PENDING',
      role: attendee.role || 'ATTENDEE'
    }));

    await prisma.meetingAttendee.createMany({
      data: attendeeData,
      skipDuplicates: true
    });

    // Fetch updated meeting with attendees
    const updatedMeeting = await prisma.meeting.findUnique({
      where: { id: meeting.id },
      include: {
        organizer: {
          select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
        },
        attendees: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
            }
          }
        }
      }
    });

    // Send email invitations to all attendees
    console.log(`📧 Sending meeting invitations to ${updatedMeeting.attendees.length} attendees...`);
    
    updatedMeeting.attendees.forEach(async (attendee) => {
      if (attendee.user.email && attendee.user.email !== req.user.email) {
        try {
          await emailService.sendMeetingInvitation(updatedMeeting, attendee.user);
          console.log(`✅ Invitation sent to ${attendee.user.email}`);
        } catch (error) {
          console.error(`❌ Failed to send email to ${attendee.user.email}:`, error);
        }
      }
    });

    return res.status(201).json({ 
      message: 'Meeting created successfully', 
      meeting: updatedMeeting 
    });
  }

  res.status(201).json({ 
    message: 'Meeting created successfully', 
    meeting 
  });
}));

// @route   PUT /api/meetings/:id
// @desc    Update a meeting
// @access  Private
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, startTime, endTime, status, location, meetingLink } = req.body;

  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: { attendees: true }
  });

  if (!meeting) {
    return res.status(404).json({ error: 'Meeting not found' });
  }

  // Check if user is organizer
  if (meeting.organizerId !== req.user.id) {
    return res.status(403).json({ error: 'Only organizer can update meeting' });
  }

  const updatedMeeting = await prisma.meeting.update({
    where: { id },
    data: {
      title: title || meeting.title,
      description: description !== undefined ? description : meeting.description,
      startTime: startTime ? new Date(startTime) : meeting.startTime,
      endTime: endTime ? new Date(endTime) : meeting.endTime,
      status: status || meeting.status,
      location: location !== undefined ? location : meeting.location,
      meetingLink: meetingLink !== undefined ? meetingLink : meeting.meetingLink
    },
    include: {
      organizer: {
        select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
      },
      attendees: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
          }
        }
      }
    }
  });

  res.json({ 
    message: 'Meeting updated successfully', 
    meeting: updatedMeeting 
  });
}));

// @route   DELETE /api/meetings/:id
// @desc    Delete a meeting
// @access  Private
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const meeting = await prisma.meeting.findUnique({
    where: { id }
  });

  if (!meeting) {
    return res.status(404).json({ error: 'Meeting not found' });
  }

  // Check if user is organizer or workspace admin
  if (meeting.organizerId !== req.user.id) {
    return res.status(403).json({ error: 'Only organizer can delete meeting' });
  }

  await prisma.meeting.delete({
    where: { id }
  });

  res.json({ message: 'Meeting deleted successfully' });
}));

// @route   POST /api/meetings/:id/attendees
// @desc    Add attendees to a meeting
// @access  Private
router.post('/:id/attendees', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { attendees } = req.body;

  if (!attendees || !Array.isArray(attendees) || attendees.length === 0) {
    return res.status(400).json({ error: 'attendees array is required' });
  }

  const meeting = await prisma.meeting.findUnique({
    where: { id }
  });

  if (!meeting) {
    return res.status(404).json({ error: 'Meeting not found' });
  }

  const attendeeData = attendees.map(attendee => ({
    id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    meetingId: id,
    userId: attendee.userId,
    status: 'PENDING',
    role: attendee.role || 'ATTENDEE'
  }));

  await prisma.meetingAttendee.createMany({
    data: attendeeData,
    skipDuplicates: true
  });

  const { participants } = await prisma.meetingAttendee.findMany({
    where: { meetingId: id },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
      }
    }
  });

  res.json({ 
    message: 'Attendees added successfully', 
    participants 
  });
}));

// @route   PUT /api/meetings/:id/attendees/:attendeeId
// @desc    Update attendee status
// @access  Private
router.put('/:id/attendees/:attendeeId', asyncHandler(async (req, res) => {
  const { id, attendeeId } = req.params;
  const { status } = req.body;

  if (!status || !['PENDING', 'ACCEPTED', 'DECLINED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const attendee = await prisma.meetingAttendee.findFirst({
    where: { 
      id: attendeeId,
      meetingId: id
    }
  });

  if (!attendee) {
    return res.status(404).json({ error: 'Attendee not found' });
  }

  const updatedAttendee = await prisma.meetingAttendee.update({
    where: { id: attendeeId },
    data: { status },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
      }
    }
  });

  res.json({ 
    message: 'Attendee status updated', 
    participant: updatedAttendee 
  });
}));

// @route   PUT /api/meetings/:id/notes
// @desc    Update meeting notes
// @access  Private
router.put('/:id/notes', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;

  const meeting = await prisma.meeting.findUnique({
    where: { id }
  });

  if (!meeting) {
    return res.status(404).json({ error: 'Meeting not found' });
  }

  const updatedMeeting = await prisma.meeting.update({
    where: { id },
    data: { notes },
    include: {
      organizer: {
        select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
      },
      attendees: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
          }
        }
      }
    }
  });

  res.json({ 
    message: 'Meeting notes updated', 
    meeting: updatedMeeting 
  });
}));

// @route   POST /api/meetings/:id/join-guest
// @desc    Join meeting as guest (no auth required)
// @access  Public
router.post('/:id/join-guest', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: {
      organizer: {
        select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
      }
    }
  });

  if (!meeting) {
    return res.status(404).json({ error: 'Meeting not found' });
  }

  // Return meeting info and guest info
  res.json({
    meeting,
    guestUser: {
      id: `guest-${Date.now()}`,
      name,
      email,
      isGuest: true
    }
  });
}));

// @route   POST /api/meetings/:id/invite-external
// @desc    Send invitation to external email (non-registered user)
// @access  Private
router.post('/:id/invite-external', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email, inviterName } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: {
      organizer: {
        select: { id: true, firstName: true, lastName: true, email: true }
      }
    }
  });

  if (!meeting) {
    return res.status(404).json({ error: 'Meeting not found' });
  }

  // Create invite link
  const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/meeting/${id}?invite=true`;

  // Send email using the correct function signature
  const inviter = {
    firstName: meeting.organizer?.firstName || 'Admin',
    lastName: meeting.organizer?.lastName || ''
  };

  const result = await emailService.sendMeetingInvitation(
    meeting,
    email,
    inviter,
    inviteLink
  );

  if (result.success) {
    res.json({ message: 'Invitation sent successfully' });
  } else {
    res.status(500).json({ error: 'Failed to send invitation', details: result.error });
  }
}));

// @route   POST /api/meetings/configure-smtp
// @desc    Save SMTP configuration to .env
// @access  Private (Admin only)
router.post('/configure-smtp', asyncHandler(async (req, res) => {
  const { smtpHost, smtpPort, smtpUser, smtpPass } = req.body;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    return res.status(400).json({ error: 'All SMTP fields are required' });
  }

  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '../../.env');

    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update SMTP settings in .env
    envContent = envContent.replace(/SMTP_HOST=.*/g, `SMTP_HOST="${smtpHost}"`);
    envContent = envContent.replace(/SMTP_PORT=.*/g, `SMTP_PORT="${smtpPort}"`);
    envContent = envContent.replace(/SMTP_USER=.*/g, `SMTP_USER="${smtpUser}"`);
    envContent = envContent.replace(/SMTP_PASS=.*/g, `SMTP_PASS="${smtpPass}"`);

    fs.writeFileSync(envPath, envContent);

    console.log('✅ SMTP configuration updated in .env');
    res.json({ message: 'SMTP configuration saved successfully. Please restart the server.' });
  } catch (error) {
    console.error('❌ Error updating .env:', error);
    res.status(500).json({ error: 'Failed to update SMTP configuration' });
  }
}));

// @route   POST /api/meetings/test-smtp
// @desc    Test SMTP configuration
// @access  Private (Admin only)
router.post('/test-smtp', asyncHandler(async (req, res) => {
  try {
    const emailService = require('../services/emailService');
    const result = await emailService.testEmailConfiguration();
    
    if (result.success) {
      res.json({ message: 'SMTP test successful', details: result.message });
    } else {
      res.status(500).json({ error: 'SMTP test failed', details: result.error });
    }
  } catch (error) {
    console.error('❌ SMTP test error:', error);
    res.status(500).json({ error: 'SMTP test error', details: error.message });
  }
}));

module.exports = router;
