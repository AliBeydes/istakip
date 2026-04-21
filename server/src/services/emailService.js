const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  }
});

const calculateDuration = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate - startDate;
  const diffMins = Math.round(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours}h ${mins}m`;
};

const emailService = {
  // Send meeting invitation
  async sendMeetingInvitation(meeting, participant) {
    const mailOptions = {
      from: `"İş Takip Platformu" <${process.env.SMTP_USER || 'noreply@istakip.com'}>`,
      to: participant.email,
      subject: `📅 Toplantı Daveti: ${meeting.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">📅 Toplantı Daveti</h2>
              
              <div style="background: #e3f2fd; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                <h3 style="color: #1e40af; margin: 0 0 10px 0;">${meeting.title}</h3>
                <p style="color: #666; margin: 5px 0;"><strong>Ne Zaman:</strong> ${new Date(meeting.startTime).toLocaleString('tr-TR')}</p>
                <p style="color: #666; margin: 5px 0;"><strong>Nerede:</strong> ${meeting.location || 'Sanal'}</p>
                <p style="color: #666; margin: 5px 0;"><strong>Süre:</strong> ${calculateDuration(meeting.startTime, meeting.endTime)}</p>
                <p style="color: #666; margin: 5px 0;"><strong>Organizatör:</strong> ${meeting.organizer?.firstName} ${meeting.organizer?.lastName}</p>
              </div>
              
              ${meeting.description ? `
              <div style="margin-bottom: 20px;">
                <h4 style="color: #333; margin-bottom: 10px;">Açıklama:</h4>
                <p style="color: #666; line-height: 1.5;">${meeting.description}</p>
              </div>
              ` : ''}
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard?tab=meetings" 
                   style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
                  Toplantıyı Görüntüle
                </a>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
                <p>Bu e-posta İş Takip Platformu tarafından otomatik olarak gönderilmiştir.</p>
              </div>
            </div>
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Invitation email sent to ${participant.email}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to send email to ${participant.email}:`, error);
      return { success: false, error: error.message };
    }
  },

  // Send workspace invitation with password setup link
  async sendWorkspaceInvitation(user, workspace, inviter, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/set-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"İş Takip Platformu" <${process.env.SMTP_USER || 'noreply@istakip.com'}>`,
      to: user.email,
      subject: `🎉 ${workspace.name} Çalışma Alanına Davet Edildiniz`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">🎉 Hoş Geldiniz!</h1>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="color: #333; font-size: 16px;">Merhaba <strong>${user.firstName || user.email}</strong>,</p>
              
              <p style="color: #666; line-height: 1.6;">
                <strong>${inviter.firstName} ${inviter.lastName}</strong> sizi 
                <strong>${workspace.name}</strong> çalışma alanına davet etti.
              </p>
              
              <div style="background: #e3f2fd; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0;">🔐 Şifre Belirleyin</h3>
                <p style="color: #666; margin: 0 0 15px 0;">
                  Hesabınızı aktive etmek için aşağıdaki butona tıklayarak şifrenizi belirleyin:
                </p>
                <div style="text-align: center;">
                  <a href="${resetUrl}" 
                     style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                            color: white; padding: 15px 40px; text-decoration: none; 
                            border-radius: 6px; display: inline-block; font-weight: bold;">
                    Şifremi Belirle
                  </a>
                </div>
                <p style="color: #999; font-size: 12px; margin: 15px 0 0 0; text-align: center;">
                  Bu link 24 saat geçerlidir.
                </p>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                  Bu e-posta İş Takip Platformu tarafından otomatik olarak gönderilmiştir.<br>
                  Eğer bu daveti beklemiyorsanız, lütfen görmezden gelin.
                </p>
              </div>
            </div>
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Invitation email sent to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to send email to ${user.email}:`, error);
      return { success: false, error: error.message };
    }
  },

  // Send meeting invitation to external participants
  async sendMeetingInvitation(meeting, participantEmail, inviter, joinUrl) {
    const mailOptions = {
      from: `"İş Takip Platformu" <${process.env.SMTP_USER || 'noreply@istakip.com'}>`,
      to: participantEmail,
      subject: `📅 Toplantı Daveti: ${meeting.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">📅 Toplantı Daveti</h1>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="color: #333; font-size: 16px;">Merhaba,</p>
              
              <p style="color: #666; line-height: 1.6;">
                <strong>${inviter.firstName} ${inviter.lastName}</strong> sizi 
                <strong>${meeting.title}</strong> toplantısına davet etti.
              </p>
              
              <div style="background: #e3f2fd; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0;">📋 Toplantı Detayları</h3>
                <p style="color: #666; margin: 5px 0;">
                  <strong>Başlık:</strong> ${meeting.title}<br>
                  <strong>Tarih:</strong> ${new Date(meeting.startTime).toLocaleString('tr-TR')}<br>
                  ${meeting.location ? `<strong>Konum:</strong> ${meeting.location}<br>` : ''}
                  ${meeting.description ? `<strong>Açıklama:</strong> ${meeting.description}<br>` : ''}
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${joinUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; padding: 15px 40px; text-decoration: none; 
                          border-radius: 6px; display: inline-block; font-weight: bold;">
                  Toplantıya Katıl
                </a>
              </div>
              
              <p style="color: #999; font-size: 12px; text-align: center;">
                💡 Katılmak için kayıt olmanız gerekmez. Linke tıklayarak doğrudan toplantıya katılabilirsiniz.
              </p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                  Bu e-posta İş Takip Platformu tarafından otomatik olarak gönderilmiştir.
                </p>
              </div>
            </div>
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Meeting invitation sent to ${participantEmail}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to send meeting invitation to ${participantEmail}:`, error);
      return { success: false, error: error.message };
    }
  },

  // Send meeting cancellation
  async sendMeetingCancellation(meeting, participant, reason) {
    const mailOptions = {
      from: `"İş Takip Platformu" <${process.env.SMTP_USER || 'noreply@istakip.com'}>`,
      to: participant.email,
      subject: `❌ Toplantı İptal Edildi: ${meeting.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #dc2626; margin-bottom: 20px;">❌ Toplantı İptal Edildi</h2>
              
              <div style="background: #fee2e2; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                <h3 style="color: #991b1b; margin: 0 0 10px 0;">${meeting.title}</h3>
                <p style="color: #666; margin: 5px 0;"><strong>Planlanan Tarih:</strong> ${new Date(meeting.startTime).toLocaleString('tr-TR')}</p>
                ${reason ? `<p style="color: #666; margin: 5px 0;"><strong>İptal Nedeni:</strong> ${reason}</p>` : ''}
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
                <p>Bu e-posta İş Takip Platformu tarafından otomatik olarak gönderilmiştir.</p>
              </div>
            </div>
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Cancellation email sent to ${participant.email}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to send cancellation email:`, error);
      return { success: false, error: error.message };
    }
  },

  // Send meeting reminder
  async sendMeetingReminder(meeting, participant, timeLabel) {
    const mailOptions = {
      from: `"İş Takip Platformu" <${process.env.SMTP_USER || 'noreply@istakip.com'}>`,
      to: participant.email,
      subject: `⏰ Hatırlatma: "${meeting.title}" ${timeLabel} içinde başlayacak`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #fffbeb; padding: 20px; border-radius: 8px;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #d97706; margin-bottom: 20px;">⏰ Toplantı Hatırlatması</h2>
              
              <div style="background: #fef3c7; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                <h3 style="color: #92400e; margin: 0 0 10px 0;">${meeting.title}</h3>
                <p style="color: #666; margin: 5px 0;"><strong>Başlangıç:</strong> ${new Date(meeting.startTime).toLocaleString('tr-TR')}</p>
                <p style="color: #666; margin: 5px 0;"><strong>Nerede:</strong> ${meeting.location || 'Sanal'}</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard?tab=meetings" 
                   style="background: #d97706; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Toplantıya Git
                </a>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
                <p>Bu e-posta İş Takip Platformu tarafından otomatik olarak gönderilmiştir.</p>
              </div>
            </div>
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Reminder email sent to ${participant.email}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to send reminder email:`, error);
      return { success: false, error: error.message };
    }
  },

  // Send meeting update notification
  async sendMeetingUpdate(meeting, participant) {
    const mailOptions = {
      from: `"İş Takip Platformu" <${process.env.SMTP_USER || 'noreply@istakip.com'}>`,
      to: participant.email,
      subject: `✏️ Toplantı Güncellendi: ${meeting.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #1e40af; margin-bottom: 20px;">✏️ Toplantı Güncellendi</h2>
              
              <div style="background: #dbeafe; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                <h3 style="color: #1e40af; margin: 0 0 10px 0;">${meeting.title}</h3>
                <p style="color: #666; margin: 5px 0;"><strong>Yeni Tarih:</strong> ${new Date(meeting.startTime).toLocaleString('tr-TR')}</p>
                <p style="color: #666; margin: 5px 0;"><strong>Nerede:</strong> ${meeting.location || 'Sanal'}</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard?tab=meetings" 
                   style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Güncellemeleri Görüntüle
                </a>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
                <p>Bu e-posta İş Takip Platformu tarafından otomatik olarak gönderilmiştir.</p>
              </div>
            </div>
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Update email sent to ${participant.email}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to send update email:`, error);
      return { success: false, error: error.message };
    }
  },

  // Send workspace invitation email
  async sendWorkspaceInvitation(user, workspace, inviter, role) {
    const roleLabels = {
      'ADMIN': 'Yönetici',
      'MANAGER': 'Moderatör',
      'MEMBER': 'Üye'
    };

    const roleDescriptions = {
      'ADMIN': 'Tüm workspace\'i yönetebilir, kullanıcı ekleyip çıkarabilir',
      'MANAGER': 'Görev ve toplantı yönetimi yapabilir',
      'MEMBER': 'Kendi görevlerini görüntüleyebilir ve toplantılara katılabilir'
    };

    const mailOptions = {
      from: `"İş Takip Platformu" <${process.env.SMTP_USER || 'noreply@istakip.com'}>`,
      to: user.email,
      subject: `🏢 Workspace Daveti: ${workspace.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">🏢 Workspace Daveti</h2>
              
              <div style="background: #e8f5e9; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                <h3 style="color: #2e7d32; margin: 0 0 10px 0;">${workspace.name}</h3>
                <p style="color: #666; margin: 5px 0;"><strong>Davet Eden:</strong> ${inviter.firstName} ${inviter.lastName}</p>
                <p style="color: #666; margin: 5px 0;"><strong>Email:</strong> ${inviter.email}</p>
                <p style="color: #666; margin: 5px 0;"><strong>Yetki:</strong> ${roleLabels[role] || role}</p>
              </div>
              
              <div style="background: #fff3e0; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <p style="color: #e65100; margin: 0; font-size: 14px;">
                  <strong>🔐 Yetki Açıklaması:</strong><br/>
                  ${roleDescriptions[role] || ''}
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard" 
                   style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Workspace\'e Git
                </a>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
                <p>Bu e-posta İş Takip Platformu tarafından otomatik olarak gönderilmiştir.</p>
                <p>Eğer bu daveti beklemiyorsanız, lütfen dikkate almayın.</p>
              </div>
            </div>
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Workspace invitation email sent to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to send workspace invitation email:`, error);
      return { success: false, error: error.message };
    }
  },

  // Test email configuration
  async testEmailConfiguration() {
    const testMailOptions = {
      from: `"İş Takip Platformu" <${process.env.SMTP_USER || 'noreply@istakip.com'}>`,
      to: process.env.SMTP_USER, // Send test to the same email
      subject: '✅ Gmail SMTP Test - İş Takip Platformu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #e8f5e9; padding: 20px; border-radius: 8px;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #2e7d32; margin-bottom: 20px;">✅ Gmail SMTP Test Başarılı!</h2>
              
              <div style="background: #f1f8e9; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                <p style="color: #33691e; margin: 5px 0;"><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</p>
                <p style="color: #33691e; margin: 5px 0;"><strong>SMTP Port:</strong> ${process.env.SMTP_PORT}</p>
                <p style="color: #33691e; margin: 5px 0;"><strong>Gönderen Email:</strong> ${process.env.SMTP_USER}</p>
                <p style="color: #33691e; margin: 5px 0;"><strong>Tarih:</strong> ${new Date().toLocaleString('tr-TR')}</p>
              </div>
              
              <div style="background: #fff3e0; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <p style="color: #e65100; margin: 0; font-size: 14px;">
                  <strong>🎉 Tebrikler!</strong><br/>
                  Gmail SMTP konfigürasyonunuz başarıyla çalışıyor. Artık İş Takip Platformu'ndan email gönderimlerini kullanabilirsiniz.
                </p>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
                <p>Bu e-posta İş Takip Platformu Gmail SMTP testi tarafından otomatik olarak gönderilmiştir.</p>
              </div>
            </div>
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(testMailOptions);
      console.log('✅ Gmail SMTP test email sent successfully');
      return { success: true, message: 'Test email sent successfully' };
    } catch (error) {
      console.error('❌ Gmail SMTP test failed:', error);
      return { success: false, error: error.message };
    }
  }
};

module.exports = emailService;
