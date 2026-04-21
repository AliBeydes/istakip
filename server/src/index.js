const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { initializeWebSocket } = require('./websocket/new-socket-handler');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const workspaceRoutes = require('./routes/workspaces');
const groupRoutes = require('./routes/groups');
const taskRoutes = require('./routes/tasks');
const documentRoutes = require('./routes/documents');
const meetingRoutes = require('./routes/meetings');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics-api');
const adminSettingsRoutes = require('./routes/admin-settings');
const testRoutes = require('./routes/test-api');
const timeEntriesRoutes = require('./routes/time-entries');
const taskTemplatesRoutes = require('./routes/task-templates');
const automationRulesRoutes = require('./routes/automation-rules');
const customFieldsRoutes = require('./routes/custom-fields');
const notesRoutes = require('./routes/notes');
const pricingRoutes = require('./routes/pricing');
const analyticsMetricsRoutes = require('./routes/analytics-metrics');
const publicRoutes = require('./routes/public');

const { errorHandler } = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3020;

// Middleware
// CORS first (before helmet to avoid conflicts)
app.use(cors({
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
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

// Security headers (relaxed for development)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

app.use('/api/auth', limiter);
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // Temporarily removed auth for testing
app.use('/api/workspaces', authenticateToken, workspaceRoutes);
app.use('/api/groups', authenticateToken, groupRoutes);
app.use('/api/tasks', authenticateToken, taskRoutes);
app.use('/api/documents', authenticateToken, documentRoutes);
app.use('/api/meetings', authenticateToken, meetingRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/admin/settings', authenticateToken, adminSettingsRoutes);
app.use('/api/test', testRoutes);
app.use('/api/time-entries', authenticateToken, timeEntriesRoutes);
app.use('/api/task-templates', authenticateToken, taskTemplatesRoutes);
app.use('/api/automation-rules', authenticateToken, automationRulesRoutes);
app.use('/api/custom-fields', authenticateToken, customFieldsRoutes);
app.use('/api/notes', authenticateToken, notesRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/analytics/metrics', authenticateToken, analyticsMetricsRoutes);
app.use('/api/public', publicRoutes); // Public routes (no auth)

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

// Initialize WebSocket/Socket.io
initializeWebSocket(server);
console.log(`🔌 WebSocket initialized on port ${PORT}`);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;
