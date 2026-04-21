const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|md/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
    }
  }
});

// Mock documents data
let mockDocuments = [
  {
    id: '1',
    title: 'Project Requirements',
    content: 'This document contains all the project requirements and specifications...',
    type: 'NOTE',
    filePath: null,
    fileSize: null,
    mimeType: 'text/plain',
    workspaceId: '1',
    creatorId: '1',
    createdAt: new Date('2026-04-01'),
    updatedAt: new Date('2026-04-01'),
    creator: { id: '1', firstName: 'Test', lastName: 'User', avatar: null },
    tags: [{ tag: 'requirements' }, { tag: 'important' }],
    _count: { tasks: 2 }
  },
  {
    id: '2',
    title: 'Meeting Notes - Kickoff',
    content: '# Kickoff Meeting Notes\n\n## Attendees\n- Team members\n- Stakeholders\n\n## Agenda\n1. Project overview\n2. Timeline discussion\n3. Resource allocation\n\n## Action Items\n- [ ] Setup development environment\n- [ ] Create initial wireframes',
    type: 'MEETING_NOTES',
    filePath: null,
    fileSize: null,
    mimeType: 'text/markdown',
    workspaceId: '1',
    creatorId: '1',
    createdAt: new Date('2026-04-03'),
    updatedAt: new Date('2026-04-03'),
    creator: { id: '1', firstName: 'Test', lastName: 'User', avatar: null },
    tags: [{ tag: 'meeting' }, { tag: 'notes' }],
    _count: { tasks: 1 }
  },
  {
    id: '3',
    title: 'Architecture Diagram',
    content: null,
    type: 'FILE',
    filePath: '/uploads/documents/architecture-diagram.png',
    fileSize: 2048576,
    mimeType: 'image/png',
    workspaceId: '1',
    creatorId: '1',
    createdAt: new Date('2026-04-05'),
    updatedAt: new Date('2026-04-05'),
    creator: { id: '1', firstName: 'Test', lastName: 'User', avatar: null },
    tags: [{ tag: 'architecture' }, { tag: 'diagram' }],
    _count: { tasks: 0 }
  }
];

// @route   GET /api/documents
// @desc    Get documents for a workspace
// @access  Private
router.get('/', (req, res) => {
  const { workspaceId, type, search, tags } = req.query;
  
  let filteredDocuments = mockDocuments;
  
  if (workspaceId) {
    filteredDocuments = filteredDocuments.filter(doc => doc.workspaceId === workspaceId);
  }
  
  if (type) {
    filteredDocuments = filteredDocuments.filter(doc => doc.type === type);
  }
  
  if (search) {
    filteredDocuments = filteredDocuments.filter(doc => 
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      (doc.content && doc.content.toLowerCase().includes(search.toLowerCase()))
    );
  }
  
  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    filteredDocuments = filteredDocuments.filter(doc =>
      doc.tags.some(docTag => tagArray.includes(docTag.tag))
    );
  }
  
  res.json({
    documents: filteredDocuments
  });
});

// @route   POST /api/documents
// @desc    Create a new document (file upload or text)
// @access  Private
router.post('/', upload.single('file'), (req, res) => {
  const { title, content, type, workspaceId, tags } = req.body;
  
  if (!title || !workspaceId) {
    return res.status(400).json({
      error: 'Title and workspaceId are required'
    });
  }
  
  let documentType = type || 'NOTE';
  let filePath = null;
  let fileSize = null;
  let mimeType = null;
  
  // Handle file upload
  if (req.file) {
    documentType = 'FILE';
    filePath = `/uploads/documents/${req.file.filename}`;
    fileSize = req.file.size;
    mimeType = req.file.mimetype;
  }
  
  const newDocument = {
    id: Date.now().toString(),
    title,
    content: content || '',
    type: documentType,
    filePath,
    fileSize,
    mimeType,
    workspaceId,
    creatorId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: { id: '1', firstName: 'Test', lastName: 'User', avatar: null },
    tags: tags ? (Array.isArray(tags) ? tags.map(tag => ({ tag })) : [{ tag: tags }]) : [],
    _count: { tasks: 0 }
  };
  
  mockDocuments.push(newDocument);
  
  res.status(201).json({
    message: 'Document created successfully',
    document: newDocument
  });
});

// @route   GET /api/documents/:id
// @desc    Get a single document
// @access  Private
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  const document = mockDocuments.find(doc => doc.id === id);
  
  if (!document) {
    return res.status(404).json({
      error: 'Document not found'
    });
  }
  
  res.json({
    document
  });
});

// @route   PUT /api/documents/:id
// @desc    Update a document
// @access  Private
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, content, tags } = req.body;
  
  const documentIndex = mockDocuments.findIndex(doc => doc.id === id);
  
  if (documentIndex === -1) {
    return res.status(404).json({
      error: 'Document not found'
    });
  }
  
  const updatedDocument = {
    ...mockDocuments[documentIndex],
    ...(title && { title }),
    ...(content !== undefined && { content }),
    ...(tags && { tags: Array.isArray(tags) ? tags.map(tag => ({ tag })) : [{ tag: tags }] }),
    updatedAt: new Date()
  };
  
  mockDocuments[documentIndex] = updatedDocument;
  
  res.json({
    message: 'Document updated successfully',
    document: updatedDocument
  });
});

// @route   DELETE /api/documents/:id
// @desc    Delete a document
// @access  Private
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  const documentIndex = mockDocuments.findIndex(doc => doc.id === id);
  
  if (documentIndex === -1) {
    return res.status(404).json({
      error: 'Document not found'
    });
  }
  
  const document = mockDocuments[documentIndex];
  
  // Delete file if exists
  if (document.filePath) {
    const fullPath = path.join(__dirname, '../../', document.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
  
  mockDocuments.splice(documentIndex, 1);
  
  res.json({
    message: 'Document deleted successfully'
  });
});

// @route   GET /api/documents/:id/download
// @desc    Download a document file
// @access  Private
router.get('/:id/download', (req, res) => {
  const { id } = req.params;
  
  const document = mockDocuments.find(doc => doc.id === id);
  
  if (!document) {
    return res.status(404).json({
      error: 'Document not found'
    });
  }
  
  if (!document.filePath) {
    return res.status(400).json({
      error: 'This document has no file to download'
    });
  }
  
  const fullPath = path.join(__dirname, '../../', document.filePath);
  
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({
      error: 'File not found'
    });
  }
  
  res.download(fullPath, document.title + path.extname(fullPath));
});

module.exports = router;
