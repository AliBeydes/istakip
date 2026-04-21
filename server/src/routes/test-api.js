const express = require('express');
const emailService = require('../services/emailService');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// @route   GET /api/test/email
// @desc    Send test email
router.get('/email', asyncHandler(async (req, res) => {
  const testEmail = req.query.to || 'test@example.com';
  
  // Create mock data for test
  const mockUser = {
    email: testEmail,
    firstName: 'Ali',
    lastName: 'Beydes'
  };
  
  const mockWorkspace = {
    id: '1',
    name: 'Test Workspace',
    ownerId: '1'
  };
  
  const mockInviter = {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com'
  };
  
  // Console'a email içeriğini yazdır (SMTP çalışmasa bile görebilirsiniz)
  console.log('\n📧 ========== EMAIL TEST ==========');
  console.log('To:', testEmail);
  console.log('Subject: 🏢 Workspace Daveti: Test Workspace');
  console.log('Davet Eden:', mockInviter.firstName, mockInviter.lastName);
  console.log('Yetki:', 'Üye');
  console.log('====================================\n');
  
  try {
    const result = await emailService.sendWorkspaceInvitation(
      mockUser,
      mockWorkspace,
      mockInviter,
      'MEMBER'
    );
    
    if (result.success) {
      res.json({ 
        message: 'Test email sent successfully!',
        to: testEmail,
        details: result
      });
    } else {
      res.json({
        message: 'Email logged to console (SMTP failed but content shown above ↑)',
        error: result.error,
        note: 'SMTP ayarlarınızı kontrol edin veya App Password kullanın'
      });
    }
  } catch (error) {
    res.json({
      message: 'Email logged to console (see server terminal above ↑)',
      error: error.message,
      note: 'Console logunda email içeriğini görebilirsiniz'
    });
  }
}));

module.exports = router;
