const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// @route   GET /api/groups
// @desc    Get all groups for a workspace
// @access  Private
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const workspaceId = req.query.workspaceId || '1';
  
  const groups = await prisma.group.findMany({
    where: { workspaceId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          }
        }
      }
    }
  });

  res.json({ groups });
}));

// @route   POST /api/groups
// @desc    Create a new group
// @access  Private
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const { name, description, color, workspaceId = '1' } = req.body;

  const group = await prisma.group.create({
    data: {
      name,
      description,
      color,
      workspaceId,
      createdBy: req.user.id
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          }
        }
      }
    }
  });

  res.status(201).json(group);
}));

// @route   POST /api/groups/:groupId/members
// @desc    Add user to group
// @access  Private
router.post('/:groupId/members', authenticateToken, asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  // Check if user is already in group
  const existingMember = await prisma.groupMember.findFirst({
    where: {
      groupId,
      userId
    }
  });

  if (existingMember) {
    return res.status(200).json({ message: 'User already in group', member: existingMember });
  }

  const groupMember = await prisma.groupMember.create({
    data: {
      groupId,
      userId
      // addedBy: req.user.id // Field not in schema
    }
  });

  res.status(201).json(groupMember);
}));

// @route   PUT /api/groups/:groupId
// @desc    Update a group
// @access  Private
router.put('/:groupId', authenticateToken, asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { name, description, color } = req.body;

  const group = await prisma.group.findUnique({
    where: { id: groupId }
  });

  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  const updatedGroup = await prisma.group.update({
    where: { id: groupId },
    data: {
      name,
      description,
      color
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          }
        }
      }
    }
  });

  res.json(updatedGroup);
}));

// @route   DELETE /api/groups/:groupId/members/:userId
// @desc    Remove user from group
// @access  Private
router.delete('/:groupId/members/:userId', authenticateToken, asyncHandler(async (req, res) => {
  const { groupId, userId } = req.params;

  // Check if user is in group
  const existingMember = await prisma.groupMember.findFirst({
    where: {
      groupId,
      userId
    }
  });

  if (!existingMember) {
    return res.status(200).json({ message: 'User not in group' });
  }

  await prisma.groupMember.deleteMany({
    where: {
      groupId,
      userId
    }
  });

  res.json({ message: 'User removed from group' });
}));

// @route   DELETE /api/groups/:groupId
// @desc    Delete a group
// @access  Private
router.delete('/:groupId', authenticateToken, asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const group = await prisma.group.findUnique({
    where: { id: groupId }
  });

  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  // Delete group in a transaction to handle foreign key constraints
  await prisma.$transaction(async (tx) => {
    // Delete group members first
    await tx.groupMember.deleteMany({
      where: { groupId }
    });
    
    // Delete the group last
    await tx.group.delete({
      where: { id: groupId }
    });
  });

  res.json({ message: 'Group deleted successfully' });
}));

module.exports = router;
