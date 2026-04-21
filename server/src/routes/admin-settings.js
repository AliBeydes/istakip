const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const prisma = new PrismaClient();

// Settings file path
const SETTINGS_FILE = path.join(__dirname, '../../config', 'admin-settings.json');

// Ensure config directory exists
const configDir = path.join(__dirname, '../../config');
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

// Default settings
const defaultSettings = {
  email: {
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
    fromEmail: 'noreply@istakip.com',
    fromName: 'İş Takip Platformu'
  },
  websocket: {
    port: '3001',
    corsOrigins: 'http://localhost:3000,http://127.0.0.1:3000',
    pingInterval: '25000',
    pingTimeout: '20000'
  },
  system: {
    appName: 'İş Takip Platformu',
    maxFileSize: '10',
    sessionTimeout: '7',
    enableRegistration: true,
    enableNotifications: true,
    maintenanceMode: false
  }
};

// Load settings from file
const loadSettings = () => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return defaultSettings;
};

// Save settings to file
const saveSettingsToFile = (settings) => {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

// Update .env file
const updateEnvFile = (settings) => {
  try {
    const envPath = path.join(__dirname, '../../.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Parse existing env
    const envLines = envContent.split('\n');
    const envMap = {};
    envLines.forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        envMap[match[1].trim()] = match[2].trim();
      }
    });

    // Update with new settings
    if (settings.email) {
      envMap.SMTP_HOST = settings.email.smtpHost || envMap.SMTP_HOST || 'smtp.gmail.com';
      envMap.SMTP_PORT = settings.email.smtpPort || envMap.SMTP_PORT || '587';
      envMap.SMTP_USER = settings.email.smtpUser || envMap.SMTP_USER || '';
      envMap.SMTP_PASS = settings.email.smtpPass || envMap.SMTP_PASS || '';
    }

    if (settings.websocket) {
      envMap.PORT = settings.websocket.port || envMap.PORT || '3001';
    }

    // Rebuild env content
    const newEnvContent = Object.entries(envMap)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    fs.writeFileSync(envPath, newEnvContent);
    return true;
  } catch (error) {
    console.error('Error updating .env:', error);
    return false;
  }
};

// @route   GET /api/admin/settings
// @desc    Get admin settings
// @access  Private (Admin only)
router.get('/', asyncHandler(async (req, res) => {
  // Check if user is admin
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId: req.user.id,
      role: 'ADMIN'
    }
  });

  if (!membership && req.user.email !== 'admin@istakip.com') {
    return res.status(403).json({ error: 'Access denied: Admin only' });
  }

  const settings = loadSettings();
  
  // Hide sensitive data in response
  const safeSettings = {
    ...settings,
    email: {
      ...settings.email,
      smtpPass: settings.email.smtpPass ? '••••••••' : ''
    }
  };

  res.json({
    success: true,
    settings: safeSettings
  });
}));

// @route   POST /api/admin/settings
// @desc    Update admin settings
// @access  Private (Admin only)
router.post('/', asyncHandler(async (req, res) => {
  // Check if user is admin
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId: req.user.id,
      role: 'ADMIN'
    }
  });

  if (!membership && req.user.email !== 'admin@istakip.com') {
    return res.status(403).json({ error: 'Access denied: Admin only' });
  }

  const currentSettings = loadSettings();
  const newSettings = {
    ...currentSettings,
    ...req.body
  };

  // If password is masked (••••), keep old password
  if (newSettings.email?.smtpPass === '••••••••') {
    newSettings.email.smtpPass = currentSettings.email.smtpPass;
  }

  // Save to file
  if (!saveSettingsToFile(newSettings)) {
    return res.status(500).json({ error: 'Failed to save settings' });
  }

  // Update .env file
  updateEnvFile(newSettings);

  res.json({
    success: true,
    message: 'Settings saved successfully',
    settings: {
      ...newSettings,
      email: {
        ...newSettings.email,
        smtpPass: newSettings.email.smtpPass ? '••••••••' : ''
      }
    }
  });
}));

// @route   POST /api/admin/settings/test-email
// @desc    Test email connection
// @access  Private (Admin only)
router.post('/test-email', asyncHandler(async (req, res) => {
  // Check if user is admin
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId: req.user.id,
      role: 'ADMIN'
    }
  });

  if (!membership && req.user.email !== 'admin@istakip.com') {
    return res.status(403).json({ error: 'Access denied: Admin only' });
  }

  const { smtpHost, smtpPort, smtpUser, smtpPass, fromEmail, fromName } = req.body;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    return res.status(400).json({ error: 'Missing required email settings' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    // Verify connection
    await transporter.verify();

    // Send test email
    await transporter.sendMail({
      from: `"${fromName || 'Test'}" <${fromEmail || smtpUser}>`,
      to: smtpUser,
      subject: 'İş Takip - Email Test',
      html: `
        <h2>Email Bağlantı Testi Başarılı!</h2>
        <p>Bu bir test emailidir. SMTP ayarlarınız doğru yapılandırılmış.</p>
        <p>Tarih: ${new Date().toLocaleString('tr-TR')}</p>
      `
    });

    res.json({
      success: true,
      message: 'Email connection successful. Test email sent.'
    });
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({
      error: 'Email connection failed: ' + error.message
    });
  }
}));

module.exports = router;
