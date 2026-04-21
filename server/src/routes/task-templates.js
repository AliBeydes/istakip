const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all task templates for workspace
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { workspaceId } = req.query;
    
    const templates = await prisma.taskTemplate.findMany({
      where: { workspaceId, isActive: true },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ templates });
  } catch (error) {
    console.error('Error fetching task templates:', error);
    res.status(500).json({ error: 'Failed to fetch task templates' });
  }
});

// Create task template
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name, description, defaultTitle, defaultDescription,
      defaultPriority, defaultStatus, estimatedHours, tags, checklist, workspaceId
    } = req.body;
    
    const template = await prisma.taskTemplate.create({
      data: {
        name,
        description,
        defaultTitle,
        defaultDescription,
        defaultPriority: defaultPriority || 'MEDIUM',
        defaultStatus: defaultStatus || 'TODO',
        estimatedHours,
        workspaceId,
        creatorId: req.user.id,
        tags: tags ? JSON.stringify(tags) : null,
        checklist: checklist ? JSON.stringify(checklist) : null
      },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true } }
      }
    });
    
    res.status(201).json({ template });
  } catch (error) {
    console.error('Error creating task template:', error);
    res.status(500).json({ error: 'Failed to create task template' });
  }
});

// Update task template
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, description, defaultTitle, defaultDescription,
      defaultPriority, defaultStatus, estimatedHours, tags, checklist, isActive
    } = req.body;
    
    const template = await prisma.taskTemplate.update({
      where: { id },
      data: {
        name,
        description,
        defaultTitle,
        defaultDescription,
        defaultPriority,
        defaultStatus,
        estimatedHours,
        isActive,
        tags: tags ? JSON.stringify(tags) : undefined,
        checklist: checklist ? JSON.stringify(checklist) : undefined
      },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true } }
      }
    });
    
    res.json({ template });
  } catch (error) {
    console.error('Error updating task template:', error);
    res.status(500).json({ error: 'Failed to update task template' });
  }
});

// Delete task template
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.taskTemplate.delete({ where: { id } });
    res.json({ message: 'Task template deleted successfully' });
  } catch (error) {
    console.error('Error deleting task template:', error);
    res.status(500).json({ error: 'Failed to delete task template' });
  }
});

// Create task from template
router.post('/:id/create-task', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { workspaceId, groupId, title, description, dueDate } = req.body;
    
    const template = await prisma.taskTemplate.findUnique({ where: { id } });
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const task = await prisma.task.create({
      data: {
        title: title || template.defaultTitle || template.name,
        description: description || template.defaultDescription || template.description,
        priority: template.defaultPriority,
        status: template.defaultStatus,
        dueDate: dueDate ? new Date(dueDate) : null,
        workspaceId,
        groupId,
        creatorId: req.user.id
      }
    });
    
    // Add tags from template
    if (template.tags) {
      const tags = JSON.parse(template.tags);
      for (const tag of tags) {
        await prisma.taskTag.create({
          data: { taskId: task.id, tag }
        });
      }
    }
    
    res.status(201).json({ task });
  } catch (error) {
    console.error('Error creating task from template:', error);
    res.status(500).json({ error: 'Failed to create task from template' });
  }
});

module.exports = router;
