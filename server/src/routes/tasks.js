const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// @route   GET /api/tasks
// @desc    Get all tasks accessible to user
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { workspaceId, status, assignedTo, createdBy } = req.query;
  const userId = req.user.id;

  if (!workspaceId) {
    return res.status(400).json({ error: 'workspaceId is required' });
  }

  // Check if user is admin or manager
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId, workspaceId },
    select: { role: true }
  });
  
  const isAdmin = membership?.role === 'ADMIN' || membership?.role === 'MANAGER';

  // Build where clause
  const where = {
    workspaceId,
    OR: [
      // Tasks created by user
      { creatorId: userId },
      // Tasks assigned to user
      { 
        assignees: {
          some: { userId: userId }
        }
      },
      // If admin/manager, can see all tasks
      ...(isAdmin ? [] : [])
    ]
  };

  // Add filters
  if (status) where.status = status;
  if (assignedTo) {
    where.assignees = {
      some: { userId: assignedTo }
    };
  }
  if (createdBy) where.creatorId = createdBy;

  const tasks = await prisma.task.findMany({
    where,
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
      },
      assignees: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
          }
        }
      },
      documents: {
        include: {
          document: {
            select: { id: true, title: true, type: true }
          }
        }
      },
      comments: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ tasks });
}));

// @route   POST /api/tasks
// @desc    Create a new task with assignments
// @access  Private
router.post('/', asyncHandler(async (req, res) => {
  const { 
    title, 
    description, 
    priority = 'MEDIUM', 
    dueDate, 
    status = 'TODO',
    workspaceId,
    assignedUserIds = [],
    documentIds = []
  } = req.body;
  const userId = req.user.id;

  if (!title || !workspaceId) {
    return res.status(400).json({ error: 'Title and workspaceId are required' });
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      status,
      workspaceId,
      creatorId: userId
    },
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
      },
      assignees: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
          }
        }
      }
    }
  });

  // Create assignments
  if (assignedUserIds.length > 0) {
    const assignees = assignedUserIds.map(assignedUserId => ({
      id: `ta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskId: task.id,
      userId: assignedUserId
    }));

    await prisma.taskAssignment.createMany({
      data: assignees
    });
  }

  // Link documents
  if (documentIds.length > 0) {
    const taskDocuments = documentIds.map(documentId => ({
      taskId: task.id,
      documentId
    }));

    await prisma.taskDocument.createMany({
      data: taskDocuments
    });
  }

  // Fetch complete task with assignments
  const completeTask = await prisma.task.findUnique({
    where: { id: task.id },
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
      },
      assignees: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
          }
        }
      }
    }
  });

  res.status(201).json({
    message: 'Task created successfully',
    task: completeTask
  });
}));

// @route   POST /api/tasks/:id/assign
// @desc    Assign task to users
// @access  Private
router.post('/:id/assign', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userIds } = req.body;
  const requesterId = req.user.id;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: 'userIds array is required' });
  }

  const task = await prisma.task.findUnique({ where: { id } });

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Check permissions
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: requesterId, workspaceId: task.workspaceId },
    select: { role: true }
  });
  
  const isAdmin = membership?.role === 'ADMIN' || membership?.role === 'MANAGER';
  const isCreator = task.creatorId === requesterId;

  if (!isAdmin && !isCreator) {
    return res.status(403).json({ error: 'Only task creator or admin can assign users' });
  }

  // Remove existing assignments
  await prisma.taskAssignment.deleteMany({
    where: { taskId: id }
  });

  // Create new assignments
  const assignees = userIds.map(userId => ({
    id: `ta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    taskId: id,
    userId
  }));

  await prisma.taskAssignment.createMany({
    data: assignees
  });

  // Fetch updated task
  const updatedTask = await prisma.task.findUnique({
    where: { id },
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
      },
      assignees: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
          }
        }
      }
    }
  });

  res.json({
    message: 'Task assigned successfully',
    task: updatedTask
  });
}));

// @route   GET /api/tasks/workspace/:workspaceId/users
// @desc    Get all users in workspace for task assignment
// @access  Private
router.get('/workspace/:workspaceId/users', asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  const memberships = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          company: true,
          position: true,
          department: true
        }
      }
    },
    orderBy: { joinedAt: 'desc' }
  });

  const users = memberships.map(m => ({
    ...m.user,
    membershipRole: m.role,
    joinedAt: m.joinedAt
  }));

  res.json({ users });
}));

// @route   PUT /api/tasks/:id/status
// @desc    Update task status and award points
// @access  Private
router.put('/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  if (!['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  // Get task and check permissions
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true } },
      assignees: { include: { user: { select: { id: true } } } }
    }
  });

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Check if user can update the task
  const isCreator = task.creatorId === userId;
  const isAssignee = task.assignees.some(a => a.userId === userId);
  
  // Get user's role in workspace
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId: task.workspaceId
      }
    }
  });

  const isAdmin = membership?.role === 'ADMIN' || membership?.role === 'MANAGER';

  if (!isCreator && !isAssignee && !isAdmin) {
    return res.status(403).json({ error: 'Permission denied' });
  }

  // Update task status
  const updatedTask = await prisma.task.update({
    where: { id },
    data: { status },
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
      },
      assignees: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
          }
        }
      }
    }
  });

  res.json({
    success: true,
    task: updatedTask,
    message: 'Görev durumu güncellendi'
  });
}));

// @route   PATCH /api/tasks/:id
// @desc    Update task (general update - status, priority, etc.)
// @access  Private
router.patch('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, priority, dueDate, title, description } = req.body;
  const userId = req.user.id;

  // Get task and check permissions
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true } },
      assignees: { include: { user: { select: { id: true } } } }
    }
  });

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Check permissions
  const isCreator = task.creatorId === userId;
  const isAssignee = task.assignees.some(a => a.userId === userId);
  
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId: task.workspaceId
      }
    }
  });

  const isAdmin = membership?.role === 'ADMIN' || membership?.role === 'MANAGER';

  if (!isCreator && !isAssignee && !isAdmin) {
    return res.status(403).json({ error: 'Permission denied' });
  }

  // Build update data
  const updateData = {};
  if (status) updateData.status = status;
  if (priority) updateData.priority = priority;
  if (dueDate) updateData.dueDate = new Date(dueDate);
  if (title) updateData.title = title;
  if (description !== undefined) updateData.description = description;

  // Update task
  const updatedTask = await prisma.task.update({
    where: { id },
    data: updateData,
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
      },
      assignees: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
          }
        }
      }
    }
  });

  res.json({
    success: true,
    task: updatedTask,
    message: 'Görev güncellendi'
  });
}));

module.exports = router;
