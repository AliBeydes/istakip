const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');
const emailService = require('../services/emailService');

const router = express.Router();
const prisma = new PrismaClient();

// Mock meetings data
let mockMeetings = [
  {
    id: '1',
    title: 'Project Kickoff Meeting',
    description: 'Initial project kickoff to discuss requirements and timeline',
    startTime: new Date('2026-04-10T10:00:00Z'),
    endTime: new Date('2026-04-10T11:30:00Z'),
    timezone: 'Europe/Istanbul',
    location: 'Conference Room A',
    type: 'REGULAR',
    status: 'SCHEDULED',
    workspaceId: '1',
    creatorId: '1',
    createdAt: new Date('2026-04-05'),
    updatedAt: new Date('2026-04-05'),
    creator: { id: '1', firstName: 'Test', lastName: 'User', avatar: null },
    participants: [
      { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com', status: 'ACCEPTED' },
      { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', status: 'PENDING' }
    ],
    notes: '# Meeting Agenda\n\n1. Project overview\n2. Requirements discussion\n3. Timeline planning\n4. Q&A',
    _count: { documents: 2, tasks: 3 }
  },
  {
    id: '2',
    title: 'Weekly Standup',
    description: 'Weekly team standup meeting',
    startTime: new Date('2026-04-08T09:00:00Z'),
    endTime: new Date('2026-04-08T09:30:00Z'),
    timezone: 'Europe/Istanbul',
    location: 'Virtual - Zoom',
    type: 'RECURRING',
    status: 'SCHEDULED',
    workspaceId: '1',
    creatorId: '1',
    createdAt: new Date('2026-04-01'),
    updatedAt: new Date('2026-04-01'),
    creator: { id: '1', firstName: 'Test', lastName: 'User', avatar: null },
    participants: [
      { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com', status: 'ACCEPTED' },
      { id: '3', firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', status: 'ACCEPTED' }
    ],
    notes: '## Standup Topics\n\n- What did you accomplish yesterday?\n- What will you do today?\n- Any blockers?',
    _count: { documents: 0, tasks: 5 }
  },
  {
    id: '3',
    title: 'Client Presentation',
    description: 'Quarterly progress presentation to client',
    startTime: new Date('2026-04-15T14:00:00Z'),
    endTime: new Date('2026-04-15T16:00:00Z'),
    timezone: 'Europe/Istanbul',
    location: 'Client Office',
    type: 'IMPORTANT',
    status: 'SCHEDULED',
    workspaceId: '1',
    creatorId: '1',
    createdAt: new Date('2026-04-07'),
    updatedAt: new Date('2026-04-07'),
    creator: { id: '1', firstName: 'Test', lastName: 'User', avatar: null },
    participants: [
      { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com', status: 'ACCEPTED' },
      { id: '4', firstName: 'Alice', lastName: 'Brown', email: 'alice@example.com', status: 'TENTATIVE' }
    ],
    notes: '# Client Presentation\n\n## Agenda\n1. Q1 Progress Review\n2. Demo of new features\n3. Q2 Roadmap\n4. Budget discussion\n\n## Preparation\n- [ ] Prepare presentation slides\n- [ ] Test demo environment\n- [ ] Print handouts',
    _count: { documents: 5, tasks: 8 }
  }
];

// @route   GET /api/meetings
// @desc    Get meetings for a workspace
// @access  Private
router.get('/', (req, res) => {
  const { workspaceId, startDate, endDate, status, type } = req.query;
  
  let filteredMeetings = mockMeetings;
  
  if (workspaceId) {
    filteredMeetings = filteredMeetings.filter(meeting => meeting.workspaceId === workspaceId);
  }
  
  if (startDate || endDate) {
    filteredMeetings = filteredMeetings.filter(meeting => {
      const meetingStart = new Date(meeting.startTime);
      const start = startDate ? new Date(startDate) : new Date('1970-01-01');
      const end = endDate ? new Date(endDate) : new Date('2100-12-31');
      return meetingStart >= start && meetingStart <= end;
    });
  }
  
  if (status) {
    filteredMeetings = filteredMeetings.filter(meeting => meeting.status === status);
  }
  
  if (type) {
    filteredMeetings = filteredMeetings.filter(meeting => meeting.type === type);
  }
  
  // Sort by start time
  filteredMeetings.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  
  res.json({
    meetings: filteredMeetings
  });
});

// @route   POST /api/meetings
// @desc    Create a new meeting
// @access  Private
router.post('/', (req, res) => {
  const { 
    title, 
    description, 
    startTime, 
    endTime, 
    timezone = 'Europe/Istanbul',
    location,
    type = 'REGULAR',
    workspaceId,
    participants = [],
    notes 
  } = req.body;
  
  if (!title || !startTime || !endTime || !workspaceId) {
    return res.status(400).json({
      error: 'Title, start time, end time, and workspaceId are required'
    });
  }
  
  const newMeeting = {
    id: Date.now().toString(),
    title,
    description,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    timezone,
    location,
    type,
    status: 'SCHEDULED',
    workspaceId,
    creatorId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: { id: '1', firstName: 'Test', lastName: 'User', avatar: null },
    participants: participants.map(p => ({
      ...p,
      status: 'PENDING'
    })),
    notes: notes || '',
    _count: { documents: 0, tasks: 0 }
  };
  
  mockMeetings.push(newMeeting);
  
  // Send email invitations to all participants
  if (participants && participants.length > 0) {
    console.log(`📧 Sending meeting invitations to ${participants.length} participants...`);
    
    participants.forEach(async (participant) => {
      if (participant.email) {
        try {
          const joinUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/meetings/join/${newMeeting.id}?token=${participant.id}`;
          await emailService.sendMeetingInvitation(newMeeting, participant.email, { firstName: 'Test', lastName: 'User' }, joinUrl);
        } catch (error) {
          console.error(`Failed to send email to ${participant.email}:`, error);
        }
      }
    });
  }
  
  res.status(201).json({
    message: 'Meeting created successfully',
    meeting: newMeeting
  });
});

// @route   GET /api/meetings/:id
// @desc    Get a single meeting
// @access  Private
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  const meeting = mockMeetings.find(m => m.id === id);
  
  if (!meeting) {
    return res.status(404).json({
      error: 'Meeting not found'
    });
  }
  
  res.json({
    meeting
  });
});

// @route   PUT /api/meetings/:id
// @desc    Update a meeting
// @access  Private
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, startTime, endTime, location, type, status, participants, notes } = req.body;
  
  const meetingIndex = mockMeetings.findIndex(m => m.id === id);
  
  if (meetingIndex === -1) {
    return res.status(404).json({
      error: 'Meeting not found'
    });
  }
  
  const oldMeeting = mockMeetings[meetingIndex]; // Get old meeting before update
  
  const updatedMeeting = {
    ...oldMeeting,
    ...(title && { title }),
    ...(description !== undefined && { description }),
    ...(startTime && { startTime: new Date(startTime) }),
    ...(endTime && { endTime: new Date(endTime) }),
    ...(location !== undefined && { location }),
    ...(type && { type }),
    ...(status && { status }),
    ...(participants && { 
      participants: participants.map(p => ({
        ...p,
        status: p.status || 'PENDING'
      }))
    }),
    ...(notes !== undefined && { notes }),
    updatedAt: new Date()
  };
  
  mockMeetings[meetingIndex] = updatedMeeting;
  
  // Send email notifications based on status change
  if (status && updatedMeeting.participants) {
    const previousStatus = oldMeeting.status;
    
    if (status === 'CANCELLED' && previousStatus !== 'CANCELLED') {
      // Send cancellation emails
      console.log(`📧 Sending cancellation emails to ${updatedMeeting.participants.length} participants...`);
      updatedMeeting.participants.forEach(async (participant) => {
        if (participant.email) {
          try {
            await emailService.sendMeetingCancellation(updatedMeeting, participant, req.body.cancellationReason);
          } catch (error) {
            console.error(`Failed to send cancellation email:`, error);
          }
        }
      });
    } else if (status === 'COMPLETED' && previousStatus !== 'COMPLETED') {
      // Meeting completed - no email needed
      console.log(`✅ Meeting marked as completed`);
    } else {
      // Send update emails for other changes
      console.log(`📧 Sending update emails to ${updatedMeeting.participants.length} participants...`);
      updatedMeeting.participants.forEach(async (participant) => {
        if (participant.email && participant.status !== 'DECLINED') {
          try {
            await emailService.sendMeetingUpdate(updatedMeeting, participant);
          } catch (error) {
            console.error(`Failed to send update email:`, error);
          }
        }
      });
    }
  }
  
  res.json({
    message: 'Meeting updated successfully',
    meeting: updatedMeeting
  });
});

// @route   DELETE /api/meetings/:id
// @desc    Delete a meeting
// @access  Private
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  const meetingIndex = mockMeetings.findIndex(m => m.id === id);
  
  if (meetingIndex === -1) {
    return res.status(404).json({
      error: 'Meeting not found'
    });
  }
  
  mockMeetings.splice(meetingIndex, 1);
  
  res.json({
    message: 'Meeting deleted successfully'
  });
});

// @route   POST /api/meetings/:id/participants
// @desc    Add participants to a meeting
// @access  Private
router.post('/:id/participants', (req, res) => {
  const { id } = req.params;
  const { participants } = req.body;
  
  const meetingIndex = mockMeetings.findIndex(m => m.id === id);
  
  if (meetingIndex === -1) {
    return res.status(404).json({
      error: 'Meeting not found'
    });
  }
  
  const meeting = mockMeetings[meetingIndex];
  const newParticipants = participants.map(p => ({
    ...p,
    status: 'PENDING'
  }));
  
  meeting.participants = [...meeting.participants, ...newParticipants];
  meeting.updatedAt = new Date();
  
  res.json({
    message: 'Participants added successfully',
    participants: newParticipants
  });
});

// @route   PUT /api/meetings/:id/participants/:participantId
// @desc    Update participant status
// @access  Private
router.put('/:id/participants/:participantId', (req, res) => {
  const { id, participantId } = req.params;
  const { status } = req.body;
  
  const meetingIndex = mockMeetings.findIndex(m => m.id === id);
  
  if (meetingIndex === -1) {
    return res.status(404).json({
      error: 'Meeting not found'
    });
  }
  
  const meeting = mockMeetings[meetingIndex];
  const participantIndex = meeting.participants.findIndex(p => p.id === participantId);
  
  if (participantIndex === -1) {
    return res.status(404).json({
      error: 'Participant not found'
    });
  }
  
  meeting.participants[participantIndex].status = status;
  meeting.updatedAt = new Date();
  
  res.json({
    message: 'Participant status updated successfully',
    participant: meeting.participants[participantIndex]
  });
});

// @route   POST /api/meetings/:id/notes
// @desc    Add notes to a meeting
// @access  Private
router.post('/:id/notes', (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  
  const meetingIndex = mockMeetings.findIndex(m => m.id === id);
  
  if (meetingIndex === -1) {
    return res.status(404).json({
      error: 'Meeting not found'
    });
  }
  
  mockMeetings[meetingIndex].notes = notes;
  mockMeetings[meetingIndex].updatedAt = new Date();
  
  res.json({
    message: 'Meeting notes updated successfully',
    notes: notes
  });
});

// @route   POST /api/meetings/:id/invite-external
// @desc    Invite external participants by email
// @access  Private
router.post('/:id/invite-external', async (req, res) => {
  const { id } = req.params;
  const { emails } = req.body;
  
  const meetingIndex = mockMeetings.findIndex(m => m.id === id);
  
  if (meetingIndex === -1) {
    return res.status(404).json({ error: 'Meeting not found' });
  }
  
  const meeting = mockMeetings[meetingIndex];
  const results = [];
  
  // Send invitation email to each external participant
  for (const email of emails) {
    const participantId = `ext-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const joinUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/meetings/join/${id}?token=${participantId}&email=${encodeURIComponent(email)}`;
    
    // Add as external participant
    meeting.participants.push({
      id: participantId,
      email: email,
      name: email.split('@')[0],
      type: 'external',
      status: 'PENDING',
      joinedAt: null
    });
    
    try {
      await emailService.sendMeetingInvitation(meeting, email, { firstName: 'Organizatör', lastName: '' }, joinUrl);
      results.push({ email, success: true });
    } catch (error) {
      console.error(`Failed to send invitation to ${email}:`, error);
      results.push({ email, success: false, error: error.message });
    }
  }
  
  meeting.updatedAt = new Date();
  
  res.json({
    message: 'External participants invited',
    results,
    meeting
  });
});

// @route   GET /api/meetings/join/:id
// @desc    Get meeting details for external join
// @access  Public (with token)
router.get('/join/:id', (req, res) => {
  const { id } = req.params;
  const { token, email } = req.query;
  
  const meetingIndex = mockMeetings.findIndex(m => m.id === id);
  
  if (meetingIndex === -1) {
    return res.status(404).json({ error: 'Meeting not found' });
  }
  
  const meeting = mockMeetings[meetingIndex];
  
  // Check if meeting is still valid
  if (meeting.status === 'CANCELLED') {
    return res.status(400).json({ error: 'Meeting has been cancelled' });
  }
  
  // Check if participant is invited
  let participant = meeting.participants.find(p => p.id === token || p.email === email);
  
  // If not found and email is provided, create guest participant
  if (!participant && email) {
    participant = {
      id: `guest-${Date.now()}`,
      email: email,
      name: email.split('@')[0],
      type: 'guest',
      status: 'JOINED',
      joinedAt: new Date()
    };
    meeting.participants.push(participant);
    meeting.updatedAt = new Date();
  }
  
  if (!participant) {
    return res.status(403).json({ error: 'Invalid invitation token' });
  }
  
  // Update participant status to JOINED
  if (participant.status === 'PENDING') {
    participant.status = 'JOINED';
    participant.joinedAt = new Date();
    meeting.updatedAt = new Date();
  }
  
  res.json({
    meeting: {
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      location: meeting.location,
      type: meeting.type,
      status: meeting.status,
      meetingLink: meeting.meetingLink,
      participants: meeting.participants
    },
    participant: {
      id: participant.id,
      email: participant.email,
      name: participant.name,
      type: participant.type || 'external',
      status: participant.status
    }
  });
});

module.exports = router;
