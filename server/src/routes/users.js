const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireRole } = require('../middleware/auth');
const { authenticateToken } = require('../middleware/auth');
const { handleUpload } = require('../middleware/upload');
const emailService = require('../services/emailService');
const path = require('path');

const router = express.Router();
const prisma = new PrismaClient();

// Predefined badge list
const AVAILABLE_BADGES = [
  { id: 'founder', name: 'Kurucu', icon: '👑', color: '#FFD700', description: 'Platform kurucusu' },
  { id: 'admin', name: 'Admin', icon: '⚡', color: '#FF6B6B', description: 'Sistem yöneticisi' },
  { id: 'manager', name: 'Yönetici', icon: '🏆', color: '#4ECDC4', description: 'Ekip yöneticisi' },
  { id: 'expert', name: 'Uzman', icon: '🎯', color: '#45B7D1', description: '100+ görev tamamladı' },
  { id: 'mentor', name: 'Mentor', icon: '🌟', color: '#96CEB4', description: 'Yeni üyelere rehberlik etti' },
  { id: 'creator', name: 'İçerik Üreticisi', icon: '✨', color: '#DDA0DD', description: '50+ doküman paylaştı' },
  { id: 'early-adopter', name: 'Erken Benimseyen', icon: '🚀', color: '#FF7F50', description: 'Beta döneminde katıldı' },
  { id: 'team-player', name: 'Takım Oyuncusu', icon: '🤝', color: '#20B2AA', description: '100+ grup aktivitesi' },
  { id: 'problem-solver', name: 'Problem Çözücü', icon: '💡', color: '#FFD93D', description: '50+ kritik sorun çözdü' },
  { id: 'innovator', name: 'İnovatör', icon: '🔬', color: '#6BCB77', description: 'Yeni fikir geliştirdi' }
];

// @route   GET /api/users/profile
// @desc    Get user profile with workspaces
// @access  Private
router.get('/profile', asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatar: true,
      // Professional fields
      company: true,
      position: true,
      department: true,
      employeeId: true,
      bio: true,
      skills: true,
      experience: true,
      education: true,
      location: true,
      timezone: true,
      phone: true,
      linkedinUrl: true,
      githubUrl: true,
      website: true,
      // Badge fields
      role: true,
      badges: true,
      level: true,
      reputation: true,
      joinDate: true,
      // Status
      isActive: true,
      isOnline: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      workspaceMembers: {
        include: {
          workspace: {
            select: {
              id: true,
              name: true,
              description: true,
              avatar: true,
              createdAt: true
            }
          }
        }
      },
      ownedWorkspaces: {
        select: {
          id: true,
          name: true,
          description: true,
          avatar: true,
          createdAt: true
        }
      }
    }
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Parse badges JSON
  let parsedBadges = [];
  try {
    if (user.badges) {
      const badgeIds = JSON.parse(user.badges);
      parsedBadges = badgeIds.map(id => AVAILABLE_BADGES.find(b => b.id === id)).filter(Boolean);
    }
  } catch (e) {
    console.error('Error parsing badges:', e);
  }

  // Parse skills JSON
  let parsedSkills = [];
  try {
    if (user.skills) {
      parsedSkills = JSON.parse(user.skills);
    }
  } catch (e) {
    console.error('Error parsing skills:', e);
  }

  // Combine owned and joined workspaces
  const allWorkspaces = [
    ...user.ownedWorkspaces.map(w => ({ ...w, role: 'ADMIN', isOwner: true })),
    ...user.workspaceMembers.map(m => ({ 
      ...m.workspace, 
      role: m.role, 
      isOwner: false,
      joinedAt: m.joinedAt 
    }))
  ];

  // Calculate next level progress
  const nextLevelRep = user.level * 100;
  const progress = Math.min(100, (user.reputation / nextLevelRep) * 100);

  res.json({
    user: {
      ...user,
      skills: parsedSkills,
      badges: parsedBadges,
      workspaces: allWorkspaces,
      levelProgress: {
        current: user.reputation,
        next: nextLevelRep,
        percentage: progress
      }
    }
  });
}));

// @route   PUT /api/users/profile
// @desc    Update user profile with professional fields
// @access  Private
router.put('/profile', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    firstName,
    lastName,
    phone,
    company,
    position,
    department,
    employeeId,
    bio,
    skills,
    experience,
    education,
    location,
    timezone,
    linkedinUrl,
    githubUrl,
    website
  } = req.body;

  const updateData = {};
  
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (phone !== undefined) updateData.phone = phone;
  if (company !== undefined) updateData.company = company;
  if (position !== undefined) updateData.position = position;
  if (department !== undefined) updateData.department = department;
  if (employeeId !== undefined) updateData.employeeId = employeeId;
  if (bio !== undefined) updateData.bio = bio;
  if (skills !== undefined) updateData.skills = JSON.stringify(skills);
  if (experience !== undefined) updateData.experience = experience;
  if (education !== undefined) updateData.education = education;
  if (location !== undefined) updateData.location = location;
  if (timezone !== undefined) updateData.timezone = timezone;
  if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl;
  if (githubUrl !== undefined) updateData.githubUrl = githubUrl;
  if (website !== undefined) updateData.website = website;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatar: true,
      company: true,
      position: true,
      department: true,
      employeeId: true,
      bio: true,
      skills: true,
      experience: true,
      education: true,
      location: true,
      phone: true,
      linkedinUrl: true,
      githubUrl: true,
      website: true,
      role: true,
      badges: true,
      level: true,
      reputation: true,
      updatedAt: true
    }
  });

  // Parse skills for response
  let parsedSkills = [];
  try {
    if (user.skills) parsedSkills = JSON.parse(user.skills);
  } catch (e) {}

  res.json({
    message: 'Profil başarıyla güncellendi',
    user: { ...user, skills: parsedSkills }
  });
}));

// @route   POST /api/users/avatar
// @desc    Upload profile avatar
// @access  Private
router.post('/avatar', handleUpload, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  if (!req.file) {
    return res.status(400).json({ error: 'Dosya yüklenemedi' });
  }

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatar: avatarUrl },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatar: true
    }
  });

  res.json({
    message: 'Profil fotoğrafı güncellendi',
    user
  });
}));

// @route   GET /api/users/workspace/:workspaceId
// @desc    Get all users in workspace
// @access  Private
router.get('/workspace/:workspaceId', asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  const memberships = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
          company: true,
          position: true,
          department: true,
          employeeId: true,
          isOnline: true,
          isActive: true,
          lastLoginAt: true,
          role: true,
          badges: true,
          level: true,
          reputation: true,
          joinDate: true,
          groupMemberships: {
            include: {
              group: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: { joinedAt: 'desc' }
  });

  // Parse badges and groups for each user
  const usersWithDetails = memberships.map(m => {
    let parsedBadges = [];
    try {
      if (m.user.badges) {
        const badgeIds = JSON.parse(m.user.badges);
        parsedBadges = badgeIds.map(id => AVAILABLE_BADGES.find(b => b.id === id)).filter(Boolean);
      }
    } catch (e) {}

    // Extract groups from groupMemberships
    const groups = m.user.groupMemberships?.map(gm => gm.group) || [];

    return {
      ...m.user,
      badges: parsedBadges,
      groups: groups,
      membershipRole: m.role,
      membershipId: m.id,
      joinedAt: m.joinedAt
    };
  });

  res.json({ users: usersWithDetails });
}));

// @route   PUT /api/users/workspace/:workspaceId/:userId/role
// @desc    Update user role in workspace
// @access  Private (Admin only)
router.put('/workspace/:workspaceId/:userId/role', requireRole(['ADMIN']), asyncHandler(async (req, res) => {
  const { workspaceId, userId } = req.params;
  const { role } = req.body;

  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId,
      workspaceId
    }
  });

  if (!membership) {
    return res.status(404).json({ error: 'Üyelik bulunamadı' });
  }

  const updated = await prisma.workspaceMember.update({
    where: { id: membership.id },
    data: { role },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true
        }
      }
    }
  });

  // Also update user global role if needed
  if (role === 'ADMIN') {
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' }
    });
  }

  res.json({
    message: 'Rol başarıyla güncellendi',
    membership: updated
  });
}));

// @route   POST /api/users/workspace/:workspaceId/invite
// @desc    Invite user to workspace with professional details
// @access  Private (ADMIN or MANAGER required)
router.post('/workspace/:workspaceId/invite', authenticateToken, asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { email, firstName, lastName, company, position, department, employeeId, role = 'MEMBER' } = req.body;

  // Check if user exists
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Create user with professional details
    const bcrypt = require('bcryptjs');
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    user = await prisma.user.create({
      data: {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        password: hashedPassword,
        firstName: firstName || email.split('@')[0],
        lastName: lastName || '',
        company,
        position,
        department,
        employeeId,
        role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER',
        isActive: true
      }
    });
  } else {
    // Update existing user with new professional details
    await prisma.user.update({
      where: { id: user.id },
      data: {
        company: company || user.company,
        position: position || user.position,
        department: department || user.department,
        employeeId: employeeId || user.employeeId
      }
    });
  }

  // Check if workspace exists, create if not
  let workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId }
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        id: workspaceId,
        name: 'Default Workspace',
        ownerId: req.user.id
      }
    });
  }

  // Add to workspace
  const membership = await prisma.workspaceMember.create({
    data: {
      id: `wm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      workspaceId,
      role,
      joinedAt: new Date()
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          company: true,
          position: true,
          department: true,
          employeeId: true,
          role: true,
          level: true,
          reputation: true
        }
      }
    }
  });

  // Generate password reset token for new users
  let emailSent = false;
  if (!user) {
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password-setup' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // Send invitation email with password setup link
    try {
      const inviter = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { firstName: true, lastName: true }
      });
      
      await emailService.sendWorkspaceInvitation(user, workspace, inviter, resetToken);
      emailSent = true;
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
    }
  }

  res.status(201).json({
    message: emailSent ? 'Kullanıcı davet edildi ve e-posta gönderildi' : 'Kullanıcı davet edildi',
    membership,
    emailSent
  });
}));

// @route   GET /api/users/badges/available
// @desc    Get available badges list
// @access  Private
router.get('/badges/available', asyncHandler(async (req, res) => {
  res.json({ badges: AVAILABLE_BADGES });
}));

// @route   POST /api/users/:userId/badges
// @desc    Award badge to user (Admin only)
// @access  Private (Admin only)
router.post('/:userId/badges', requireRole(['ADMIN']), asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { badgeId } = req.body;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
  }

  const badge = AVAILABLE_BADGES.find(b => b.id === badgeId);
  if (!badge) {
    return res.status(400).json({ error: 'Geçersiz rozet ID' });
  }

  // Parse existing badges
  let currentBadges = [];
  try {
    if (user.badges) currentBadges = JSON.parse(user.badges);
  } catch (e) {}

  if (currentBadges.includes(badgeId)) {
    return res.status(400).json({ error: 'Kullanıcı bu rozeti zaten sahip' });
  }

  // Add new badge
  currentBadges.push(badgeId);

  // Update user with new badge and increase reputation
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      badges: JSON.stringify(currentBadges),
      reputation: { increment: 50 }
    }
  });

  // Check level up
  const newLevel = Math.floor(updatedUser.reputation / 100) + 1;
  if (newLevel > updatedUser.level) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: newLevel }
    });
  }

  res.json({
    message: `${badge.name} rozet verildi! (+50 puan)`,
    badge,
    newLevel: newLevel > updatedUser.level ? newLevel : undefined
  });
}));

// @route   GET /api/users/:userId/profile
// @desc    Get public profile of any user
// @access  Private
router.get('/:userId/profile', asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatar: true,
      company: true,
      position: true,
      department: true,
      bio: true,
      skills: true,
      experience: true,
      education: true,
      location: true,
      linkedinUrl: true,
      githubUrl: true,
      website: true,
      role: true,
      badges: true,
      level: true,
      reputation: true,
      joinDate: true,
      isOnline: true,
      createdAt: true
    }
  });

  if (!user) {
    return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
  }

  // Parse badges
  let parsedBadges = [];
  try {
    if (user.badges) {
      const badgeIds = JSON.parse(user.badges);
      parsedBadges = badgeIds.map(id => AVAILABLE_BADGES.find(b => b.id === id)).filter(Boolean);
    }
  } catch (e) {}

  // Parse skills
  let parsedSkills = [];
  try {
    if (user.skills) parsedSkills = JSON.parse(user.skills);
  } catch (e) {}

  res.json({
    user: {
      ...user,
      badges: parsedBadges,
      skills: parsedSkills
    }
  });
}));

// @route   GET /api/users/search
// @desc    Search users by name or email
// @access  Private
router.get('/search', asyncHandler(async (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.json({ users: [] });
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        {
          firstName: {
            contains: q,
            mode: 'insensitive'
          }
        },
        {
          lastName: {
            contains: q,
            mode: 'insensitive'
          }
        },
        {
          email: {
            contains: q,
            mode: 'insensitive'
          }
        }
      ]
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      avatar: true,
      company: true,
      position: true
    },
    take: 10
  });

  res.json({ users });
}));

// @route   PUT /api/users/:userId
// @desc    Update user information
// @access  Private
router.put('/:userId', authenticateToken, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName, email, phone, department, role } = req.body;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName,
      lastName,
      email,
      phone,
      department,
      role
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      department: true,
      role: true,
      avatar: true,
      company: true,
      position: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true
    }
  });

  res.json(updatedUser);
}));

// @route   DELETE /api/users/:userId
// @desc    Delete a user
// @access  Private
router.delete('/:userId', authenticateToken, asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Delete user in a transaction to handle foreign key constraints
  await prisma.$transaction(async (tx) => {
    // Delete related records first
    await tx.groupMember.deleteMany({
      where: { userId }
    });
    
    await tx.meetingAttendee.deleteMany({
      where: { userId }
    });
    
    await tx.taskAssignment.deleteMany({
      where: { userId }
    });
    
    await tx.documentShare.deleteMany({
      where: { userId }
    });
    
    await tx.notification.deleteMany({
      where: { userId }
    });
    
    // Delete the user last
    await tx.user.delete({
      where: { id: userId }
    });
  });

  res.json({ message: 'User deleted successfully' });
}));

// @route   GET /api/users/workspace/:workspaceId
// @desc    Get all users in a workspace
// @access  Private
router.get('/workspace/:workspaceId', authenticateToken, asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              department: true,
              role: true,
              avatar: true,
              isActive: true,
              lastLoginAt: true,
              createdAt: true,
              updatedAt: true
            }
          }
        }
      }
    }
  });

  if (!workspace) {
    return res.status(404).json({ error: 'Workspace not found' });
  }

  const users = workspace.members.map(member => ({
    ...member.user,
    workspaceRole: member.role,
    joinedAt: member.joinedAt
  }));

  res.json({ users });
}));

// @route   GET /api/users/:userId/groups
// @desc    Get all groups for a user
// @access  Private
router.get('/:userId/groups', authenticateToken, asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const userGroups = await prisma.groupMember.findMany({
    where: { userId },
    include: {
      group: {
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
          isActive: true,
          createdAt: true
        }
      }
    }
  });

  const groups = userGroups.map(member => ({
    ...member.group,
    role: member.role,
    joinedAt: member.joinedAt
  }));

  res.json({ groups });
}));

module.exports = router;
