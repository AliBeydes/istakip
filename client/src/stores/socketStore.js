import { create } from 'zustand';
import { io } from 'socket.io-client';
import { useAuthStore } from './authStore';

const SOCKET_URL = 'http://localhost:3020';

export const useSocketStore = create((set, get) => ({
  // State
  socket: null,
  isConnected: false,
  onlineUsers: [],
  notifications: [],
  unreadCount: 0,
  messages: [],
  typingUsers: [],
  connectionError: null,

  // Actions
  connect: (userId, workspaceId) => {
    const { socket } = get();
    
    if (socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    console.log('Connecting to WebSocket...');
    
    const newSocket = io(SOCKET_URL, {
      auth: {
        token: useAuthStore.getState().token,
        userId,
        workspaceId
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected:', newSocket.id);
      set({ 
        isConnected: true, 
        connectionError: null,
        socket: newSocket 
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      set({ 
        isConnected: false,
        onlineUsers: []
      });
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
      set({ 
        isConnected: false, 
        connectionError: error.message 
      });
    });

    // User presence events
    newSocket.on('users:online', (users) => {
      console.log('👥 Online users updated:', users);
      set({ onlineUsers: users });
    });

    newSocket.on('user:joined', (data) => {
      console.log('👤 User joined:', data.userId);
      set((state) => ({
        onlineUsers: [...state.onlineUsers, { userId: data.userId, connectedAt: data.timestamp }]
      }));
    });

    newSocket.on('user:left', (data) => {
      console.log('👤 User left:', data.userId);
      set((state) => ({
        onlineUsers: state.onlineUsers.filter(u => u.userId !== data.userId)
      }));
    });

    // Notification events
    newSocket.on('notification:received', (notification) => {
      console.log('🔔 Notification received:', notification);
      set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      }));
      
      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        });
      }
    });

    newSocket.on('notification:acknowledged', ({ notificationId }) => {
      set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      }));
    });

    // Chat/message events
    newSocket.on('message:received', (message) => {
      console.log('💬 Message received:', message);
      set((state) => ({
        messages: [...state.messages, message]
      }));
    });

    // Typing indicators
    newSocket.on('typing:start', (data) => {
      set((state) => ({
        typingUsers: [...state.typingUsers.filter(u => u.userId !== data.userId), data]
      }));
    });

    newSocket.on('typing:stop', (data) => {
      set((state) => ({
        typingUsers: state.typingUsers.filter(u => u.userId !== data.userId)
      }));
    });

    // Real-time updates
    newSocket.on('task:updated', (data) => {
      console.log('📋 Task updated:', data);
      // Trigger task store refresh or update
    });

    newSocket.on('meeting:updated', (data) => {
      console.log('📅 Meeting updated:', data);
      // Trigger meeting store refresh or update
    });

    newSocket.on('document:updated', (data) => {
      console.log('📄 Document updated:', data);
      // Trigger document store refresh or update
    });

    set({ socket: newSocket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      console.log('Disconnecting WebSocket...');
      socket.disconnect();
      set({ 
        socket: null, 
        isConnected: false, 
        onlineUsers: [],
        typingUsers: []
      });
    }
  },

  // Send message
  sendMessage: (content, type = 'text', metadata = {}) => {
    const { socket, isConnected } = get();
    if (!socket || !isConnected) {
      console.error('Cannot send message: not connected');
      return false;
    }

    socket.emit('message:send', { content, type, metadata });
    return true;
  },

  // Typing indicators
  startTyping: (context) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit('typing:start', { context });
    }
  },

  stopTyping: (context) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit('typing:stop', { context });
    }
  },

  // Notifications
  markNotificationAsRead: (notificationId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('notification:ack', notificationId);
    }
    set((state) => ({
      notifications: state.notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }));
  },

  markAllNotificationsAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0
    }));
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  // Subscribe to events
  subscribe: (events) => {
    const { socket } = get();
    if (socket) {
      socket.emit('subscribe', events);
    }
  },

  unsubscribe: (events) => {
    const { socket } = get();
    if (socket) {
      socket.emit('unsubscribe', events);
    }
  },

  // Request browser notification permission
  requestNotificationPermission: async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    // Only request if permission hasn't been decided yet
    if (Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.log('Notification permission request failed:', error);
        return false;
      }
    }
    
    return Notification.permission === 'granted';
  },
}));

export default useSocketStore;
