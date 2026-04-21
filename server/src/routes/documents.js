const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
const prisma = new PrismaClient();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, JPG, PNG, GIF, PDF, DOC, DOCX, TXT files are allowed.'));
    }
  }
});

// @route   GET /api/documents
// @desc    Get all documents accessible to user (public, shared, owned, group)
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { workspaceId, visibility, groupId } = req.query;
  const userId = req.user.id;

  if (!workspaceId) {
    return res.status(400).json({ error: 'workspaceId is required' });
  }

  // Get user's group memberships
  const userGroups = await prisma.groupMember.findMany({
    where: { userId },
    select: { groupId: true }
  });
  const userGroupIds = userGroups.map(g => g.groupId);

  // Build where clause
  const where = {
    workspaceId,
    OR: [
      // Public documents
      { visibility: 'PUBLIC' },
      // Documents owned by user
      { creatorId: userId },
      // Documents shared with user specifically
      {
        shares: {
          some: {
            userId: userId
          }
        }
      },
      // Documents shared with user's groups
      {
        shares: {
          some: {
            groupId: { in: userGroupIds }
          }
        }
      },
      // Documents restricted to user's groups
      {
        visibility: 'GROUP',
        groupId: { in: userGroupIds }
      }
    ]
  };

  // Add visibility filter if specified
  if (visibility) {
    where.visibility = visibility;
  }
  if (groupId) {
    where.groupId = groupId;
  }

  const documents = await prisma.document.findMany({
    where,
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
      },
      group: {
        select: { id: true, name: true }
      },
      shares: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          group: { select: { id: true, name: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ documents });
}));

// @route   GET /api/documents/pool
// @desc    Get public document pool (all public documents)
// @access  Private
router.get('/pool', asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;

  if (!workspaceId) {
    return res.status(400).json({ error: 'workspaceId is required' });
  }

  const documents = await prisma.document.findMany({
    where: {
      workspaceId,
      visibility: 'PUBLIC'
    },
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
      },
      group: {
        select: { id: true, name: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ documents });
}));

// @route   GET /api/documents/shared
// @desc    Get documents shared with user
// @access  Private
router.get('/shared', asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;
  const userId = req.user.id;

  const userGroups = await prisma.groupMember.findMany({
    where: { userId },
    select: { groupId: true }
  });
  const userGroupIds = userGroups.map(g => g.groupId);

  const documents = await prisma.document.findMany({
    where: {
      workspaceId,
      OR: [
        // Direct shares
        {
          shares: {
            some: {
              userId: userId
            }
          }
        },
        // Group shares
        {
          shares: {
            some: {
              groupId: { in: userGroupIds }
            }
          }
        }
      ],
      NOT: {
        creatorId: userId // Exclude user's own documents
      }
    },
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
      },
      shares: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
          group: { select: { id: true, name: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ documents });
}));

// @route   POST /api/documents
// @desc    Create a new document with visibility settings
// @access  Private
router.post('/', upload.single('file'), asyncHandler(async (req, res) => {
  const { title, content, type, visibility, groupId } = req.body;
  const userId = req.user.id;
  const workspaceId = req.body.workspaceId || '1';
  const selectedUsers = req.body.selectedUsers ? (Array.isArray(req.body.selectedUsers) ? req.body.selectedUsers : [req.body.selectedUsers]) : [];

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  // Validate visibility
  const validVisibilities = ['PUBLIC', 'PRIVATE', 'GROUP', 'SPECIFIC_USERS'];
  if (!validVisibilities.includes(visibility)) {
    return res.status(400).json({ error: 'Invalid visibility type' });
  }

  // If GROUP visibility, groupId is required
  if (visibility === 'GROUP' && !groupId) {
    return res.status(400).json({ error: 'groupId is required for GROUP visibility' });
  }

  // If SPECIFIC_USERS visibility, selectedUsers is required
  if (visibility === 'SPECIFIC_USERS' && selectedUsers.length === 0) {
    return res.status(400).json({ error: 'selectedUsers is required for SPECIFIC_USERS visibility' });
  }

  // Handle file upload
  let filePath = null;
  let fileSize = null;
  let mimeType = null;
  
  if (req.file) {
    filePath = `/uploads/${req.file.filename}`;
    fileSize = req.file.size;
    mimeType = req.file.mimetype;
  }

  const document = await prisma.document.create({
    data: {
      title,
      content,
      type: type || 'NOTE',
      visibility,
      groupId: visibility === 'GROUP' ? groupId : null,
      filePath,
      fileSize,
      mimeType,
      workspaceId,
      creatorId: userId
    },
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
      },
      group: {
        select: { id: true, name: true }
      }
    }
  });

  // If SPECIFIC_USERS visibility, create shares for selected users
  if (visibility === 'SPECIFIC_USERS' && selectedUsers.length > 0) {
    const shares = await prisma.documentShare.createMany({
      data: selectedUsers.map(userId => ({
        documentId: document.id,
        userId: userId,
        permission: 'READ'
      }))
    });
  }

  res.status(201).json({
    message: 'Document created successfully',
    document
  });
}));

// @route   GET /api/documents/:id
// @desc    Get document by ID with access check
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
      },
      group: {
        select: { id: true, name: true }
      },
      shares: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          group: { select: { id: true, name: true } }
        }
      }
    }
  });

  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Check access permissions
  const hasAccess = await checkDocumentAccess(document, userId);
  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json({ document });
}));

// @route   PUT /api/documents/:id
// @desc    Update document
// @access  Private
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, visibility, groupId } = req.body;
  const userId = req.user.id;

  const document = await prisma.document.findUnique({
    where: { id }
  });

  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Only creator or admin can update
  if (document.creatorId !== userId) {
    return res.status(403).json({ error: 'Only creator can update document' });
  }

  const updatedDocument = await prisma.document.update({
    where: { id },
    data: {
      title: title || document.title,
      content: content !== undefined ? content : document.content,
      visibility: visibility || document.visibility,
      groupId: visibility === 'GROUP' ? groupId : null
    },
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
      },
      group: {
        select: { id: true, name: true }
      },
      shares: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
          group: { select: { id: true, name: true } }
        }
      }
    }
  });

  res.json({
    message: 'Document updated successfully',
    document: updatedDocument
  });
}));

// @route   DELETE /api/documents/:id
// @desc    Delete document
// @access  Private
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const document = await prisma.document.findUnique({
    where: { id }
  });

  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Only creator can delete
  if (document.creatorId !== userId) {
    return res.status(403).json({ error: 'Only creator can delete document' });
  }

  await prisma.document.delete({
    where: { id }
  });

  res.json({ message: 'Document deleted successfully' });
}));

// @route   POST /api/documents/:id/share
// @desc    Share document with user or group
// @access  Private
router.post('/:id/share', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId: targetUserId, groupId, permission = 'READ' } = req.body;
  const requesterId = req.user.id;

  if (!targetUserId && !groupId) {
    return res.status(400).json({ error: 'userId or groupId is required' });
  }

  const document = await prisma.document.findUnique({
    where: { id }
  });

  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Only creator can share
  if (document.creatorId !== requesterId) {
    return res.status(403).json({ error: 'Only creator can share document' });
  }

  // Create or update share
  const share = await prisma.documentShare.upsert({
    where: {
      documentId_userId_groupId: {
        documentId: id,
        userId: targetUserId || null,
        groupId: groupId || null
      }
    },
    update: {
      permission
    },
    create: {
      id: `ds_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      documentId: id,
      userId: targetUserId || null,
      groupId: groupId || null,
      permission
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      group: { select: { id: true, name: true } }
    }
  });

  res.json({
    message: 'Document shared successfully',
    share
  });
}));

// @route   DELETE /api/documents/:id/share/:shareId
// @desc    Remove document share
// @access  Private
router.delete('/:id/share/:shareId', asyncHandler(async (req, res) => {
  const { id, shareId } = req.params;
  const userId = req.user.id;

  const document = await prisma.document.findUnique({
    where: { id }
  });

  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Only creator can remove shares
  if (document.creatorId !== userId) {
    return res.status(403).json({ error: 'Only creator can remove shares' });
  }

  await prisma.documentShare.delete({
    where: { id: shareId }
  });

  res.json({ message: 'Share removed successfully' });
}));

// @route   GET /api/documents/:id/permissions
// @desc    Get document permissions for current user
// @access  Private
router.get('/:id/permissions', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      shares: {
        where: {
          OR: [
            { userId: userId },
            {
              group: {
                members: {
                  some: { userId: userId }
                }
              }
            }
          ]
        }
      }
    }
  });

  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  let permission = null;

  if (document.creatorId === userId) {
    permission = 'ADMIN';
  } else if (document.visibility === 'PUBLIC') {
    permission = 'READ';
  } else if (document.shares.length > 0) {
    // Get highest permission level
    const permissions = document.shares.map(s => s.permission);
    if (permissions.includes('ADMIN')) permission = 'ADMIN';
    else if (permissions.includes('WRITE')) permission = 'WRITE';
    else permission = 'READ';
  }

  res.json({
    canRead: !!permission,
    canWrite: permission === 'WRITE' || permission === 'ADMIN',
    canAdmin: permission === 'ADMIN',
    isCreator: document.creatorId === userId
  });
}));

// Helper function to check document access
async function checkDocumentAccess(document, userId) {
  // Creator always has access
  if (document.creatorId === userId) return true;

  // Public documents
  if (document.visibility === 'PUBLIC') return true;

  // Check direct shares
  const directShare = await prisma.documentShare.findFirst({
    where: {
      documentId: document.id,
      userId: userId
    }
  });
  if (directShare) return true;

  // Check group shares
  const userGroups = await prisma.groupMember.findMany({
    where: { userId },
    select: { groupId: true }
  });
  const userGroupIds = userGroups.map(g => g.groupId);

  const groupShare = await prisma.documentShare.findFirst({
    where: {
      documentId: document.id,
      groupId: { in: userGroupIds }
    }
  });
  if (groupShare) return true;

  // Check if document is restricted to a group the user is in
  if (document.visibility === 'GROUP' && userGroupIds.includes(document.groupId)) {
    return true;
  }

  return false;
}

module.exports = router;
