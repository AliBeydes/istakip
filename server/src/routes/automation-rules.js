const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all automation rules for workspace
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { workspaceId } = req.query;
    
    const rules = await prisma.automationRule.findMany({
      where: { workspaceId },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ rules });
  } catch (error) {
    console.error('Error fetching automation rules:', error);
    res.status(500).json({ error: 'Failed to fetch automation rules' });
  }
});

// Create automation rule
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, trigger, condition, action, actionData, workspaceId } = req.body;
    
    const rule = await prisma.automationRule.create({
      data: {
        name,
        description,
        trigger,
        condition: condition ? JSON.stringify(condition) : null,
        action,
        actionData: actionData ? JSON.stringify(actionData) : null,
        workspaceId,
        creatorId: req.user.id,
        isActive: true
      },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true } }
      }
    });
    
    res.status(201).json({ rule });
  } catch (error) {
    console.error('Error creating automation rule:', error);
    res.status(500).json({ error: 'Failed to create automation rule' });
  }
});

// Update automation rule
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, trigger, condition, action, actionData, isActive } = req.body;
    
    const rule = await prisma.automationRule.update({
      where: { id },
      data: {
        name,
        description,
        trigger,
        condition: condition ? JSON.stringify(condition) : undefined,
        action,
        actionData: actionData ? JSON.stringify(actionData) : undefined,
        isActive
      },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true } }
      }
    });
    
    res.json({ rule });
  } catch (error) {
    console.error('Error updating automation rule:', error);
    res.status(500).json({ error: 'Failed to update automation rule' });
  }
});

// Delete automation rule
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.automationRule.delete({ where: { id } });
    res.json({ message: 'Automation rule deleted successfully' });
  } catch (error) {
    console.error('Error deleting automation rule:', error);
    res.status(500).json({ error: 'Failed to delete automation rule' });
  }
});

// Execute automation rule manually
router.post('/:id/execute', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { taskId } = req.body;
    
    const rule = await prisma.automationRule.findUnique({
      where: { id },
      include: { workspace: true }
    });
    
    if (!rule || !rule.isActive) {
      return res.status(404).json({ error: 'Rule not found or inactive' });
    }
    
    // Execute action based on rule type
    const actionData = JSON.parse(rule.actionData || '{}');
    let result = null;
    
    switch (rule.action) {
      case 'UPDATE_STATUS':
        result = await prisma.task.update({
          where: { id: taskId },
          data: { status: actionData.status }
        });
        break;
      case 'ASSIGN_USER':
        // Create task assignment
        await prisma.taskAssignment.create({
          data: { taskId, userId: actionData.userId }
        });
        result = await prisma.task.findUnique({ where: { id: taskId } });
        break;
      case 'SEND_NOTIFICATION':
        result = { message: 'Notification would be sent' };
        break;
      default:
        return res.status(400).json({ error: 'Unknown action type' });
    }
    
    res.json({ result, executed: true });
  } catch (error) {
    console.error('Error executing automation rule:', error);
    res.status(500).json({ error: 'Failed to execute automation rule' });
  }
});

module.exports = router;
