const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
const prisma = new PrismaClient();

// Mock participant data (in real app, this would come from database)
let mockParticipants = [
  {
    id: '1',
    meetingId: '1',
    userId: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    status: 'ACCEPTED',
    responseTime: new Date('2026-04-05T10:30:00Z'),
    invitedAt: new Date('2026-04-05T09:00:00Z'),
    role: 'ORGANIZER',
    isRequired: true
  },
  {
    id: '2',
    meetingId: '1',
    userId: '2',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    status: 'PENDING',
    invitedAt: new Date('2026-04-05T09:00:00Z'),
    role: 'ATTENDEE',
    isRequired: true
  },
  {
    id: '3',
    meetingId: '1',
    userId: '3',
    email: 'bob@example.com',
    firstName: 'Bob',
    lastName: 'Johnson',
    status: 'TENTATIVE',
    responseTime: new Date('2026-04-05T14:30:00Z'),
    invitedAt: new Date('2026-04-05T09:00:00Z'),
    role: 'OPTIONAL',
    isRequired: false
  },
  {
    id: '4',
    meetingId: '2',
    userId: '4',
    email: 'alice@example.com',
    firstName: 'Alice',
    lastName: 'Brown',
    status: 'DECLINED',
    responseTime: new Date('2026-04-06T11:00:00Z'),
    invitedAt: new Date('2026-04-05T09:00:00Z'),
    role: 'ATTENDEE',
    isRequired: false,
    declineReason: 'Has another meeting at the same time'
  }
];

// @route   GET /api/participants/meeting/:meetingId
// @desc    Get participants for a meeting
// @access  Private
router.get('/meeting/:meetingId', (req, res) => {
  const { meetingId } = req.params;
  
  const participants = mockParticipants.filter(p => p.meetingId === meetingId);
  
  res.json({
    participants
  });
});

// @route   POST /api/participants/respond
// @desc    Respond to meeting invitation
// @access  Private
router.post('/respond', (req, res) => {
  const { participantId, meetingId, status, declineReason } = req.body;
  
  const participantIndex = mockParticipants.findIndex(p => 
    p.id === participantId && p.meetingId === meetingId
  );
  
  if (participantIndex === -1) {
    return res.status(404).json({
      error: 'Participant not found'
    });
  }
  
  const participant = mockParticipants[participantIndex];
  participant.status = status;
  participant.responseTime = new Date();
  
  if (status === 'DECLINED' && declineReason) {
    participant.declineReason = declineReason;
  }
  
  // In a real app, this would trigger email notifications
  // Send confirmation email to participant
  // Send update to meeting organizer
  
  res.json({
    message: 'Response recorded successfully',
    participant
  });
});

// @route   PUT /api/participants/:id/role
// @desc    Update participant role
// @access  Private
router.put('/:id/role', (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  const participantIndex = mockParticipants.findIndex(p => p.id === id);
  
  if (participantIndex === -1) {
    return res.status(404).json({
      error: 'Participant not found'
    });
  }
  
  mockParticipants[participantIndex].role = role;
  mockParticipants[participantIndex].updatedAt = new Date();
  
  res.json({
    message: 'Participant role updated successfully',
    participant: mockParticipants[participantIndex]
  });
});

// @route   DELETE /api/participants/:id
// @desc    Remove participant from meeting
// @access  Private
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  const participantIndex = mockParticipants.findIndex(p => p.id === id);
  
  if (participantIndex === -1) {
    return res.status(404).json({
      error: 'Participant not found'
    });
  }
  
  const participant = mockParticipants[participantIndex];
  mockParticipants.splice(participantIndex, 1);
  
  res.json({
    message: 'Participant removed successfully',
    participant
  });
});

// @route   POST /api/participants/bulk
// @desc    Add multiple participants to a meeting
// @access  Private
router.post('/bulk', (req, res) => {
  const { meetingId, participants } = req.body;
  
  if (!meetingId || !participants || !Array.isArray(participants)) {
    return res.status(400).json({
      error: 'Meeting ID and participants array are required'
    });
  }
  
  const newParticipants = participants.map((p, index) => ({
    id: Date.now().toString() + index,
    meetingId,
    userId: p.userId,
    email: p.email,
    firstName: p.firstName,
    lastName: p.lastName,
    status: 'PENDING',
    invitedAt: new Date(),
    role: p.role || 'ATTENDEE',
    isRequired: false
  }));
  
  mockParticipants.push(...newParticipants);
  
  // In a real app, this would trigger email invitations
  // Send invitation emails to all new participants
  
  res.status(201).json({
    message: 'Participants added successfully',
    participants: newParticipants
  });
});

// @route   GET /api/participants/user/:userId
// @desc    Get user's meeting responses
// @access  Private
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  
  const userParticipants = mockParticipants.filter(p => p.userId === userId);
  
  // Group by status
  const stats = {
    total: userParticipants.length,
    accepted: userParticipants.filter(p => p.status === 'ACCEPTED').length,
    declined: userParticipants.filter(p => p.status === 'DECLINED').length,
    pending: userParticipants.filter(p => p.status === 'PENDING').length,
    tentative: userParticipants.filter(p => p.status === 'TENTATIVE').length
  };
  
  res.json({
    participants: userParticipants,
    stats
  });
});

// @route   POST /api/participants/:id/reminder
// @desc    Set custom reminder for participant
// @access  Private
router.post('/:id/reminder', (req, res) => {
  const { id } = req.params;
  const { reminderTime, reminderType } = req.body;
  
  const participantIndex = mockParticipants.findIndex(p => p.id === id);
  
  if (participantIndex === -1) {
    return res.status(404).json({
      error: 'Participant not found'
    });
  }
  
  mockParticipants[participantIndex].reminderTime = reminderTime;
  mockParticipants[participantIndex].reminderType = reminderType || 'EMAIL';
  mockParticipants[participantIndex].updatedAt = new Date();
  
  res.json({
    message: 'Reminder set successfully',
    participant: mockParticipants[participantIndex]
  });
});

module.exports = router;
