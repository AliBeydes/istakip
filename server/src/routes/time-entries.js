const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all time entries for workspace
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { workspaceId, taskId, userId } = req.query;
    
    const where = { workspaceId };
    if (taskId) where.taskId = taskId;
    if (userId) where.userId = userId;
    
    const entries = await prisma.timeEntry.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        task: { select: { id: true, title: true } }
      },
      orderBy: { startTime: 'desc' }
    });
    
    res.json({ entries });
  } catch (error) {
    console.error('Error fetching time entries:', error);
    res.status(500).json({ error: 'Failed to fetch time entries' });
  }
});

// Create time entry
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { taskId, startTime, endTime, duration, description, workspaceId } = req.body;
    
    const entry = await prisma.timeEntry.create({
      data: {
        taskId,
        userId: req.user.id,
        workspaceId,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        duration,
        description
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        task: { select: { id: true, title: true } }
      }
    });
    
    res.status(201).json({ entry });
  } catch (error) {
    console.error('Error creating time entry:', error);
    res.status(500).json({ error: 'Failed to create time entry' });
  }
});

// Update time entry
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { endTime, duration, description } = req.body;
    
    const entry = await prisma.timeEntry.update({
      where: { id },
      data: {
        endTime: endTime ? new Date(endTime) : undefined,
        duration,
        description
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        task: { select: { id: true, title: true } }
      }
    });
    
    res.json({ entry });
  } catch (error) {
    console.error('Error updating time entry:', error);
    res.status(500).json({ error: 'Failed to update time entry' });
  }
});

// Delete time entry
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.timeEntry.delete({ where: { id } });
    res.json({ message: 'Time entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting time entry:', error);
    res.status(500).json({ error: 'Failed to delete time entry' });
  }
});

// Get time tracking summary
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const { workspaceId, userId, startDate, endDate } = req.query;
    
    const where = { workspaceId };
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate);
      if (endDate) where.startTime.lte = new Date(endDate);
    }
    
    const entries = await prisma.timeEntry.findMany({ where });
    
    const totalDuration = entries.reduce((sum, e) => sum + (e.duration || 0), 0);
    const billableDuration = entries.filter(e => e.isBillable).reduce((sum, e) => sum + (e.duration || 0), 0);
    
    res.json({
      summary: {
        totalEntries: entries.length,
        totalDuration,
        billableDuration,
        averageDuration: entries.length > 0 ? totalDuration / entries.length : 0
      }
    });
  } catch (error) {
    console.error('Error fetching time summary:', error);
    res.status(500).json({ error: 'Failed to fetch time summary' });
  }
});

module.exports = router;
