const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const webrtcHandler = require('./webrtc-handler.js');

// Store connected users
const connectedUsers = new Map();

// Notification types
const NOTIFICATION_TYPES = {
  TASK_CREATED: 'TASK_CREATED',
  TASK_UPDATED: 'TASK_UPDATED',
  TASK_COMPLETED: 'TASK_COMPLETED',
  MEETING_INVITATION: 'MEETING_INVITATION',
  MEETING_REMINDER: 'MEETING_REMINDER',
  MEETING_STARTED: 'MEETING_STARTED',
  DOCUMENT_SHARED: 'DOCUMENT_SHARED',
  COMMENT_ADDED: 'COMMENT_ADDED',
  USER_JOINED: 'USER_JOINED',
  USER_LEFT: 'USER_LEFT',
  SYSTEM: 'SYSTEM'
};

// Initialize WebSocket server
function initializeWebSocket(server) {
  const io = socketIo(server, {
    cors: {
      origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        // Allow all localhost origins
        if (origin.match(/^http:\/\/localhost:\d+$/) || 
            origin.match(/^http:\/\/127\.0\.0\.1:\d+$/)) {
          return callback(null, true);
        }
        
        callback(new Error('Not allowed by CORS'));
      },
      methods: ['GET', 'POST', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin']
    }
  });

  // Initialize WebRTC handler
  webrtcHandler(io);

  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    console.log('🔍 Socket auth attempt:');
    console.log('   Token received:', token ? `YES (${token.substring(0, 20)}...)` : 'NO');
    
    if (!token) {
      console.error('❌ No token provided');
      return next(new Error('Authentication required'));
    }

    try {
      // Verify JWT token (must match auth.js secret)
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
      console.log('   JWT_SECRET used:', JWT_SECRET.substring(0, 10) + '...');
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ Token verified. UserId:', decoded.userId);
      socket.userId = decoded.userId;
      socket.workspaceId = decoded.workspaceId || '1';
      next();
    } catch (err) {
      console.error('❌ Token verification failed:', err.message);
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.userId} (Socket: ${socket.id})`);
    
    // Store connected user
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      userId: socket.userId,
      workspaceId: socket.workspaceId,
      connectedAt: new Date()
    });

    // Join workspace room
    socket.join(`workspace:${socket.workspaceId}`);
    
    // Join personal room
    socket.join(`user:${socket.userId}`);

    // Broadcast user joined
    socket.to(`workspace:${socket.workspaceId}`).emit('user:joined', {
      userId: socket.userId,
      timestamp: new Date().toISOString()
    });

    // Send online users list
    const onlineUsers = Array.from(connectedUsers.values())
      .filter(u => u.workspaceId === socket.workspaceId)
      .map(u => ({ userId: u.userId, connectedAt: u.connectedAt }));
    
    socket.emit('users:online', onlineUsers);

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`🔌 User disconnected: ${socket.userId} (${reason})`);
      
      connectedUsers.delete(socket.userId);
      
      socket.to(`workspace:${socket.workspaceId}`).emit('user:left', {
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });
    });

    // Handle typing indicator
    socket.on('typing:start', (data) => {
      socket.to(`workspace:${socket.workspaceId}`).emit('typing:start', {
        userId: socket.userId,
        ...data
      });
    });

    socket.on('typing:stop', (data) => {
      socket.to(`workspace:${socket.workspaceId}`).emit('typing:stop', {
        userId: socket.userId,
        ...data
      });
    });

    // Handle chat messages
    socket.on('message:send', (data) => {
      const message = {
        id: `msg_${Date.now()}`,
        senderId: socket.userId,
        content: data.content,
        timestamp: new Date().toISOString(),
        type: data.type || 'text',
        ...data.metadata
      };

      // Broadcast to workspace
      io.to(`workspace:${socket.workspaceId}`).emit('message:received', message);
    });

    // Handle task updates
    socket.on('task:update', (data) => {
      const notification = {
        type: NOTIFICATION_TYPES.TASK_UPDATED,
        title: 'Task Updated',
        message: `Task "${data.title}" was updated`,
        data: data,
        timestamp: new Date().toISOString(),
        senderId: socket.userId
      };

      // Notify task assignees
      if (data.assigneeIds) {
        data.assigneeIds.forEach(assigneeId => {
          io.to(`user:${assigneeId}`).emit('notification:received', notification);
        });
      }

      // Broadcast to workspace
      socket.to(`workspace:${socket.workspaceId}`).emit('task:updated', data);
    });

    // Handle meeting updates
    socket.on('meeting:update', (data) => {
      const notification = {
        type: NOTIFICATION_TYPES.MEETING_INVITATION,
        title: 'Meeting Update',
        message: `Meeting "${data.title}" was updated`,
        data: data,
        timestamp: new Date().toISOString(),
        senderId: socket.userId
      };

      // Notify participants
      if (data.participants) {
        data.participants.forEach(participant => {
          io.to(`user:${participant.userId}`).emit('notification:received', notification);
        });
      }

      // Broadcast to workspace
      socket.to(`workspace:${socket.workspaceId}`).emit('meeting:updated', data);
    });

    // Handle document updates
    socket.on('document:update', (data) => {
      const notification = {
        type: NOTIFICATION_TYPES.DOCUMENT_SHARED,
        title: 'Document Update',
        message: `Document "${data.title}" was updated`,
        data: data,
        timestamp: new Date().toISOString(),
        senderId: socket.userId
      };

      // Broadcast to workspace
      socket.to(`workspace:${socket.workspaceId}`).emit('document:updated', data);
      socket.to(`workspace:${socket.workspaceId}`).emit('notification:received', notification);
    });

    // Handle notification acknowledgment
    socket.on('notification:ack', (notificationId) => {
      socket.emit('notification:acknowledged', { notificationId });
    });

    // Handle subscribe to specific events
    socket.on('subscribe', (events) => {
      events.forEach(event => {
        socket.join(`event:${event}`);
      });
    });

    socket.on('unsubscribe', (events) => {
      events.forEach(event => {
        socket.leave(`event:${event}`);
      });
    });
  });

  return io;
}

// Helper functions for sending notifications
function sendNotificationToUser(io, userId, notification) {
  io.to(`user:${userId}`).emit('notification:received', {
    ...notification,
    id: `notif_${Date.now()}`,
    timestamp: new Date().toISOString(),
    read: false
  });
}

function sendNotificationToWorkspace(io, workspaceId, notification) {
  io.to(`workspace:${workspaceId}`).emit('notification:received', {
    ...notification,
    id: `notif_${Date.now()}`,
    timestamp: new Date().toISOString(),
    read: false
  });
}

function broadcastToWorkspace(io, workspaceId, event, data) {
  io.to(`workspace:${workspaceId}`).emit(event, {
    ...data,
    timestamp: new Date().toISOString()
  });
}

function getOnlineUsers(workspaceId) {
  return Array.from(connectedUsers.values())
    .filter(u => u.workspaceId === workspaceId)
    .map(u => ({ userId: u.userId, connectedAt: u.connectedAt }));
}

module.exports = {
  initializeWebSocket,
  sendNotificationToUser,
  sendNotificationToWorkspace,
  broadcastToWorkspace,
  getOnlineUsers,
  NOTIFICATION_TYPES,
  connectedUsers
};
