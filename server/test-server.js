const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const meetingRoutes = require('./src/routes/meetings-api.js');
const emailRoutes = require('./src/routes/emails-api.js');
const participantRoutes = require('./src/routes/participants-api.js');
const analyticsRoutes = require('./src/routes/analytics-api.js');
const schedulerRoutes = require('./src/routes/scheduler-api.js');
const { initializeWebSocket } = require('./src/websocket/socket-handler.js');

const app = express();
const PORT = 3010;

// Mock users with different roles for testing
const mockUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Ali',
    lastName: 'Yönetici',
    role: 'ADMIN',
    avatar: null,
    isActive: true
  },
  {
    id: '2',
    email: 'manager@example.com',
    password: 'manager123',
    firstName: 'Ayşe',
    lastName: 'Moderatör',
    role: 'MANAGER',
    avatar: null,
    isActive: true
  },
  {
    id: '3',
    email: 'member@example.com',
    password: 'member123',
    firstName: 'Mehmet',
    lastName: 'Üye',
    role: 'MEMBER',
    avatar: null,
    isActive: true
  },
  {
    id: '4',
    email: 'test@example.com',
    password: 'test123',
    firstName: 'Test',
    lastName: 'Kullanıcı',
    role: 'MEMBER',
    avatar: null,
    isActive: true
  }
];

// Workspace memberships (mock)
const workspaceMemberships = {
  '1': [ // workspaceId: 1
    { userId: '1', role: 'ADMIN', joinedAt: '2024-01-01' },
    { userId: '2', role: 'MANAGER', joinedAt: '2024-01-15' },
    { userId: '3', role: 'MEMBER', joinedAt: '2024-02-01' },
    { userId: '4', role: 'MEMBER', joinedAt: '2024-02-15' }
  ]
};

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3010'],
  credentials: true
}));
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads/documents');
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

// Serve static files
app.use('/uploads', express.static('uploads'));

// Mock data
let mockTasks = [
  {
    id: '1',
    title: 'Setup project structure',
    description: 'Create initial project files and folders',
    status: 'DONE',
    priority: 'HIGH',
    dueDate: new Date('2026-04-10'),
    workspaceId: '1',
    groupId: null,
    creatorId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    assignees: [{ id: '1', firstName: 'Test', lastName: 'User', avatar: null }],
    tags: [{ tag: 'setup' }, { tag: 'important' }],
    commentCount: 2,
    documentCount: 1
  },
  {
    id: '2',
    title: 'Design database schema',
    description: 'Create Prisma schema for all entities',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    dueDate: new Date('2026-04-12'),
    workspaceId: '1',
    groupId: null,
    creatorId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    assignees: [{ id: '1', firstName: 'Test', lastName: 'User', avatar: null }],
    tags: [{ tag: 'database' }, { tag: 'backend' }],
    commentCount: 0,
    documentCount: 0
  },
  {
    id: '3',
    title: 'Implement authentication',
    description: 'Setup JWT authentication system',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: new Date('2026-04-15'),
    workspaceId: '1',
    groupId: null,
    creatorId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    assignees: [{ id: '1', firstName: 'Test', lastName: 'User', avatar: null }],
    tags: [{ tag: 'auth' }, { tag: 'security' }],
    commentCount: 0,
    documentCount: 0
  }
];

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
  }
];

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Simple auth routes for testing
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Find user in mock database
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Get user's workspace role
    const membership = workspaceMemberships['1'].find(m => m.userId === user.id);
    const workspaceRole = membership ? membership.role : 'MEMBER';
    
    const mockUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: workspaceRole, // Workspace role for permission checks
      avatar: user.avatar,
      isActive: user.isActive,
      workspaceId: '1',
      lastLoginAt: new Date()
    };
    
    // Set cookie
    res.cookie('token', 'mock-jwt-token', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.json({
      message: 'Login successful',
      user: mockUser,
      token: 'mock-jwt-token'
    });
  } else {
    res.status(401).json({
      error: 'Invalid credentials',
      message: 'Email veya şifre hatalı'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  if (email && password && firstName && lastName) {
    const mockUser = {
      id: '1',
      email: email,
      firstName: firstName,
      lastName: lastName,
      avatar: null,
      isActive: true,
      createdAt: new Date()
    };
    
    res.cookie('token', 'mock-jwt-token', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.status(201).json({
      message: 'User registered successfully',
      user: mockUser,
      token: 'mock-jwt-token'
    });
  } else {
    res.status(400).json({
      error: 'All fields required'
    });
  }
});

app.get('/api/auth/me', (req, res) => {
  const token = req.cookies.token;
  
  if (token) {
    res.json({
      user: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        avatar: null,
        isActive: true
      }
    });
  } else {
    res.status(401).json({
      error: 'No token found'
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({
    message: 'Logout successful'
  });
});

// Task routes
app.get('/api/tasks', (req, res) => {
  const { workspaceId, status, priority, assigneeId, search } = req.query;
  
  let filteredTasks = mockTasks;
  
  if (workspaceId) {
    filteredTasks = filteredTasks.filter(task => task.workspaceId === workspaceId);
  }
  
  if (status) {
    filteredTasks = filteredTasks.filter(task => task.status === status);
  }
  
  if (priority) {
    filteredTasks = filteredTasks.filter(task => task.priority === priority);
  }
  
  if (search) {
    filteredTasks = filteredTasks.filter(task => 
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  res.json({
    tasks: filteredTasks
  });
});

app.post('/api/tasks', (req, res) => {
  const { title, description, status = 'TODO', priority = 'MEDIUM', dueDate, workspaceId, groupId, assigneeIds, tags } = req.body;
  
  if (!title || !workspaceId) {
    return res.status(400).json({
      error: 'Title and workspaceId are required'
    });
  }
  
  const newTask = {
    id: Date.now().toString(),
    title,
    description: description || '',
    status,
    priority,
    dueDate: dueDate ? new Date(dueDate) : null,
    workspaceId,
    groupId: groupId || null,
    creatorId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    assignees: [{ id: '1', firstName: 'Test', lastName: 'User', avatar: null }],
    tags: tags ? tags.map(tag => ({ tag })) : [],
    commentCount: 0,
    documentCount: 0
  };
  
  mockTasks.push(newTask);
  
  res.status(201).json({
    message: 'Task created successfully',
    task: newTask
  });
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, dueDate, groupId } = req.body;
  
  const taskIndex = mockTasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({
      error: 'Task not found'
    });
  }
  
  const updatedTask = {
    ...mockTasks[taskIndex],
    ...(title && { title }),
    ...(description !== undefined && { description }),
    ...(status && { status }),
    ...(priority && { priority }),
    ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
    ...(groupId !== undefined && { groupId }),
    updatedAt: new Date()
  };
  
  mockTasks[taskIndex] = updatedTask;
  
  res.json({
    message: 'Task updated successfully',
    task: updatedTask
  });
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  
  const taskIndex = mockTasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({
      error: 'Task not found'
    });
  }
  
  mockTasks.splice(taskIndex, 1);
  
  res.json({
    message: 'Task deleted successfully'
  });
});

// Document routes
app.get('/api/documents', (req, res) => {
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

app.post('/api/documents', upload.single('file'), (req, res) => {
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

app.get('/api/documents/:id', (req, res) => {
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

app.put('/api/documents/:id', (req, res) => {
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

app.delete('/api/documents/:id', (req, res) => {
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
    const fullPath = path.join(__dirname, document.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
  
  mockDocuments.splice(documentIndex, 1);
  
  res.json({
    message: 'Document deleted successfully'
  });
});

// Email routes
app.use('/api/emails', emailRoutes);

// Meeting routes  
app.use('/api/meetings', meetingRoutes);

// Participant routes
app.use('/api/participants', participantRoutes);

// Analytics routes
app.use('/api/analytics', analyticsRoutes);

// Scheduler routes
app.use('/api/scheduler', schedulerRoutes);

// Users routes - Workspace user management
app.get('/api/users/workspace/:workspaceId', (req, res) => {
  const { workspaceId } = req.params;
  
  const members = workspaceMemberships[workspaceId] || [];
  const users = members.map(member => {
    const user = mockUsers.find(u => u.id === member.userId);
    return {
      ...user,
      role: member.role,
      joinedAt: member.joinedAt
    };
  });
  
  res.json({ users });
});

app.post('/api/users/workspace/:workspaceId/invite', (req, res) => {
  const { workspaceId } = req.params;
  const { email, role = 'MEMBER' } = req.body;
  
  // Check if user exists
  const user = mockUsers.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Check if already member
  const existing = workspaceMemberships[workspaceId]?.find(m => m.userId === user.id);
  if (existing) {
    return res.status(400).json({ error: 'User already a member' });
  }
  
  // Add to workspace
  if (!workspaceMemberships[workspaceId]) {
    workspaceMemberships[workspaceId] = [];
  }
  
  workspaceMemberships[workspaceId].push({
    userId: user.id,
    role,
    joinedAt: new Date().toISOString()
  });
  
  res.status(201).json({
    message: 'User invited successfully',
    membership: {
      user,
      role,
      joinedAt: new Date().toISOString()
    }
  });
});

app.put('/api/users/workspace/:workspaceId/:userId/role', (req, res) => {
  const { workspaceId, userId } = req.params;
  const { role } = req.body;
  
  console.log('🔄 Role Update Request:', { workspaceId, userId, role, body: req.body });
  
  const member = workspaceMemberships[workspaceId]?.find(m => m.userId === userId);
  
  if (!member) {
    console.log('❌ Member not found');
    return res.status(404).json({ error: 'Member not found' });
  }
  
  // Update the role
  member.role = role;
  
  const updatedMembership = {
    ...member,
    user: mockUsers.find(u => u.id === userId)
  };
  
  console.log('✅ Role updated:', updatedMembership);
  
  res.json({
    message: 'Role updated successfully',
    membership: updatedMembership
  });
});

app.delete('/api/users/workspace/:workspaceId/:userId', (req, res) => {
  const { workspaceId, userId } = req.params;
  
  if (!workspaceMemberships[workspaceId]) {
    return res.status(404).json({ error: 'Workspace not found' });
  }
  
  workspaceMemberships[workspaceId] = workspaceMemberships[workspaceId].filter(
    m => m.userId !== userId
  );
  
  res.json({ message: 'User removed from workspace successfully' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket
const io = initializeWebSocket(server);

// Store io instance globally for use in routes
global.io = io;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints ready`);
  console.log(`📋 Task endpoints ready`);
  console.log(`📄 Document endpoints ready`);
  console.log(`📅 Meeting endpoints ready`);
  console.log(`📧 Email endpoints ready`);
  console.log(`📊 Analytics endpoints ready`);
  console.log(`🔌 WebSocket ready (Socket.IO)`);
});

module.exports = { app, server, io };
