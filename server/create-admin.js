const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const admin = await prisma.user.create({
      data: {
        id: 'admin_123',
        email: 'admin@istakip.com',
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        isActive: true,
        role: 'ADMIN',
        level: 10,
        reputation: 1000,
        bio: 'Sistem yöneticisi',
        position: 'System Administrator',
        company: 'Istakip',
        department: 'IT',
        employeeId: 'ADM001'
      }
    });

    const workspace = await prisma.workspace.create({
      data: {
        id: '1',
        name: 'Ana Workspace',
        ownerId: admin.id,
        description: 'Ana calisma alani'
      }
    });

    await prisma.workspaceMember.create({
      data: {
        id: 'wm_admin_1',
        userId: admin.id,
        workspaceId: workspace.id,
        role: 'ADMIN',
        joinedAt: new Date()
      }
    });

    console.log('✅ Admin kullanici olusturuldu!');
    console.log('📧 Email: admin@istakip.com');
    console.log('🔑 Sifre: 123456');
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
