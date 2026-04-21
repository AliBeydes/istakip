const socketHandler = (io) => {
  const rooms = new Map(); // roomId -> { users: Map, host: socketId }
  const activeCalls = new Map(); // callId -> { from, to, roomId, status }

  io.on('connection', (socket) => {
    console.log(`📞 User connected for WebRTC: ${socket.id}`);

    // Join video call room
    socket.on('call:join', ({ roomId, userId, userName, isVideo = true }) => {
      console.log(`📞 User ${userName} (${userId}) joining room ${roomId}`);
      
      socket.join(roomId);
      socket.userId = userId;
      socket.userName = userName;
      socket.roomId = roomId;

      // Create or get room
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          users: new Map(),
          host: socket.id,
          isVideo,
          createdAt: Date.now()
        });
      }

      const room = rooms.get(roomId);
      room.users.set(socket.id, {
        id: socket.id,
        userId,
        userName,
        isVideo,
        joinedAt: Date.now()
      });

      // Notify other users in room
      socket.to(roomId).emit('call:user-joined', {
        userId,
        userName,
        socketId: socket.id,
        isVideo,
        participants: Array.from(room.users.values())
      });

      // Send existing participants to new user
      const existingUsers = Array.from(room.users.values())
        .filter(u => u.id !== socket.id);
      
      socket.emit('call:existing-participants', {
        participants: existingUsers,
        isHost: room.host === socket.id
      });

      console.log(`📞 Room ${roomId} now has ${room.users.size} participants`);
    });

    // WebRTC Signaling - Offer
    socket.on('call:offer', ({ to, offer }) => {
      console.log(`📤 Sending offer from ${socket.id} to ${to}`);
      io.to(to).emit('call:offer', {
        from: socket.id,
        offer,
        userName: socket.userName,
        userId: socket.userId
      });
    });

    // WebRTC Signaling - Answer
    socket.on('call:answer', ({ to, answer }) => {
      console.log(`📤 Sending answer from ${socket.id} to ${to}`);
      io.to(to).emit('call:answer', {
        from: socket.id,
        answer,
        userName: socket.userName,
        userId: socket.userId
      });
    });

    // WebRTC Signaling - ICE Candidate
    socket.on('call:ice-candidate', ({ to, candidate }) => {
      io.to(to).emit('call:ice-candidate', {
        from: socket.id,
        candidate
      });
    });

    // Toggle video
    socket.on('call:toggle-video', ({ isVideoEnabled }) => {
      const roomId = socket.roomId;
      if (!roomId) return;

      const room = rooms.get(roomId);
      if (room && room.users.has(socket.id)) {
        room.users.get(socket.id).isVideo = isVideoEnabled;
      }

      socket.to(roomId).emit('call:video-toggled', {
        socketId: socket.id,
        userId: socket.userId,
        isVideoEnabled
      });
    });

    // Toggle audio
    socket.on('call:toggle-audio', ({ isAudioEnabled }) => {
      const roomId = socket.roomId;
      if (!roomId) return;

      socket.to(roomId).emit('call:audio-toggled', {
        socketId: socket.id,
        userId: socket.userId,
        isAudioEnabled
      });
    });

    // Screen sharing started
    socket.on('call:screen-share-started', () => {
      const roomId = socket.roomId;
      if (!roomId) return;

      socket.to(roomId).emit('call:screen-share-started', {
        socketId: socket.id,
        userId: socket.userId,
        userName: socket.userName
      });
    });

    // Screen sharing stopped
    socket.on('call:screen-share-stopped', () => {
      const roomId = socket.roomId;
      if (!roomId) return;

      socket.to(roomId).emit('call:screen-share-stopped', {
        socketId: socket.id,
        userId: socket.userId
      });
    });

    // Chat message during call
    socket.on('call:message', ({ message, type = 'text' }) => {
      const roomId = socket.roomId;
      if (!roomId) return;

      const messageData = {
        id: `msg_${Date.now()}`,
        userId: socket.userId,
        userName: socket.userName,
        message,
        type,
        timestamp: new Date().toISOString()
      };

      io.to(roomId).emit('call:message', messageData);
    });

    // Raise hand
    socket.on('call:raise-hand', () => {
      const roomId = socket.roomId;
      if (!roomId) return;

      socket.to(roomId).emit('call:hand-raised', {
        socketId: socket.id,
        userId: socket.userId,
        userName: socket.userName
      });
    });

    // Lower hand
    socket.on('call:lower-hand', () => {
      const roomId = socket.roomId;
      if (!roomId) return;

      socket.to(roomId).emit('call:hand-lowered', {
        socketId: socket.id,
        userId: socket.userId
      });
    });

    // Mute participant (host only)
    socket.on('call:mute-participant', ({ targetSocketId }) => {
      const roomId = socket.roomId;
      if (!roomId) return;

      const room = rooms.get(roomId);
      if (room && room.host === socket.id) {
        io.to(targetSocketId).emit('call:muted-by-host');
      }
    });

    // Remove participant (host only)
    socket.on('call:remove-participant', ({ targetSocketId }) => {
      const roomId = socket.roomId;
      if (!roomId) return;

      const room = rooms.get(roomId);
      if (room && room.host === socket.id) {
        io.to(targetSocketId).emit('call:removed-by-host');
      }
    });

    // Leave call
    socket.on('call:leave', () => {
      handleUserLeave(socket);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`📞 User disconnected from WebRTC: ${socket.id}`);
      handleUserLeave(socket);
    });

    function handleUserLeave(socket) {
      const roomId = socket.roomId;
      if (!roomId) return;

      const room = rooms.get(roomId);
      if (!room) return;

      // Remove user from room
      room.users.delete(socket.id);

      // Notify other users
      socket.to(roomId).emit('call:user-left', {
        socketId: socket.id,
        userId: socket.userId,
        userName: socket.userName,
        participants: Array.from(room.users.values())
      });

      // If room is empty, delete it
      if (room.users.size === 0) {
        rooms.delete(roomId);
        console.log(`📞 Room ${roomId} deleted (empty)`);
      } else if (room.host === socket.id) {
        // Transfer host to next user
        const nextHost = room.users.keys().next().value;
        room.host = nextHost;
        io.to(nextHost).emit('call:host-transferred');
      }

      socket.leave(roomId);
      console.log(`📞 User ${socket.userName} left room ${roomId}`);
    }
  });

  return {
    getRooms: () => Array.from(rooms.entries()),
    getRoom: (roomId) => rooms.get(roomId)
  };
};

module.exports = socketHandler;
