const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireRole, requireOwnership } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const taskSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().optional(),
  status: Joi.string().valid('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED').default('TODO'),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM'),
  dueDate: Joi.date().optional(),
  workspaceId: Joi.string().required(),
  groupId: Joi.string().optional(),
  assigneeIds: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

// @route   GET /api/tasks
// @desc    Get tasks for a workspace
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { workspaceId, status, priority, assigneeId, search } = req.query;
  const userId = req.user.id;

  // Build filter
  const where = {
    workspaceId,
    ...(status && { status }),
    ...(priority && { priority }),
    ...(assigneeId && { 
      taskAssignments: { 
        some: { userId: assigneeId } 
      } 
    }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    })
  };

  const tasks = await prisma.task.findMany({
    where,
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, avatar: true }
      },
      assignees: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true }
          }
        }
      },
      group: {
        select: { id: true, name: true, color: true }
      },
      tags: true,
      _count: {
        select: {
          comments: true,
          documents: true
        }
      }
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' }
    ]
  });

  res.json({
    tasks: tasks.map(task => ({
      ...task,
      assignees: task.assignees.map(a => a.user),
      commentCount: task._count.comments,
      documentCount: task._count.documents
    }))
  });
}));

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', asyncHandler(async (req, res) => {
  const { error, value } = taskSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(d => d.message)
    });
  }

  const { title, description, status, priority, dueDate, workspaceId, groupId, assigneeIds, tags } = value;
  const userId = req.user.id;

  // Check if user is member of workspace
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId
      }
    }
  });

  if (!membership) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You are not a member of this workspace'
    });
  }

  // Create task
  const task = await prisma.task.create({
    data: {
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      workspaceId,
      groupId,
      creatorId: userId,
      ...(assigneeIds && assigneeIds.length > 0 && {
        taskAssignments: {
          create: assigneeIds.map(assigneeId => ({
            userId: assigneeId
          }))
        }
      }),
      ...(tags && tags.length > 0 && {
        tags: {
          create: tags.map(tag => ({ tag }))
        }
      })
    },
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, avatar: true }
      },
      assignees: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true }
          }
        }
      },
      group: {
        select: { id: true, name: true, color: true }
      },
      tags: true
    }
  });

  res.status(201).json({
    message: 'Task created successfully',
    task: {
      ...task,
      assignees: task.assignees.map(a => a.user)
    }
  });
}));

module.exports = router;
