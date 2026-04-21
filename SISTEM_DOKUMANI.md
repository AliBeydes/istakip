# İşTakip Sistemi - Teknik Dokümantasyon

## 📋 İçindekiler
1. [Sistem Genel Bakış](#1-sistem-genel-bakış)
2. [Mimari Yapı](#2-mimari-yapı)
3. [Veritabanı Şeması](#3-veritabanı-şeması)
4. [API Endpoints](#4-api-endpoints)
5. [Frontend Yapısı](#5-frontend-yapısı)
6. [State Management](#6-state-management)
7. [Kimlik Doğrulama Akışı](#7-kimlik-doğrulama-akışı)
8. [Veri Akışı Diyagramları](#8-veri-akışı-diyagramları)
9. [Bileşen İlişkileri](#9-bileşen-i̇lişkileri)

---

## 1. Sistem Genel Bakış

### 1.1 Teknoloji Yığını
```
Frontend:        Next.js 14 (App Router) + React 18 + Tailwind CSS
State:           Zustand (Client-side) + React Query (Server-side)
UI Library:      shadcn/ui + Radix UI
Animation:       Framer Motion
Icons:           Lucide React
HTTP Client:     Axios

Backend:         (Harici API - Laravel/Symfony)
Authentication:  JWT Token (Access + Refresh)
```

### 1.2 Proje Yapısı
```
/Users/tureks/Desktop/Istakip/client/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # Ana dashboard sayfası
│   │   ├── login/              # Giriş sayfası
│   │   ├── layout.jsx          # Root layout
│   │   └── page.jsx            # Landing page
│   │
│   ├── components/             # React bileşenleri
│   │   ├── ProfessionalOverview.jsx    # Ana dashboard görünümü
│   │   ├── UserManagement.jsx          # Kullanıcı yönetimi
│   │   ├── TaskDashboard.jsx           # Görev yönetimi
│   │   ├── MessagesSection.jsx         # Mesajlaşma
│   │   ├── DocumentDashboard.jsx       # Döküman yönetimi
│   │   ├── NotesDashboard.jsx          # Notlar
│   │   ├── CalendarDashboard.jsx       # Takvim
│   │   ├── AnalyticsDashboard.jsx      # Analitikler
│   │   ├── AdminPanel.jsx              # Admin paneli
│   │   └── UserProfile.jsx             # Profil sayfası
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useSimpleTranslation.js   # Çeviri sistemi
│   │   └── useAuth.js                  # Auth hook
│   │
│   ├── lib/                    # Yardımcı fonksiyonlar
│   │   ├── api.js              # API client
│   │   └── utils.js            # Utilities
│   │
│   └── store/                  # Zustand stores
│       └── authStore.js        # Authentication store
│
├── public/                     # Statik dosyalar
└── package.json
```

---

## 2. Mimari Yapı

### 2.1 Katmanlı Mimari
```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────────────┐ │
│  │  Dashboard   │ │  Components  │ │  UI Components      │ │
│  │  Page        │ │  (25+ comp)  │ │  (shadcn/ui)        │ │
│  └──────┬───────┘ └──────┬───────┘ └──────────┬────────────┘ │
└─────────┼────────────────┼────────────────────┼──────────────┘
          │                │                    │
          ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                          │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │   Zustand       │  │   React Hooks   │                   │
│  │   Stores        │  │   (useState)    │                   │
│  │                 │  │                 │                   │
│  │  • authStore    │  │  • Component    │                   │
│  │  • local state  │  │    state        │                   │
│  └────────┬────────┘  └─────────────────┘                   │
└───────────┼───────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   Axios Client                        │  │
│  │  • Base URL: process.env.NEXT_PUBLIC_API_URL         │  │
│  │  • Interceptors: Auth headers + Error handling       │  │
│  └─────────────────────────┬──────────────────────────────┘  │
└────────────────────────────┼──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API                             │
│         (Harici REST API - Laravel/Symfony)                │
│              https://task.agudo.net/api/                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Veri Akış Deseni
```
1. User Action → Component Event Handler
2. API Call → Axios → Backend
3. Response → State Update (Zustand/useState)
4. Re-render → UI Update
```

---

## 3. Veritabanı Şeması

### 3.1 Temel Varlıklar

```sql
-- USERS (Kullanıcılar)
┌────────────────────────────────────────────────────────────┐
│  users                                                      │
├────────────────────────────────────────────────────────────┤
│  id (PK)           │ BIGINT      │ AUTO_INCREMENT          │
│  email             │ VARCHAR(255)│ UNIQUE, NOT NULL        │
│  password          │ VARCHAR(255)│ HASHED                  │
│  firstName         │ VARCHAR(100)│                         │
│  lastName          │ VARCHAR(100)│                         │
│  role              │ ENUM        │ ADMIN/MANAGER/USER      │
│  isActive          │ BOOLEAN     │ DEFAULT true            │
│  isOnline          │ BOOLEAN     │ DEFAULT false           │
│  avatar            │ VARCHAR(255)│ NULL                    │
│  phone             │ VARCHAR(20) │ NULL                    │
│  department        │ VARCHAR(100)│ NULL                    │
│  position          │ VARCHAR(100)│ NULL                    │
│  createdAt         │ TIMESTAMP   │ DEFAULT NOW()           │
│  updatedAt         │ TIMESTAMP   │ ON UPDATE               │
└────────────────────────────────────────────────────────────┘

-- WORKSPACES (Çalışma Alanları)
┌────────────────────────────────────────────────────────────┐
│  workspaces                                                 │
├────────────────────────────────────────────────────────────┤
│  id (PK)           │ BIGINT      │ AUTO_INCREMENT          │
│  name              │ VARCHAR(255)│ NOT NULL                │
│  description       │ TEXT        │ NULL                    │
│  ownerId (FK)      │ BIGINT      │ → users.id              │
│  createdAt         │ TIMESTAMP   │ DEFAULT NOW()           │
└────────────────────────────────────────────────────────────┘

-- WORKSPACE_USERS (Çok-çok ilişki)
┌────────────────────────────────────────────────────────────┐
│  workspace_users                                            │
├────────────────────────────────────────────────────────────┤
│  workspaceId (FK)  │ BIGINT      │ → workspaces.id         │
│  userId (FK)       │ BIGINT      │ → users.id              │
│  role              │ ENUM        │ MEMBER/ADMIN            │
│  joinedAt          │ TIMESTAMP   │ DEFAULT NOW()           │
└────────────────────────────────────────────────────────────┘

-- TASKS (Görevler)
┌────────────────────────────────────────────────────────────┐
│  tasks                                                      │
├────────────────────────────────────────────────────────────┤
│  id (PK)           │ BIGINT      │ AUTO_INCREMENT          │
│  title             │ VARCHAR(255)│ NOT NULL                │
│  description       │ TEXT        │ NULL                    │
│  status            │ ENUM        │ TODO/IN_PROGRESS/       │
│                    │             │ REVIEW/DONE             │
│  priority          │ ENUM        │ LOW/MEDIUM/HIGH/URGENT  │
│  creatorId (FK)    │ BIGINT      │ → users.id              │
│  assigneeId (FK)   │ BIGINT      │ → users.id (NULL)       │
│  workspaceId (FK)  │ BIGINT      │ → workspaces.id         │
│  dueDate           │ DATETIME    │ NULL                    │
│  completedAt       │ DATETIME    │ NULL                    │
│  createdAt         │ TIMESTAMP   │ DEFAULT NOW()           │
│  updatedAt         │ TIMESTAMP   │ ON UPDATE               │
└────────────────────────────────────────────────────────────┘

-- DOCUMENTS (Dökümanlar)
┌────────────────────────────────────────────────────────────┐
│  documents                                                  │
├────────────────────────────────────────────────────────────┤
│  id (PK)           │ BIGINT      │ AUTO_INCREMENT          │
│  title             │ VARCHAR(255)│ NOT NULL                │
│  type              │ ENUM        │ PDF/DOC/IMAGE/OTHER     │
│  fileUrl           │ VARCHAR(500)│ NOT NULL                │
│  size              │ INTEGER     │ Bytes                   │
│  uploadedBy (FK)   │ BIGINT      │ → users.id              │
│  workspaceId (FK)  │ BIGINT      │ → workspaces.id         │
│  createdAt         │ TIMESTAMP   │ DEFAULT NOW()           │
└────────────────────────────────────────────────────────────┘

-- MESSAGES (Mesajlar)
┌────────────────────────────────────────────────────────────┐
│  messages                                                   │
├────────────────────────────────────────────────────────────┤
│  id (PK)           │ BIGINT      │ AUTO_INCREMENT          │
│  content           │ TEXT        │ NOT NULL                │
│  senderId (FK)     │ BIGINT      │ → users.id              │
│  receiverId (FK)   │ BIGINT      │ → users.id (NULL)       │
│  groupId (FK)      │ BIGINT      │ → groups.id (NULL)      │
│  isRead            │ BOOLEAN     │ DEFAULT false           │
│  createdAt         │ TIMESTAMP   │ DEFAULT NOW()           │
└────────────────────────────────────────────────────────────┘

-- NOTES (Notlar)
┌────────────────────────────────────────────────────────────┐
│  notes                                                      │
├────────────────────────────────────────────────────────────┤
│  id (PK)           │ BIGINT      │ AUTO_INCREMENT          │
│  title             │ VARCHAR(255)│                         │
│  content           │ TEXT        │                         │
│  userId (FK)       │ BIGINT      │ → users.id              │
│  isPinned          │ BOOLEAN     │ DEFAULT false           │
│  tags              │ JSON        │ []                      │
│  createdAt         │ TIMESTAMP   │ DEFAULT NOW()           │
│  updatedAt         │ TIMESTAMP   │ ON UPDATE               │
└────────────────────────────────────────────────────────────┘

-- EVENTS (Takvim Olayları)
┌────────────────────────────────────────────────────────────┐
│  events                                                     │
├────────────────────────────────────────────────────────────┤
│  id (PK)           │ BIGINT      │ AUTO_INCREMENT          │
│  title             │ VARCHAR(255)│ NOT NULL                │
│  description       │ TEXT        │ NULL                    │
│  type              │ ENUM        │ MEETING/TASK/REMINDER   │
│  startDate         │ DATETIME    │ NOT NULL                │
│  endDate           │ DATETIME    │ NULL                    │
│  userId (FK)       │ BIGINT      │ → users.id              │
│  createdAt         │ TIMESTAMP   │ DEFAULT NOW()           │
└────────────────────────────────────────────────────────────┘
```

### 3.2 İlişki Diyagramı
```
┌──────────┐     ┌───────────────┐     ┌──────────┐
│  users   │◄────┤workspace_users├────►│workspaces│
└────┬─────┘     └───────────────┘     └──────────┘
     │
     │    ┌──────────┐
     └───►│  tasks   │
     │    └──────────┘
     │
     │    ┌──────────┐
     └───►│documents │
     │    └──────────┘
     │
     │    ┌──────────┐
     └───►│ messages │
     │    └──────────┘
     │
     │    ┌──────────┐
     └───►│  notes   │
     │    └──────────┘
     │
     │    ┌──────────┐
     └───►│  events  │
          └──────────┘
```

---

## 4. API Endpoints

### 4.1 Kimlik Doğrulama
```http
POST   /api/auth/login           # Giriş
POST   /api/auth/register        # Kayıt
POST   /api/auth/logout          # Çıkış
POST   /api/auth/refresh         # Token yenileme
GET    /api/auth/me              # Mevcut kullanıcı
```

### 4.2 Kullanıcılar
```http
GET    /api/users                # Tüm kullanıcılar
GET    /api/users/:id            # Kullanıcı detayı
GET    /api/users/workspace/:id  # Workspace kullanıcıları
PUT    /api/users/:id            # Kullanıcı güncelle
DELETE /api/users/:id            # Kullanıcı sil
```

### 4.3 Görevler
```http
GET    /api/tasks                # Tüm görevler
GET    /api/tasks?workspaceId=1  # Workspace görevleri
GET    /api/tasks/:id            # Görev detayı
POST   /api/tasks                # Görev oluştur
PUT    /api/tasks/:id            # Görev güncelle
DELETE /api/tasks/:id            # Görev sil
```

### 4.4 Dökümanlar
```http
GET    /api/documents            # Döküman listesi
POST   /api/documents            # Döküman yükle
GET    /api/documents/:id        # Döküman detayı
DELETE /api/documents/:id        # Döküman sil
```

### 4.5 Mesajlar
```http
GET    /api/messages             # Mesajlar
POST   /api/messages             # Mesaj gönder
GET    /api/conversations        # Konuşmalar
```

---

## 5. Frontend Yapısı

### 5.1 Dashboard Bileşen Hiyerarşisi
```
Dashboard Page (page.jsx)
├── Header
│   ├── Logo
│   ├── Welcome Message
│   ├── NotificationBell
│   └── User Dropdown Menu
│       ├── Çevrimiçi Kullanıcılar
│       ├── Tüm Kullanıcılar
│       ├── Mesajlar
│       └── Profilim
│
├── Navigation Tabs
│   ├── Genel Bakış (overview)
│   ├── Görevler (tasks)
│   ├── Mesajlar (messages)
│   ├── Dokümanlar (documents)
│   ├── Notlar (notes)
│   ├── Takvim (calendar)
│   ├── Analitik (analytics)
│   ├── Kullanıcılar (users) [Admin]
│   └── Admin Paneli (admin) [Admin]
│
└── Tab Content
    ├── ProfessionalOverview
    │   ├── Hero Section (Welcome + Clock)
    │   ├── Quick Stats (6 widgets)
    │   ├── Recent Activity
    │   ├── Activity Summary
    │   └── Productivity Chart
    │
    ├── TaskDashboard
    │   ├── Filters (Status, Priority, Assignee, Date)
    │   ├── Kanban Board
    │   ├── Task List
    │   └── Task Modal (Create/Edit)
    │
    ├── UserManagement
    │   ├── Stats Cards (5 metrics)
    │   ├── Filters (Tabs + Search)
    │   ├── User List
    │   └── User Detail Modal
    │
    ├── MessagesSection
    │   ├── Conversation List
    │   ├── Group List
    │   └── Chat Area
    │
    ├── DocumentDashboard
    │   ├── Upload Area
    │   ├── Document Grid/List
    │   └── Document Preview
    │
    ├── NotesDashboard
    │   ├── Note Editor
    │   └── Note List
    │
    ├── CalendarDashboard
    │   ├── Calendar View
    │   └── Event List
    │
    ├── AnalyticsDashboard
    │   ├── KPI Cards
    │   ├── Charts
    │   └── Team Performance
    │
    ├── AdminPanel
    │   ├── Site Settings
    │   └── User Management
    │
    └── UserProfile
        ├── Cover Image
        ├── Profile Info
        ├── Contact Info
        └── Activity Timeline
```

### 5.2 Önemli Bileşenler Detayı

#### ProfessionalOverview
```javascript
// State
- dashboardData: { stats, recentActivity, productivity, upcoming }
- currentTime: Date (her saniye güncellenir)
- siteSettings: { welcomeTitle, welcomeMessage, logoUrl }

// API Calls
- GET /tasks?workspaceId=1
- GET /users/workspace/1
- GET /site-settings

// Features
- Real-time clock
- Animated stats widgets
- Activity feed
- Weekly productivity chart
```

#### TaskDashboard
```javascript
// State
- tasks: Task[]
- filters: { status, priority, assignee, search, dateRange }
- viewMode: 'kanban' | 'list'
- selectedTask: Task | null

// API Calls
- GET /tasks?workspaceId=1
- POST /tasks
- PUT /tasks/:id
- DELETE /tasks/:id

// Features
- Kanban board (drag-drop)
- List view with sorting
- Advanced filtering
- Task creation modal
- Bulk actions
```

#### UserManagement
```javascript
// State
- users: User[]
- stats: { total, active, online, admins, newThisMonth }
- filters: { searchQuery, activeTab }
- selectedUser: User | null

// API Calls
- GET /users/workspace/1
- PUT /users/:id
- DELETE /users/:id

// Features
- Real-time statistics
- Tab-based filtering
- User detail modal
- Online status tracking
```

---

## 6. State Management

### 6.1 Zustand Stores

#### Auth Store
```javascript
// src/store/authStore.js
{
  user: User | null,
  token: string | null,
  refreshToken: string | null,
  isAuthenticated: boolean,
  
  // Actions
  login: (credentials) => Promise<void>,
  logout: () => void,
  refreshAccessToken: () => Promise<void>,
  updateUser: (userData) => void
}
```

#### Component-level State
```javascript
// useState ile yönetilen state'ler
- Active tab selection
- Modal open/close states
- Form inputs
- Local filters
- UI animations
```

### 6.2 Data Fetching Pattern
```javascript
// 1. Initial Load (useEffect)
useEffect(() => {
  fetchData();
}, []);

// 2. API Call
const fetchData = async () => {
  setLoading(true);
  try {
    const response = await api.get('/endpoint');
    setData(response.data);
  } catch (error) {
    toast.error('Hata mesajı');
  } finally {
    setLoading(false);
  }
};

// 3. Optimistic Updates
const handleUpdate = async (newData) => {
  const previousData = data;
  setData(newData); // Optimistic update
  
  try {
    await api.put('/endpoint', newData);
  } catch (error) {
    setData(previousData); // Rollback
    toast.error('Güncelleme başarısız');
  }
};
```

---

## 7. Kimlik Doğrulama Akışı

### 7.1 Login Flow
```
┌─────────┐      ┌──────────┐      ┌─────────┐      ┌──────────┐
│  User   │─────►│  Login   │─────►│   API   │─────►│ Backend  │
│         │      │   Page   │      │  Call   │      │          │
└─────────┘      └──────────┘      └─────────┘      └────┬─────┘
                                                        │
                                                        ▼
                                              ┌──────────────────┐
                                              │  Verify Credentials│
                                              │  Generate Tokens   │
                                              └────────┬─────────┘
                                                       │
                    ┌──────────────────────────────────┘
                    ▼
┌─────────┐      ┌──────────┐      ┌─────────┐      ┌──────────┐
│ Dashboard│◄────│  Store   │◄────│  Save   │◄────│   API    │
│   Page   │      │  Token   │      │  Token  │      │ Response │
└─────────┘      └──────────┘      └─────────┘      └──────────┘

Tokens:
- Access Token (15 dk): API requests
- Refresh Token (7 gün): Token yenileme
```

### 7.2 Protected Route Flow
```javascript
// Middleware: Check Auth
const checkAuth = () => {
  const token = getToken();
  
  if (!token) {
    redirect('/login');
    return;
  }
  
  // Token geçerli mi?
  if (isTokenExpired(token)) {
    // Refresh token dene
    refreshAccessToken()
      .then(() => continue())
      .catch(() => redirect('/login'));
  }
};
```

---

## 8. Veri Akışı Diyagramları

### 8.1 Görev Oluşturma Akışı
```
┌─────────────────────────────────────────────────────────────┐
│  1. USER ACTION                                              │
│     Kullanıcı "Yeni Görev" butonuna tıklar                   │
│     → TaskModal açılır                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  2. FORM INPUT                                               │
│     Kullanıcı form doldurur:                                 │
│     - Title, Description                                     │
│     - Status (TODO)                                          │
│     - Priority                                               │
│     - Assignee                                               │
│     - Due Date                                               │
│     → Form state güncellenir (useState)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  3. SUBMIT                                                   │
│     Kullanıcı "Kaydet" tıklar                                │
│     → Validation (required fields)                           │
│     → POST /tasks API call                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  4. API PROCESS                                              │
│     Backend:                                                 │
│     - Validate data                                          │
│     - Insert to DB                                           │
│     - Return created task with ID                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  5. STATE UPDATE                                             │
│     Frontend:                                                │
│     - Modal kapat                                            │
│     - tasks array'e yeni task ekle                           │
│     - Kanban/List re-render                                  │
│     - Toast success göster                                   │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Gerçek Zamanlı Güncelleme (Polling)
```javascript
// Polling Pattern (WebSocket alternatifi)
┌─────────────────────────────────────────────────────────────┐
│                    POLLING MECHANISM                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│   │  Timer   │───►│  Fetch   │───►│  Update  │             │
│   │  (10s)   │    │   API    │    │   State  │             │
│   └──────────┘    └──────────┘    └──────────┘             │
│        │                                │                   │
│        │                                │                   │
│        └────────────────────────────────┘                   │
│                    (Loop)                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Code:
useEffect(() => {
  const fetchData = () => {
    api.get('/tasks').then(res => setTasks(res.data));
  };
  
  fetchData(); // Initial
  const timer = setInterval(fetchData, 10000); // Every 10s
  
  return () => clearInterval(timer);
}, []);
```

---

## 9. Bileşen İlişkileri

### 9.1 Props Drilling Önleme
```
❌ Kötü (Props Drilling)
Parent → Child1 → Child2 → Child3 (data)

✅ İyi (Zustand / Context)
Store ──────┬────── Child1
            ├─── Child2
            └─── Child3
```

### 9.2 Reusable Components
```javascript
// UI Components (shadcn/ui)
- Button    → Tüm butonlar
- Card      → Tüm kartlar  
- Dialog    → Tüm modallar
- Input     → Tüm inputlar
- Badge     → Status label'ları
- Table     → Veri listeleri

// Custom Components
- StatWidget        → Dashboard stats
- ActivityItem      → Aktivite feed'i
- TaskCard          → Kanban/List görev kartı
- UserAvatar        → Kullanıcı avatarı
- Chart Components  → Recharts wrapper'ları
```

### 9.3 Event Flow
```
User Event
    │
    ├──► Component Handler
         │
         ├──► API Call (async)
              │
              ├──► Backend
              │
              └──► Response
                   │
                   ├──► State Update
                        │
                        └──► Re-render
                             │
                             └──► UI Update
```

---

## 10. Deployment & Config

### 10.1 Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=https://task.agudo.net/api
NEXT_PUBLIC_APP_NAME=İşTakip
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 10.2 Build & Deploy
```bash
# Development
npm run dev

# Production Build
npm run build

# Production Start
npm start
```

---

## 📌 Önemli Notlar

1. **State Management**: Zustand global state, useState local state için
2. **API Calls**: Tüm API'lar `api.js` üzerinden yapılır
3. **Error Handling**: Try-catch + toast error
4. **Optimistic UI**: Mutasyonlarda optimistic update kullanılır
5. **Polling**: Gerçek zamanlı güncellemeler için 10s polling
6. **Auth**: JWT token localStorage'da saklanır
7. **Responsive**: Mobile-first Tailwind CSS
8. **Accessibility**: Radix UI accessibility features

---

**Doküman Versiyonu**: 1.0  
**Son Güncelleme**: 17 Nisan 2025
