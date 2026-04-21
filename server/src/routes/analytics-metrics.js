const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

// Track metric
router.post('/track', asyncHandler(async (req, res) => {
  const { workspaceId, metric, value } = req.body;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Upsert analytics record
  const analytics = await prisma.analytics.upsert({
    where: {
      workspaceId_date_metric: {
        workspaceId,
        date: today,
        metric
      }
    },
    update: {
      value: { increment: value }
    },
    create: {
      workspaceId,
      date: today,
      metric,
      value
    }
  });

  res.json(analytics);
}));

// Get analytics for workspace
router.get('/workspace/:workspaceId', asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { days = 30 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const analytics = await prisma.analytics.findMany({
    where: {
      workspaceId,
      date: {
        gte: startDate
      }
    },
    orderBy: {
      date: 'asc'
    }
  });

  // Group by metric
  const grouped = analytics.reduce((acc, item) => {
    if (!acc[item.metric]) {
      acc[item.metric] = [];
    }
    acc[item.metric].push({
      date: item.date,
      value: item.value
    });
    return acc;
  }, {});

  res.json(grouped);
}));

// Get daily active users
router.get('/dau/:workspaceId', asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { days = 7 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const dau = await prisma.analytics.findMany({
    where: {
      workspaceId,
      metric: 'daily_active_users',
      date: {
        gte: startDate
      }
    },
    orderBy: {
      date: 'asc'
    }
  });

  res.json(dau);
}));

// Get task creation metrics
router.get('/tasks/:workspaceId', asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { days = 30 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const taskMetrics = await prisma.analytics.findMany({
    where: {
      workspaceId,
      metric: 'tasks_created',
      date: {
        gte: startDate
      }
    },
    orderBy: {
      date: 'asc'
    }
  });

  res.json(taskMetrics);
}));

// Get retention metrics
router.get('/retention/:workspaceId', asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  // Calculate retention rate (users who joined and are still active)
  const totalMembers = await prisma.workspaceMember.count({
    where: { workspaceId }
  });

  const activeMembers = await prisma.workspaceMember.count({
    where: {
      workspaceId,
      user: {
        lastLoginAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    }
  });

  const retentionRate = totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0;

  res.json({
    totalMembers,
    activeMembers,
    retentionRate: retentionRate.toFixed(2)
  });
}));

// Get admin metrics
router.get('/admin/overview', asyncHandler(async (req, res) => {
  const totalUsers = await prisma.user.count();
  const totalWorkspaces = await prisma.workspace.count();
  const totalTasks = await prisma.task.count();
  const totalDocuments = await prisma.document.count();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTasks = await prisma.task.count({
    where: {
      createdAt: {
        gte: today
      }
    }
  });

  const todayUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: today
      }
    }
  });

  res.json({
    totalUsers,
    totalWorkspaces,
    totalTasks,
    totalDocuments,
    todayTasks,
    todayUsers
  });
}));

module.exports = router;
