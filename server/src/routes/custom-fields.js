const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all custom fields for workspace
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { workspaceId } = req.query;
    
    const fields = await prisma.customField.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' }
    });
    
    // Parse options JSON for each field
    const parsedFields = fields.map(field => ({
      ...field,
      options: field.options ? JSON.parse(field.options) : null
    }));
    
    res.json({ fields: parsedFields });
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    res.status(500).json({ error: 'Failed to fetch custom fields' });
  }
});

// Create custom field
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, label, type, options, defaultValue, isRequired, workspaceId } = req.body;
    
    const field = await prisma.customField.create({
      data: {
        name,
        label,
        type,
        options: options ? JSON.stringify(options) : null,
        defaultValue,
        isRequired: isRequired || false,
        workspaceId
      }
    });
    
    res.status(201).json({ field: { ...field, options: options || null } });
  } catch (error) {
    console.error('Error creating custom field:', error);
    res.status(500).json({ error: 'Failed to create custom field' });
  }
});

// Update custom field
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, label, type, options, defaultValue, isRequired } = req.body;
    
    const field = await prisma.customField.update({
      where: { id },
      data: {
        name,
        label,
        type,
        options: options ? JSON.stringify(options) : undefined,
        defaultValue,
        isRequired
      }
    });
    
    res.json({ field: { ...field, options: field.options ? JSON.parse(field.options) : null } });
  } catch (error) {
    console.error('Error updating custom field:', error);
    res.status(500).json({ error: 'Failed to update custom field' });
  }
});

// Delete custom field
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete all values first
    await prisma.customFieldValue.deleteMany({ where: { fieldId: id } });
    
    await prisma.customField.delete({ where: { id } });
    res.json({ message: 'Custom field deleted successfully' });
  } catch (error) {
    console.error('Error deleting custom field:', error);
    res.status(500).json({ error: 'Failed to delete custom field' });
  }
});

// Get custom field values for task
router.get('/task/:taskId', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const values = await prisma.customFieldValue.findMany({
      where: { taskId },
      include: {
        field: true
      }
    });
    
    res.json({ values });
  } catch (error) {
    console.error('Error fetching custom field values:', error);
    res.status(500).json({ error: 'Failed to fetch custom field values' });
  }
});

// Set custom field value for task
router.post('/value', authenticateToken, async (req, res) => {
  try {
    const { fieldId, taskId, value } = req.body;
    
    const fieldValue = await prisma.customFieldValue.upsert({
      where: {
        fieldId_taskId: { fieldId, taskId }
      },
      update: { value },
      create: {
        fieldId,
        taskId,
        value
      },
      include: {
        field: true
      }
    });
    
    res.json({ value: fieldValue });
  } catch (error) {
    console.error('Error setting custom field value:', error);
    res.status(500).json({ error: 'Failed to set custom field value' });
  }
});

// Delete custom field value
router.delete('/value/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.customFieldValue.delete({ where: { id } });
    res.json({ message: 'Custom field value deleted' });
  } catch (error) {
    console.error('Error deleting custom field value:', error);
    res.status(500).json({ error: 'Failed to delete custom field value' });
  }
});

module.exports = router;
