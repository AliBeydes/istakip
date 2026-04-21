const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

// JWT Secret (must match auth.js)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Active rooms and participants
const rooms = new Map();

function initializeWebSocket(server) {
  const io = socketIo(server, {
    cors: {
      origin: function(origin, callback) {
        if (!origin) return callback(null, true);
        if (origin.match(/^http:\/\/localhost:\d+$/) || 
            origin.match(/^http:\/\/127\.0\.0\.1:\d+$/)) {
          return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use((socket, next) => {
    try {
      const auth = socket.handshake.auth;
      console.log('🔍 Socket auth - auth:', JSON.stringify(auth));
      
      // Check if guest user
      if (auth.isGuest && auth.userName) {
        socket.userId = auth.userId || auth.email || `guest-${Date.now()}`;
        socket.userName = auth.userName;
        socket.isGuest = true;
        console.log('✅ Guest user authenticated:', socket.userName, 'id:', socket.userId);
        return next();
      }
      
      // Regular user authentication with token
      const token = auth.token;
      console.log('🔍 Socket auth - token:', token ? token.substring(0, 20) + '...' : 'NOT PROVIDED');
      
      if (!token) {
        console.log('❌ No token provided');
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userName = decoded.email || decoded.userId;
      socket.isGuest = false;
      
      console.log('✅ User authenticated:', socket.userId);
      next();
    } catch (err) {
      console.error('❌ Auth error:', err.message);
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.userId);

    // Join meeting room
    socket.on('meeting:join', ({ roomId, userId, userName, isGuest }) => {
      console.log('👤 User joining room:', roomId, 'User:', userId, 'Guest:', isGuest);
      
      socket.join(roomId);
      socket.roomId = roomId;
      socket.userName = userName;

      // Add participant to room
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map());
      }
      
      const room = rooms.get(roomId);
      room.set(socket.userId, {
        userId: socket.userId,
        userName: socket.userName,
        socketId: socket.id,
        joinedAt: new Date(),
        isGuest: isGuest || false,
      });

      // Notify others in room
      socket.to(roomId).emit('meeting:user-joined', {
        userId: socket.userId,
        userName: socket.userName,
        isGuest: isGuest || false,
      });

      // Send current participants to new user
      const participants = Array.from(room.values());
      socket.emit('meeting:participants', { participants });

      console.log('✅ Room participants:', participants.length);
    });

    // Simple-peer signal handler
    socket.on('meeting:signal', ({ roomId, userId, signal }) => {
      console.log('📡 Signal from', socket.userId, 'to', userId);
      
      const targetSocket = findSocketByUserId(io, userId);
      if (targetSocket) {
        targetSocket.emit('meeting:signal', {
          userId: socket.userId,
          signal,
        });
      } else {
        console.log('❌ Target socket not found:', userId);
      }
    });

    // Chat handler
    socket.on('meeting:chat', ({ roomId, ...message }) => {
      console.log('💬 Chat message in room:', roomId);
      socket.to(roomId).emit('meeting:chat', message);
    });

    // WebRTC Offer
    socket.on('webrtc:offer', ({ targetUserId, offer }) => {
      console.log('📨 Offer from', socket.userId, 'to', targetUserId);
      
      const targetSocket = findSocketByUserId(io, targetUserId);
      if (targetSocket) {
        targetSocket.emit('webrtc:offer', {
          userId: socket.userId,
          userName: socket.userName,
          offer,
        });
      }
    });

    // WebRTC Answer
    socket.on('webrtc:answer', ({ targetUserId, answer }) => {
      console.log('📨 Answer from', socket.userId, 'to', targetUserId);
      
      const targetSocket = findSocketByUserId(io, targetUserId);
      if (targetSocket) {
        targetSocket.emit('webrtc:answer', {
          userId: socket.userId,
          answer,
        });
      }
    });

    // ICE Candidate
    socket.on('webrtc:ice-candidate', ({ targetUserId, candidate }) => {
      const targetSocket = findSocketByUserId(io, targetUserId);
      if (targetSocket) {
        targetSocket.emit('webrtc:ice-candidate', {
          userId: socket.userId,
          candidate,
        });
      }
    });

    // Leave meeting
    socket.on('meeting:leave', ({ roomId }) => {
      handleUserLeave(socket, roomId);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('👋 User disconnected:', socket.userId);
      if (socket.roomId) {
        handleUserLeave(socket, socket.roomId);
      }
    });
  });

  // Helper: Find socket by user ID
  function findSocketByUserId(io, userId) {
    const sockets = io.sockets.sockets;
    for (const [socketId, socket] of sockets) {
      if (socket.userId === userId) {
        return socket;
      }
    }
    return null;
  }

  // Helper: Handle user leave
  function handleUserLeave(socket, roomId) {
    socket.leave(roomId);
    
    const room = rooms.get(roomId);
    if (room) {
      room.delete(socket.userId);
      
      // Clean up empty room
      if (room.size === 0) {
        rooms.delete(roomId);
      }
      
      // Notify others
      socket.to(roomId).emit('user:left', {
        userId: socket.userId,
        userName: socket.userName,
      });
    }

    console.log('👤 User left room:', roomId, 'User:', socket.userId);
  }

  return io;
}

module.exports = { initializeWebSocket };
