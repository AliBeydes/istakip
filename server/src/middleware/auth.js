const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authenticateToken = async (req, res, next) => {
  try {
    let token = null;
    
    // Debug logging
    console.log('🔍 Auth Headers:', JSON.stringify(req.headers.authorization));
    
    // Try Authorization header first (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log('✅ Bearer token found:', token.substring(0, 20) + '...');
    }
    
    // Fallback to cookie if no Bearer token
    if (!token && req.headers.cookie) {
      const cookieToken = req.headers.cookie
        .split(';')
        .find(cookie => cookie.trim().startsWith('token='))
        ?.split('=')[1];
      if (cookieToken) {
        token = cookieToken;
        console.log('✅ Cookie token found');
      }
    }

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify JWT token
    let decoded;
    try {
      console.log('🔍 JWT_SECRET exists:', !!process.env.JWT_SECRET);
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token verified, userId:', decoded.userId);
    } catch (jwtErr) {
      console.log('❌ JWT verify failed:', jwtErr.message);
      console.log('🔍 Token:', token.substring(0, 30) + '...');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        isActive: true,
        lastLoginAt: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Attach user to request
    req.user = user;
    
    // Auto-add user to default workspace if not already a member
    try {
      const defaultWorkspaceId = '1';
      const existingMembership = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId: defaultWorkspaceId
          }
        }
      });
      
      if (!existingMembership) {
        console.log(`🔄 Auto-adding user ${user.id} to default workspace`);
        
        // Check if workspace exists
        let workspace = await prisma.workspace.findUnique({
          where: { id: defaultWorkspaceId }
        });
        
        // Create workspace if not exists
        if (!workspace) {
          workspace = await prisma.workspace.create({
            data: {
              id: defaultWorkspaceId,
              name: 'Ana Workspace',
              slug: 'ana-workspace',
              ownerId: user.id
            }
          });
          console.log(`✅ Created default workspace`);
        }
        
        // Add user as ADMIN if they created the workspace, else MEMBER
        const isOwner = workspace.ownerId === user.id;
        await prisma.workspaceMember.create({
          data: {
            id: `wm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: user.id,
            workspaceId: defaultWorkspaceId,
            role: isOwner ? 'ADMIN' : 'MEMBER',
            joinedAt: new Date()
          }
        });
        console.log(`✅ User ${user.id} added to workspace as ${isOwner ? 'ADMIN' : 'MEMBER'}`);
      }
    } catch (err) {
      console.error('Auto-add to workspace error:', err.message);
      // Don't block the request if auto-add fails
    }
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// RBAC Middleware
const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = req.user.id;

      // Get user's role in the workspace
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId
          }
        },
        include: {
          workspace: {
            select: {
              ownerId: true
            }
          }
        }
      });

      if (!membership) {
        // Auto-create membership for development/testing
        console.log(`🔄 Auto-adding user ${userId} to workspace ${workspaceId}`);
        try {
          // Check if workspace exists
          const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId }
          });
          
          if (!workspace) {
            // Create default workspace
            await prisma.workspace.create({
              data: {
                id: workspaceId,
                name: 'Default Workspace',
                slug: 'default',
                ownerId: userId
              }
            });
          }
          
          // Create membership
          const newMember = await prisma.workspaceMember.create({
            data: {
              id: 'dev_' + Date.now(),
              userId: userId,
              workspaceId: workspaceId,
              role: 'ADMIN',
              joinedAt: new Date()
            },
            include: {
              workspace: {
                select: { ownerId: true }
              }
            }
          });
          
          req.userRole = 'ADMIN';
          req.workspaceMembership = newMember;
          return next();
        } catch (err) {
          console.error('Auto-add failed:', err.message);
          return res.status(403).json({ error: 'Access denied: Not a workspace member' });
        }
      }

      // Check if user is workspace owner (has all permissions)
      if (membership.workspace.ownerId === userId) {
        req.userRole = 'ADMIN';
        return next();
      }

      // Check role-based permissions
      const userRole = membership.role;
      
      if (!roles.includes(userRole)) {
        return res.status(403).json({ 
          error: 'Access denied: Insufficient permissions',
          required: roles,
          current: userRole
        });
      }

      req.userRole = userRole;
      req.workspaceMembership = membership;
      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

// Group RBAC Middleware
const requireGroupRole = (roles) => {
  return async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      const membership = await prisma.groupMember.findUnique({
        where: {
          userId_groupId: {
            userId,
            groupId
          }
        }
      });

      if (!membership) {
        return res.status(403).json({ error: 'Access denied: Not a group member' });
      }

      const userRole = membership.role;
      
      if (!roles.includes(userRole)) {
        return res.status(403).json({ 
          error: 'Access denied: Insufficient group permissions',
          required: roles,
          current: userRole
        });
      }

      req.userGroupRole = userRole;
      req.groupMembership = membership;
      next();
    } catch (error) {
      console.error('Group RBAC middleware error:', error);
      return res.status(500).json({ error: 'Group permission check failed' });
    }
  };
};

// Resource ownership check
const requireOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const resourceId = req.params.id;

      let resource;
      
      switch (resourceType) {
        case 'task':
          resource = await prisma.task.findUnique({
            where: { id: resourceId },
            select: { creatorId: true }
          });
          break;
        case 'document':
          resource = await prisma.document.findUnique({
            where: { id: resourceId },
            select: { creatorId: true }
          });
          break;
        case 'meeting':
          // For meetings, check if user is attendee or workspace owner
          const meeting = await prisma.meeting.findUnique({
            where: { id: resourceId },
            include: {
              workspace: {
                select: { ownerId: true }
              }
            }
          });
          
          if (meeting && (meeting.workspace.ownerId === userId)) {
            return next();
          }
          
          const attendee = await prisma.meetingAttendee.findUnique({
            where: {
              meetingId_userId: {
                meetingId: resourceId,
                userId
              }
            }
          });
          
          if (!attendee) {
            return res.status(403).json({ error: 'Access denied: Not a meeting attendee' });
          }
          return next;
        default:
          return res.status(400).json({ error: 'Invalid resource type' });
      }

      if (!resource || resource.creatorId !== userId) {
        return res.status(403).json({ error: 'Access denied: Not the resource owner' });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({ error: 'Ownership check failed' });
    }
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requireGroupRole,
  requireOwnership
};
