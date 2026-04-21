const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phone: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Generate JWT token
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Set HTTP-only cookie
const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(d => d.message)
    });
  }

  const { email, password, firstName, lastName, phone } = value;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return res.status(400).json({
      error: 'User already exists',
      message: 'An account with this email already exists'
    });
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: 'ADMIN'
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatar: true,
      createdAt: true
    }
  });

  // Create demo workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: `${firstName}'in Çalışma Alanı`,
      description: 'Demo çalışma alanı',
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: 'ADMIN'
        }
      }
    }
  });

  // Create demo tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'İlk görevinizi oluşturun',
        description: 'Taskera kullanmaya başlamak için ilk görevinizi ekleyin',
        status: 'TODO',
        priority: 'HIGH',
        workspaceId: workspace.id,
        creatorId: user.id
      },
      {
        title: 'Ekip üyelerini davet edin',
        description: 'Takımınızı büyütün',
        status: 'TODO',
        priority: 'MEDIUM',
        workspaceId: workspace.id,
        creatorId: user.id
      }
    ]
  });

  // Create demo automation rule
  await prisma.automationRule.create({
    data: {
      name: '🎉 Demo: Görev tamamlandığında bildirim gönder',
      description: 'Bir görev "Tamamlandı" durumuna geçtiğinde otomatik olarak bildirim gönderir. Bu örnek bir otomasyon kuralıdır.',
      trigger: 'TASK_COMPLETED',
      action: 'SEND_NOTIFICATION',
      actionData: JSON.stringify({ message: 'Görev başarıyla tamamlandı! 🎉' }),
      workspaceId: workspace.id,
      creatorId: user.id,
      isActive: true
    }
  });

  // Create demo task template
  await prisma.taskTemplate.create({
    data: {
      name: '📋 Demo: Haftalık Rapor Şablonu',
      description: 'Haftalık ilerleme raporu için hazır şablon',
      defaultTitle: 'Haftalık İlerleme Raporu',
      defaultDescription: 'Bu hafta tamamlanan görevler ve ilerleme durumu',
      defaultPriority: 'MEDIUM',
      defaultStatus: 'TODO',
      estimatedHours: 2,
      workspaceId: workspace.id,
      creatorId: user.id,
      isActive: true
    }
  });

  // Generate token
  const token = generateToken(user.id);

  // Set cookie
  setAuthCookie(res, token);

  // Update last login and set online status
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      lastLoginAt: new Date(),
      isOnline: true 
    }
  });

  res.status(201).json({
    message: 'User registered successfully',
    user,
    workspace,
    token
  });
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(d => d.message)
    });
  }

  const { email, password } = value;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      firstName: true,
      lastName: true,
      avatar: true,
      isActive: true,
      lastLoginAt: true,
      workspaceMembers: {
        select: {
          id: true,
          userId: true,
          workspaceId: true,
          role: true,
          joinedAt: true
        }
      },
      ownedWorkspaces: {
        select: {
          id: true,
          name: true,
          ownerId: true
        }
      }
    }
  });

  if (!user) {
    return res.status(401).json({
      error: 'Invalid credentials',
      message: 'Email or password is incorrect'
    });
  }

  if (!user.isActive) {
    return res.status(401).json({
      error: 'Account disabled',
      message: 'Your account has been disabled'
    });
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      error: 'Invalid credentials',
      message: 'Email or password is incorrect'
    });
  }

  // Generate token
  const token = generateToken(user.id);

  // Set cookie
  setAuthCookie(res, token);

  // Update last login and set online status
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      lastLoginAt: new Date(),
      isOnline: true 
    }
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    message: 'Login successful',
    user: userWithoutPassword,
    token
  });
}));

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  // Set user offline
  await prisma.user.update({
    where: { id: req.user.id },
    data: { isOnline: false }
  });
  
  res.clearCookie('token');
  res.json({
    message: 'Logout successful'
  });
}));

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', asyncHandler(async (req, res) => {
  // This route will be protected by authenticateToken middleware
  // The user object will be attached to req.user by the middleware
  res.json({
    user: req.user
  });
}));

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Validate input
  const schema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
  });

  const { error } = schema.validate({ currentPassword, newPassword });
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(d => d.message)
    });
  }

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { password: true }
  });

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      error: 'Invalid password',
      message: 'Current password is incorrect'
    });
  }

  // Hash new password
  const saltRounds = 12;
  const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

  // Update password
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashedNewPassword }
  });

  res.json({
    message: 'Password changed successfully'
  });
}));

// @route   POST /api/auth/set-password
// @desc    Set password for invited users (password setup)
// @access  Public (with valid token)
router.post('/set-password', asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    if (decoded.type !== 'password-setup') {
      return res.status(400).json({ error: 'Invalid token type' });
    }

    const userId = decoded.userId;

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user password
    await prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedPassword,
        isActive: true 
      }
    });

    res.json({
      message: 'Password set successfully. You can now login.'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Token expired. Please request a new invitation.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Invalid token' });
    }
    throw error;
  }
}));

module.exports = router;
