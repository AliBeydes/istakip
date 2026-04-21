const express = require('express');
const router = express.Router();

// Mock analytics data
const generateMockAnalytics = (workspaceId) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  return {
    workspaceId,
    generatedAt: new Date().toISOString(),
    period: 'last_30_days',
    
    // Overview metrics
    overview: {
      totalTasks: 156,
      completedTasks: 89,
      pendingTasks: 45,
      overdueTasks: 22,
      completionRate: 57.1,
      
      totalMeetings: 24,
      completedMeetings: 18,
      upcomingMeetings: 6,
      attendanceRate: 82.5,
      
      totalDocuments: 67,
      sharedDocuments: 34,
      privateDocuments: 33,
      
      activeUsers: 12,
      totalUsers: 15,
      userActivityRate: 80.0
    },
    
    // Task analytics
    tasks: {
      byStatus: {
        TODO: 45,
        IN_PROGRESS: 28,
        REVIEW: 12,
        DONE: 71
      },
      byPriority: {
        LOW: 34,
        MEDIUM: 78,
        HIGH: 31,
        URGENT: 13
      },
      completionTrend: [
        { date: '2026-03-08', completed: 2, created: 5 },
        { date: '2026-03-09', completed: 3, created: 4 },
        { date: '2026-03-10', completed: 1, created: 3 },
        { date: '2026-03-11', completed: 4, created: 6 },
        { date: '2026-03-12', completed: 2, created: 4 },
        { date: '2026-03-13', completed: 5, created: 3 },
        { date: '2026-03-14', completed: 3, created: 2 },
        { date: '2026-03-15', completed: 4, created: 5 },
        { date: '2026-03-16', completed: 2, created: 4 },
        { date: '2026-03-17', completed: 6, created: 3 },
        { date: '2026-03-18', completed: 3, created: 5 },
        { date: '2026-03-19', completed: 4, created: 4 },
        { date: '2026-03-20', completed: 2, created: 3 },
        { date: '2026-03-21', completed: 5, created: 6 },
        { date: '2026-03-22', completed: 3, created: 4 },
        { date: '2026-03-23', completed: 4, created: 5 },
        { date: '2026-03-24', completed: 2, created: 3 },
        { date: '2026-03-25', completed: 6, created: 4 },
        { date: '2026-03-26', completed: 3, created: 5 },
        { date: '2026-03-27', completed: 4, created: 3 },
        { date: '2026-03-28', completed: 2, created: 4 },
        { date: '2026-03-29', completed: 5, created: 6 },
        { date: '2026-03-30', completed: 3, created: 4 },
        { date: '2026-03-31', completed: 4, created: 5 },
        { date: '2026-04-01', completed: 2, created: 3 },
        { date: '2026-04-02', completed: 6, created: 4 },
        { date: '2026-04-03', completed: 3, created: 5 },
        { date: '2026-04-04', completed: 4, created: 3 },
        { date: '2026-04-05', completed: 2, created: 4 },
        { date: '2026-04-06', completed: 5, created: 2 }
      ],
      topAssignees: [
        { userId: '1', name: 'Test User', completed: 23, pending: 8 },
        { userId: '2', name: 'Jane Smith', completed: 19, pending: 12 },
        { userId: '3', name: 'Bob Johnson', completed: 15, pending: 10 },
        { userId: '4', name: 'Alice Brown', completed: 12, pending: 6 },
        { userId: '5', name: 'Charlie Wilson', completed: 11, pending: 9 }
      ]
    },
    
    // Meeting analytics
    meetings: {
      byStatus: {
        SCHEDULED: 6,
        IN_PROGRESS: 2,
        COMPLETED: 18,
        CANCELLED: 3
      },
      byType: {
        REGULAR: 12,
        RECURRING: 8,
        IMPORTANT: 4
      },
      attendanceTrend: [
        { month: 'Jan', rate: 78 },
        { month: 'Feb', rate: 82 },
        { month: 'Mar', rate: 85 },
        { month: 'Apr', rate: 82 }
      ],
      durationStats: {
        average: 45,
        shortest: 15,
        longest: 120
      }
    },
    
    // Document analytics
    documents: {
      byType: {
        PDF: 23,
        DOC: 18,
        XLS: 12,
        PPT: 8,
        OTHER: 6
      },
      storageUsed: 256.7, // MB
      mostViewed: [
        { id: '1', title: 'Project Proposal', views: 45 },
        { id: '2', title: 'Q1 Report', views: 38 },
        { id: '3', title: 'Meeting Notes', views: 32 },
        { id: '4', title: 'Architecture Diagram', views: 28 },
        { id: '5', title: 'User Manual', views: 25 }
      ]
    },
    
    // User activity
    users: {
      activeUsers: [
        { userId: '1', name: 'Test User', tasksCompleted: 23, meetingsAttended: 8, lastActive: '2026-04-07T10:30:00Z' },
        { userId: '2', name: 'Jane Smith', tasksCompleted: 19, meetingsAttended: 7, lastActive: '2026-04-07T09:15:00Z' },
        { userId: '3', name: 'Bob Johnson', tasksCompleted: 15, meetingsAttended: 6, lastActive: '2026-04-06T16:45:00Z' },
        { userId: '4', name: 'Alice Brown', tasksCompleted: 12, meetingsAttended: 5, lastActive: '2026-04-07T11:00:00Z' },
        { userId: '5', name: 'Charlie Wilson', tasksCompleted: 11, meetingsAttended: 4, lastActive: '2026-04-06T14:20:00Z' }
      ],
      loginTrend: [
        { date: '2026-04-01', count: 8 },
        { date: '2026-04-02', count: 12 },
        { date: '2026-04-03', count: 10 },
        { date: '2026-04-04', count: 6 },
        { date: '2026-04-05', count: 11 },
        { date: '2026-04-06', count: 9 },
        { date: '2026-04-07', count: 12 }
      ]
    },
    
    // Performance metrics
    performance: {
      averageTaskCompletionTime: 3.2, // days
      onTimeDeliveryRate: 76.5, // percentage
      meetingPunctuality: 89.2, // percentage
      documentResponseTime: 4.5 // hours
    }
  };
};

// @route   GET /api/analytics/overview
// @desc    Get analytics overview
// @access  Private
router.get('/overview', (req, res) => {
  const { workspaceId = '1' } = req.query;
  
  const analytics = generateMockAnalytics(workspaceId);
  
  res.json({
    success: true,
    data: analytics.overview
  });
});

// @route   GET /api/analytics/tasks
// @desc    Get task analytics
// @access  Private
router.get('/tasks', (req, res) => {
  const { workspaceId = '1' } = req.query;
  
  const analytics = generateMockAnalytics(workspaceId);
  
  res.json({
    success: true,
    data: analytics.tasks
  });
});

// @route   GET /api/analytics/meetings
// @desc    Get meeting analytics
// @access  Private
router.get('/meetings', (req, res) => {
  const { workspaceId = '1' } = req.query;
  
  const analytics = generateMockAnalytics(workspaceId);
  
  res.json({
    success: true,
    data: analytics.meetings
  });
});

// @route   GET /api/analytics/documents
// @desc    Get document analytics
// @access  Private
router.get('/documents', (req, res) => {
  const { workspaceId = '1' } = req.query;
  
  const analytics = generateMockAnalytics(workspaceId);
  
  res.json({
    success: true,
    data: analytics.documents
  });
});

// @route   GET /api/analytics/users
// @desc    Get user activity analytics
// @access  Private
router.get('/users', (req, res) => {
  const { workspaceId = '1' } = req.query;
  
  const analytics = generateMockAnalytics(workspaceId);
  
  res.json({
    success: true,
    data: analytics.users
  });
});

// @route   GET /api/analytics/performance
// @desc    Get performance metrics
// @access  Private
router.get('/performance', (req, res) => {
  const { workspaceId = '1' } = req.query;
  
  const analytics = generateMockAnalytics(workspaceId);
  
  res.json({
    success: true,
    data: analytics.performance
  });
});

// @route   GET /api/analytics/full
// @desc    Get full analytics report
// @access  Private
router.get('/full', (req, res) => {
  const { workspaceId = '1' } = req.query;
  
  const analytics = generateMockAnalytics(workspaceId);
  
  res.json({
    success: true,
    data: analytics
  });
});

module.exports = router;
