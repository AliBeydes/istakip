const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
const prisma = new PrismaClient();

// @route   GET /api/public/meetings/:id
// @desc    Get meeting by ID (public, no auth required)
// @access  Public
router.get('/meetings/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

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

  res.json({ meeting });
}));

// @route   POST /api/public/meetings/:id/join-guest
// @desc    Join meeting as guest (no auth required)
// @access  Public
router.post('/meetings/:id/join-guest', asyncHandler(async (req, res) => {
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

module.exports = router;
