const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all notes for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: {
        OR: [
          { authorId: req.user.id },
          { shares: { some: { userId: req.user.id } } }
        ]
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        },
        tags: true,
        folder: true
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json({ notes });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Create note
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content, folderId, tags, color, isPinned, isArchived } = req.body;
    
    const note = await prisma.note.create({
      data: {
        title: title || 'Untitled',
        content: content || '',
        authorId: req.user.id,
        folderId: folderId || null,
        color: color || 'default',
        isPinned: isPinned || false,
        isArchived: isArchived || false,
        tags: {
          connectOrCreate: tags?.map(tag => ({
            where: { name: tag },
            create: { name: tag }
          })) || []
        }
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        },
        tags: true,
        folder: true
      }
    });
    
    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update note
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, folderId, tags, color, isPinned, isArchived } = req.body;
    
    // Check ownership
    const existing = await prisma.note.findFirst({
      where: { id, authorId: req.user.id }
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    const note = await prisma.note.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        content: content !== undefined ? content : undefined,
        folderId: folderId !== undefined ? folderId : undefined,
        color: color !== undefined ? color : undefined,
        isPinned: isPinned !== undefined ? isPinned : undefined,
        isArchived: isArchived !== undefined ? isArchived : undefined,
        tags: tags ? {
          set: [],
          connectOrCreate: tags.map(tag => ({
            where: { name: tag },
            create: { name: tag }
          }))
        } : undefined
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        },
        tags: true,
        folder: true
      }
    });
    
    res.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check ownership
    const existing = await prisma.note.findFirst({
      where: { id, authorId: req.user.id }
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    await prisma.note.delete({ where: { id } });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Get folders
router.get('/folders', authenticateToken, async (req, res) => {
  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
      include: {
        _count: { select: { notes: true } }
      }
    });
    res.json(folders);
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

// Create folder
router.post('/folders', authenticateToken, async (req, res) => {
  try {
    const { name, color } = req.body;
    
    const folder = await prisma.folder.create({
      data: {
        name,
        color: color || 'blue',
        userId: req.user.id
      }
    });
    
    res.status(201).json(folder);
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

module.exports = router;
