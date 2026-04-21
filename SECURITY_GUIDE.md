# 🔒 Çok Kiracılı (Multi-Tenant) Güvenlik Rehberi

## Özet: Firmalar Birbirlerini Göremez!

```
┌─────────────────────────────────────────────────────────────────┐
│                    VERİ İZOLASYONU GARANTİSİ                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ❌ ASLA YAPMAYACAĞIZ:                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  SELECT * FROM tasks  // HATA! Tüm görevleri getirir      ││
│  │  SELECT * FROM users   // HATA! Tüm kullanıcıları getirir ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ✅ HER ZAMAN YAPACAĞIZ:                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  SELECT * FROM tasks WHERE workspaceId = ?                ││
│  │  SELECT * FROM users WHERE workspaceId = ?                 ││
│  │  SELECT * FROM documents WHERE workspaceId = ?             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  🔐 HER API ÇAĞRISINDA:                                         │
│  • Token'dan userId çöz                                        │
│  • userId'den workspaceId bul                                   │
│  • Sorguya workspaceId = ? ekle                                │
│  • Başka workspace verisi GÖSTERME!                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Backend Güvenlik Katmanı

### API Middleware (Her Request'te Çalışır)

```javascript
// /server/middleware/tenantIsolation.js

const validateWorkspaceAccess = async (req, res, next) => {
  try {
    // 1. Token'dan kullanıcı bilgisini al
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token gerekli' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    
    // 2. Kullanıcının workspace'ini bul
    const user = await db.users.findUnique({
      where: { id: userId },
      include: { workspace: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    // 3. Request'e workspace bilgisini ekle
    req.workspaceId = user.workspaceId;
    req.userRole = user.role;
    req.userId = userId;
    
    // 4. Super admin kontrolü (senin için)
    if (user.email === 'admin@istakip.com') {
      req.isSuperAdmin = true;
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Geçersiz token' });
  }
};

// Tüm API route'larına uygula
app.use('/api', validateWorkspaceAccess);
```

---

## 2. Veri Erişim Kontrolü

### Repository Pattern (Her Model İçin)

```javascript
// /server/repositories/TaskRepository.js

class TaskRepository {
  // ✅ DOĞRU: Workspace izolasyonlu
  async findAll(workspaceId, filters = {}) {
    return await db.tasks.findMany({
      where: {
        workspaceId: workspaceId,  // 🔒 KESİNLİKLE EKLENMELİ
        ...filters
      },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
            // 🔒 SADECE GEREKLİ ALANLAR
          }
        }
      }
    });
  }
  
  // ✅ DOĞRU: Tek kayıt erişimi
  async findById(taskId, workspaceId) {
    const task = await db.tasks.findFirst({
      where: {
        id: taskId,
        workspaceId: workspaceId  // 🔒 MUTLAKA KONTROL ET
      }
    });
    
    if (!task) {
      throw new Error('Görev bulunamadı veya erişim yetkiniz yok');
    }
    
    return task;
  }
  
  // ✅ DOĞRU: Yeni kayıt oluşturma
  async create(data, workspaceId, creatorId) {
    return await db.tasks.create({
      data: {
        ...data,
        workspaceId: workspaceId,  // 🔒 OTOMATİK EKLE
        creatorId: creatorId
      }
    });
  }
  
  // ✅ DOĞRU: Güncelleme
  async update(taskId, data, workspaceId) {
    // Önce erişim kontrolü
    await this.findById(taskId, workspaceId);
    
    return await db.tasks.update({
      where: { id: taskId },
      data
    });
  }
  
  // ✅ DOĞRU: Silme
  async delete(taskId, workspaceId) {
    // Önce erişim kontrolü
    await this.findById(taskId, workspaceId);
    
    return await db.tasks.delete({
      where: { id: taskId }
    });
  }
}

// Kullanım
const taskRepo = new TaskRepository();

// Route handler
app.get('/api/tasks', async (req, res) => {
  // req.workspaceId middleware'den gelir
  const tasks = await taskRepo.findAll(req.workspaceId, {
    status: req.query.status
  });
  res.json({ tasks });
});
```

---

## 3. Rol Bazlı Yetkilendirme (RBAC)

```javascript
// /server/middleware/authorization.js

const ROLES = {
  SUPER_ADMIN: ['*'],  // Tüm yetkiler
  
  WORKSPACE_ADMIN: [
    'workspace:read',
    'workspace:update',
    'workspace:delete',
    'user:create',
    'user:read',
    'user:update',
    'user:delete',
    'task:all',
    'document:all',
    'analytics:all'
  ],
  
  MANAGER: [
    'workspace:read',
    'user:read',
    'user:create',  // Sadece USER rolünde
    'task:create',
    'task:read',
    'task:update',
    'task:assign',
    'document:read',
    'document:create',
    'analytics:read'
  ],
  
  USER: [
    'workspace:read',
    'task:read',      // Sadece kendine atanan
    'task:update',    // Sadece kendi görevlerini güncelle
    'document:read',
    'document:create'
  ]
};

const checkPermission = (permission) => {
  return (req, res, next) => {
    const userRole = req.userRole;
    const isSuperAdmin = req.isSuperAdmin;
    
    // Super admin her şeyi yapabilir
    if (isSuperAdmin) {
      return next();
    }
    
    const permissions = ROLES[userRole] || [];
    
    if (permissions.includes('*') || permissions.includes(permission)) {
      next();
    } else {
      res.status(403).json({ 
        error: 'Yetkisiz erişim',
        required: permission,
        yourRole: userRole
      });
    }
  };
};

// Kullanım
app.post('/api/tasks', 
  checkPermission('task:create'),
  async (req, res) => {
    // Sadece yetkisi olanlar buraya ulaşır
  }
);

app.delete('/api/users/:id',
  checkPermission('user:delete'),
  async (req, res) => {
    // Sadece adminler kullanıcı silebilir
  }
);
```

---

## 4. Veri Sızıntısı Testleri

### Güvenlik Test Senaryoları

```javascript
// /tests/security/tenantIsolation.test.js

describe('Workspace İzolasyonu', () => {
  let workspace1_user, workspace2_user;
  
  beforeAll(async () => {
    // Workspace 1 kullanıcısı
    workspace1_user = await createUser({
      email: 'user1@firma1.com',
      workspaceId: 'workspace_1'
    });
    
    // Workspace 2 kullanıcısı
    workspace2_user = await createUser({
      email: 'user2@firma2.com',
      workspaceId: 'workspace_2'
    });
    
    // Her workspace'e görev ekle
    await createTask({ title: 'Firma 1 Görevi', workspaceId: 'workspace_1' });
    await createTask({ title: 'Firma 2 Görevi', workspaceId: 'workspace_2' });
  });
  
  test('Kullanıcı kendi workspace görevlerini görmeli', async () => {
    const token = generateToken(workspace1_user);
    
    const response = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.body.tasks).toHaveLength(1);
    expect(response.body.tasks[0].title).toBe('Firma 1 Görevi');
  });
  
  test('Kullanıcı başka workspace görevini görememeli', async () => {
    const token = generateToken(workspace1_user);
    
    // Firma 2'nin görev ID'sini bilse bile erişememeli
    const response = await request(app)
      .get('/api/tasks?taskId=firma2_task_id')
      .set('Authorization', `Bearer ${token}`);
    
    // Ya boş dönmeli ya da 403
    expect(response.status).toBe(403);
    // VEYA
    // expect(response.body.tasks).toHaveLength(0);
  });
  
  test('Manuel workspaceId injection engellenmeli', async () => {
    const token = generateToken(workspace1_user);
    
    // Kötü niyetli istek: başka workspaceId göndermeye çalış
    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Yeni Görev',
        workspaceId: 'workspace_2'  // 🔴 Enjekte etmeye çalış
      });
    
    // Middleware req.workspaceId'yi override etmeli
    const createdTask = await db.tasks.findFirst({
      where: { title: 'Yeni Görev' }
    });
    
    expect(createdTask.workspaceId).toBe('workspace_1');  // Kendi workspace'i
    expect(createdTask.workspaceId).not.toBe('workspace_2');
  });
});
```

---

## 5. Frontend Güvenlik Katmanı

### Hata Yakalama ve Yönlendirme

```javascript
// /hooks/useSecureApi.js

import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

export function useSecureApi() {
  const logout = useAuthStore(state => state.logout);
  
  const handleApiError = (error) => {
    if (error.response?.status === 403) {
      toast.error('Bu işlem için yetkiniz yok');
      return;
    }
    
    if (error.response?.status === 401) {
      toast.error('Oturumunuz sona erdi, lütfen tekrar giriş yapın');
      logout();
      return;
    }
    
    if (error.response?.data?.error?.includes('workspace')) {
      toast.error('Firma erişim hatası. Sayfayı yenileyin.');
      return;
    }
    
    // Diğer hatalar
    toast.error(error.response?.data?.error || 'Bir hata oluştu');
  };
  
  return { handleApiError };
}

// Bileşen içinde kullanım
const MyComponent = () => {
  const { handleApiError } = useSecureApi();
  
  const fetchData = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data.tasks);
    } catch (error) {
      handleApiError(error);
    }
  };
};
```

---

## 6. Güvenlik Kontrol Listesi

### Deployment Öncesi Kontroller

```bash
✅ KOD KONTROLÜ
□ Tüm SQL sorgularında workspaceId filtresi var mı?
□ findById metodları workspaceId kontrolü yapıyor mu?
□ Super admin kontrolü eklenmiş mi?
□ Token expiration süresi uygun mu (15 dk)?

✅ API GÜVENLİĞİ
□ Tüm /api/* route'larında middleware çalışıyor mu?
□ CORS ayarları sadece izinli domainlere izin veriyor mu?
□ Rate limiting eklenmiş mi (100 req/dk)?
□ SQL Injection koruması var mı (prepared statements)?

✅ VERİ GÜVENLİĞİ
□ Şifreler bcrypt ile hashleniyor mu?
□ API response'larında password alanı yok mu?
□ File upload limitleri ve tip kontrolü var mı?
□ Backup şifrelemesi yapılıyor mu?

✅ LOGLAMA
□ Tüm yetkisiz erişim denemeleri loglanıyor mu?
□ Başarısız login denemeleri loglanıyor mu?
□ Admin işlemleri ayrı logda tutuluyor mu?
```

---

## 7. Örnek: Tam Güvenlik Akışı

```
┌─────────────────────────────────────────────────────────────────┐
│  KULLANICI GÖREV LİSTESİ İSTEYİNCE NE OLUYOR?                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. İSTEK                                                        │
│     GET /api/tasks                                               │
│     Authorization: Bearer eyJhbGciOiJIUzI1NiIs...             │
│                                                                  │
│  2. MIDDLEWARE KONTROLÜ                                          │
│     ├─ Token geçerli mi? ✅                                      │
│     ├─ Token süresi dolmuş mu? ✅                               │
│     ├─ userId çöz: 123                                          │
│     └─ workspaceId bul: "ws_abc123"                            │
│                                                                  │
│  3. YETKİ KONTROLÜ                                               │
│     ├─ userRole: "USER"                                         │
│     ├─ Gerekli yetki: "task:read" ✅                            │
│     └─ Yetki var, devam et                                       │
│                                                                  │
│  4. VERİ SORGUSU                                                 │
│     SELECT * FROM tasks                                          │
│     WHERE workspaceId = "ws_abc123"  ← 🔒 İZOLASYON             │
│     AND (assigneeId = 123 OR creatorId = 123)                   │
│                                                                  │
│  5. RESPONSE                                                     │
│     {                                                            │
│       tasks: [...]  // Sadece kendi workspace görevleri         │
│     }                                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚨 Kritik Güvenlik Uyarıları

```
❌ ASLA YAPMA:
1. API response'ında başka kullanıcının şifresini gösterme
2. IDOR (Insecure Direct Object Reference): /api/tasks/123
   → 123 ID'li görev başka workspace'te olabilir, kontrol et!
3. Mass Assignment: req.body direkt DB'ye yazma
4. NoSQL Injection: { $where: "this.password == '123'" }
5. CORS * (herkese izin verme)

✅ HER ZAMAN YAP:
1. Principle of Least Privilege (En az yetki prensibi)
2. Defense in Depth (Çok katmanlı savunma)
3. Input validation (Gelen veriyi doğrula)
4. Output encoding (XSS koruması)
5. Security headers (Helmet, CSP)
```

---

Bu güvenlik katmanı sayesinde:
- ✅ Her firma kendi verisini görür
- ✅ Firmalar birbirlerini görmez
- ✅ Adminler kendi firmalarını yönetir
- ✅ Sadece sen (Super Admin) tümünü görebilirsin

Hazır mısınız? Kuruluma başlayalım mı? 🔒
