// Simple translation system
import { useState, useEffect } from 'react';

const translations = {
  en: {
    // Dashboard
    'dashboard.welcome': 'Welcome to Dashboard',
    'dashboard.description': 'This is your personal dashboard. Here you can manage your tasks, documents, and collaborate with your team.',
    'overview': 'Overview',
    'tasks': 'Tasks',
    'documents': 'Documents',
    'profile': 'Profile',
    'logout': 'Logout',
    'active': 'Active',
    'loading': 'Loading...',
    'or': 'or',
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'create': 'Create',
    'search': 'Search',
    'filter': 'Filter',
    'all': 'All',
    'users': 'Users',
    'admin': 'Admin',
    'analytics': 'Analytics',
    'notes': 'Notes',
    'messages': 'Messages',
    'meetings': 'Meetings',
    'settings': 'Settings',
    
    // Auth
    'auth.signin': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgot': 'Forgot your password?',
    'auth.rememberMe': 'Remember me',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.users': 'Users',
    'nav.documents': 'Documents',
    'nav.tasks': 'Tasks',
    'nav.meetings': 'Meetings',
    'nav.messages': 'Messages',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    
    // User Management
    'users.title': 'User Management',
    'users.description': 'Manage your team members, create groups and enhance collaboration',
    'users.total': 'Total Users',
    'users.active': 'Active Users',
    'users.online': 'Online',
    'users.admins': 'Admins',
    'users.newThisMonth': 'New This Month',
    'users.search': 'Search users (name, email, position...)',
    'users.filter.all': 'All',
    'users.filter.active': 'Active',
    'users.filter.online': 'Online',
    'users.filter.admins': 'Admins',
    'users.filter.recent': 'New This Month',
    'users.invite': 'Invite New User',
    'users.groups': 'Groups',
    'users.role': 'Role',
    'users.status': 'Status',
    'users.joinDate': 'Join Date',
    'users.actions': 'Actions',
    'users.edit': 'Edit User',
    'users.delete': 'Delete User',
    'users.deleteConfirm': 'Are you sure you want to delete this user?',
    'users.noUsers': 'No users found',
    'users.resetFilter': 'Reset Filter',
    'users.gridView': 'Grid View',
    'users.listView': 'List View',
    'users.selectAll': 'Select All',
    'users.bulkActions': 'Bulk Actions',
    'users.activate': 'Activate',
    'users.deactivate': 'Deactivate',
    
    // Roles
    'role.admin': 'Admin',
    'role.manager': 'Manager',
    'role.member': 'Member',
    'role.user': 'User',
    
    // Brand Positioning
    'brand.tagline': 'All-in-one workspace to manage tasks, communication, and projects without switching between tools.',
    'brand.hero': 'Stop managing work across 5 different tools',
    'brand.sub': 'Manage tasks, communication, and files in one place',
    
    // Premium Features
    'premium.features': 'Premium Features',
    'premium.secure': 'Secure & Private',
    'premium.fast': 'Lightning Fast',
    
    // Status
    'status.active': 'Active',
    'status.passive': 'Passive',
    'status.online': 'Online',
    'status.offline': 'Offline',
    
    // Documents
    'documents.title': 'Documents',
    'documents.myDocuments': 'My Documents',
    'documents.shared': 'Shared with Me',
    'documents.public': 'Public Pool',
    'documents.private': 'Private',
    'documents.new': 'New Document',
    'documents.upload': 'Upload',
    'documents.share': 'Share',
    'documents.download': 'Download',
    'documents.visibility': 'Visibility',
    'documents.visibility.public': 'Public',
    'documents.visibility.private': 'Private',
    'documents.visibility.group': 'Group',
    'documents.visibility.specific': 'Specific Users',
    'documents.title': 'Title',
    'documents.content': 'Content',
    'documents.file': 'File',
    'documents.created': 'Created',
    'documents.modified': 'Modified',
    'documents.owner': 'Owner',
    'documents.noDocuments': 'No documents found',
    'documents.searchPlaceholder': 'Search documents by title or content...',
    'documents.createFirst': 'Create Your First Document',
    'documents.tryFilters': 'Try adjusting your filters or search terms',
    'documents.description': 'Share, collaborate, organize',
    
    // Tasks
    'tasks.title': 'Tasks',
    'tasks.myTasks': 'My Tasks',
    'tasks.assigned': 'Assigned to Me',
    'tasks.created': 'Created by Me',
    'tasks.new': 'New Task',
    'tasks.create': 'Create Task',
    'tasks.edit': 'Edit Task',
    'tasks.delete': 'Delete Task',
    'tasks.titlePlaceholder': 'Enter task title',
    'tasks.descriptionPlaceholder': 'Enter task description',
    'tasks.notesPlaceholder': 'Write your notes here',
    'tasks.sample.completeDocumentation': 'Complete Documentation',
    'tasks.sample.reviewPullRequests': 'Review Pull Requests',
    'tasks.sample.fixLoginBug': 'Fix Login Bug',
    'tasks.noTasksInColumn': 'No tasks in this column',
    'tasks.task': 'Task',
    'tasks.trackAssignCollaborate': 'Track, Assign, and Collaborate',
    'tasks.search': 'Search tasks...',
    'tasks.allStatus': 'All Status',
    'tasks.allPriority': 'All Priority',
    'tasks.adjustFilters': 'Adjust filters',
    'tasks.createFirstTask': 'Create first task',
    'tasks.taskDetail': 'Task Detail',
    'tasks.updateStatus': 'Update Status',
    'tasks.notes': 'Notes',
    'tasks.saveNotes': 'Save Notes',
    'tasks.markAsCompleted': 'Mark as Completed',
    'tasks.completed': 'Completed',
    'tasks.title': 'Title',
    'tasks.description': 'Description',
    'tasks.status': 'Status',
    'tasks.priority': 'Priority',
    'tasks.dueDate': 'Due Date',
    'tasks.assignee': 'Assignee',
    'tasks.assignedTo': 'Assigned To',
    'tasks.noTasks': 'No tasks found',
    'tasks.todo': 'To Do',
    'tasks.inProgress': 'In Progress',
    'tasks.done': 'Done',
    'status.todo': 'To Do',
    'status.inProgress': 'In Progress',
    'status.done': 'Done',
    
    // Priority
    'priority.low': 'Low',
    'priority.medium': 'Medium',
    'priority.high': 'High',
    
    // Meetings
    'meetings.title': 'Meetings',
    'meetings.total': 'Total Meetings',
    'meetings.scheduled': 'Scheduled',
    'meetings.inProgress': 'In Progress',
    'meetings.completed': 'Completed',
    'meetings.thisWeek': 'This Week',
    'meetings.upcoming': 'Upcoming Meetings',
    'meetings.past': 'Past Meetings',
    'meetings.newMeeting': 'New Meeting',
    'meetings.listView': 'List View',
    'meetings.calendarView': 'Calendar View',
    'meetings.createTitle': 'Create New Meeting',
    'meetings.titlePlaceholder': 'Meeting title',
    'meetings.descriptionPlaceholder': 'Description (optional)',
    'meetings.locationPlaceholder': 'Location (optional)',
    'meetings.startTime': 'Start Time',
    'meetings.endTime': 'End Time',
    'meetings.addParticipants': 'Add Participants',
    'meetings.searchPlaceholder': 'Search users (e.g., "test") or enter email...',
    'meetings.manualEmail': 'Or enter email manually',
    'meetings.firstName': 'First Name',
    'meetings.lastName': 'Last Name',
    'meetings.createMeeting': 'Create Meeting',
    'meetings.cancel': 'Cancel',
    'meetings.noUpcoming': 'No upcoming meetings scheduled',
    'meetings.noPast': 'No past meetings',
    'meetings.participants': 'participants',
    'meetings.videoCall': 'Video Call',
    'meetings.delete': 'Delete',
    'meetings.calendarComingSoon': 'Calendar component coming soon...',
    'meetings.useListView': 'For now, please use the list view to manage your meetings.',
    
    // Video Call
    'videoCall.title': 'Video Call',
    'videoCall.participants': 'participants',
    'videoCall.host': 'Host',
    'videoCall.chat': 'Chat',
    'videoCall.leave': 'Leave',
    'videoCall.raiseHand': 'Raise Hand',
    'videoCall.lowerHand': 'Lower Hand',
    'videoCall.toggleVideo': 'Toggle Video',
    'videoCall.toggleAudio': 'Toggle Audio',
    'videoCall.shareScreen': 'Share Screen',
    'videoCall.stopSharing': 'Stop Sharing',
    'videoCall.sendMessage': 'Send Message',
    'videoCall.typeMessage': 'Type a message...',
    
    // Messages
    'messages.title': 'Messages',
    'messages.conversations': 'Conversations',
    'messages.newMessage': 'New Message',
    'messages.send': 'Send',
    'messages.typeMessage': 'Type a message...',
    'messages.noMessages': 'No messages yet',
    
    // Profile
    'profile.title': 'Profile',
    'profile.edit': 'Edit Profile',
    'profile.sendMessage': 'Send Message',
    'profile.contact': 'Contact',
    'profile.email': 'Email',
    'profile.phone': 'Phone',
    'profile.location': 'Location',
    'profile.department': 'Department',
    'profile.position': 'Position',
    'profile.joinDate': 'Join Date',
    'profile.bio': 'Bio',
    'profile.achievements': 'Achievements',
    'profile.level': 'Level Progress',
    'profile.tasks': 'Tasks',
    'profile.theme': 'Theme Selection',
    'profile.theme.light': 'Light',
    'profile.theme.dark': 'Dark',
    'profile.theme.system': 'System',
    
    // Admin
    'admin.title': 'Admin Settings',
    'admin.general': 'General Settings',
    'admin.security': 'Security',
    'admin.users': 'User Management',
    'admin.notifications': 'Notifications',
    'admin.integrations': 'Integrations',
    'admin.backup': 'Backup',
    'admin.logs': 'System Logs',
    'admin.api': 'API & Developer',
    'admin.save': 'Save Settings',
    
    // Modal
    'modal.liveTranslation': 'Live Translation',
    'modal.speech': 'Speech',
    'modal.status': 'Status',
    'modal.participants': 'Participants',
    'modal.start': 'Start',
    'modal.accept': 'Accept',
    'modal.cancel': 'Cancel',
    'modal.close': 'Close',
    'modal.confirm': 'Confirm',
    'modal.yes': 'Yes',
    'modal.no': 'No',
    
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.email': 'Email Notifications',
    'notifications.push': 'Push Notifications',
    'notifications.none': 'No notifications',
    
    // Errors
    'error.general': 'An error occurred',
    'error.loading': 'Failed to load data',
    'error.saving': 'Failed to save',
    'error.required': 'This field is required',
    'error.invalidEmail': 'Invalid email address',
    
    // Success
    'success.saved': 'Saved successfully',
    'success.created': 'Created successfully',
    'success.updated': 'Updated successfully',
    'success.deleted': 'Deleted successfully',
    'success.invited': 'Invitation sent successfully',
    
    // Language
    'language': 'Language',
    'language.en': 'English',
    'language.tr': 'Türkçe',

    // App
    'app.name': 'Work Track',
    'app.platform': 'Platform',

    // Login Form
    'login.heroDescription': 'Manage your corporate business processes in a modern and secure way. Team collaboration, task tracking and project management in one platform.',
    'login.welcome': 'Welcome',
    'login.subtitle': 'Continue by logging into your account',
    'login.rememberMe': 'Remember me',
    'login.forgotPassword': 'Forgot your password?',
    'login.loggingIn': 'Logging in',
    'login.noAccount': "Don't have an account?",
    'login.signUp': 'Sign up',
    'login.sslSecure': 'SSL Secure',
    'login.gdprCompliant': 'GDPR Compliant',

    // Features
    'features.taskManagement': 'Task Management',
    'features.teamCollaboration': 'Team Collaboration',
    'features.analyticsReports': 'Analytics Reports',
    'features.bankLevelSecurity': 'Bank-Level Security',

    // Stats
    'stats.activeUsers': 'Active Users',
    'stats.uptime': 'Uptime',
    'stats.support': 'Support',

    // Footer
    'footer.allRightsReserved': 'All rights reserved',

    // Landing Page
    'landing.title': 'Manage Your Work More Efficiently',
    'landing.subtitle': 'Tasks, documents, meetings - all in one platform',
    'landing.cta': 'Try Free for 14 Days',

    // Navigation
    'nav.getStarted': 'Get Started',

    // Features
    'features.analytics': 'Analytics'
  },
  tr: {
    // Dashboard
    'dashboard.welcome': 'Panele Hoş Geldin',
    'dashboard.description': 'Bu kişisel panelin. Görevlerini yönetebilir, dokümanlarına erişebilir ve ekibinle işbirliği yapabilirsin.',
    'overview': 'Genel Bakış',
    'tasks': 'Görevler',
    'documents': 'Dokümanlar',
    'profile': 'Profil',
    'logout': 'Çıkış Yap',
    'active': 'Aktif',
    'loading': 'Yükleniyor...',
    'or': 'veya',
    'save': 'Kaydet',
    'cancel': 'İptal',
    'delete': 'Sil',
    'edit': 'Düzenle',
    'create': 'Oluştur',
    'search': 'Ara',
    'filter': 'Filtre',
    'all': 'Tümü',
    'users': 'Kullanıcılar',
    'onlineUsers': 'Çevrimiçi Kullanıcılar',
    'admin': 'Yönetici',
    'analytics': 'Analitik',
    'notes': 'Notlar',
    'messages': 'Mesajlar',
    'meetings': 'Toplantılar',
    'settings': 'Ayarlar',
    
    // Auth
    'auth.signin': 'Giriş Yap',
    'auth.signup': 'Kayıt Ol',
    'auth.email': 'E-posta',
    'auth.password': 'Şifre',
    'auth.forgot': 'Şifrenizi mi unuttunuz?',
    'auth.rememberMe': 'Beni hatırla',
    'auth.noAccount': 'Hesabınız yok mu?',
    'auth.hasAccount': 'Zaten hesabınız var mı?',
    
    // Navigation
    'nav.dashboard': 'Panel',
    'nav.users': 'Kullanıcılar',
    'nav.documents': 'Dokümanlar',
    'nav.tasks': 'Görevler',
    'nav.meetings': 'Toplantılar',
    'nav.messages': 'Mesajlar',
    'nav.profile': 'Profil',
    'nav.settings': 'Ayarlar',
    'nav.logout': 'Çıkış Yap',
    
    // User Management
    'users.title': 'Takım Yönetimi',
    'users.description': 'Çalışanlarınızı yönetin, gruplar oluşturun ve işbirliğini artırın',
    'users.total': 'Toplam Kullanıcı',
    'users.active': 'Aktif Kullanıcı',
    'users.online': 'Çevrimiçi',
    'users.admins': 'Yöneticiler',
    'users.newThisMonth': 'Yeni Bu Ay',
    'users.search': 'Kullanıcı ara (isim, e-posta, pozisyon...)',
    'users.filter.all': 'Tümü',
    'users.filter.active': 'Aktif',
    'users.filter.online': 'Çevrimiçi',
    'users.filter.admins': 'Yöneticiler',
    'users.filter.recent': 'Yeni Bu Ay',
    'users.invite': 'Yeni Kullanıcı Davet Et',
    'users.groups': 'Gruplar',
    'users.role': 'Rütbe',
    'users.status': 'Durum',
    'users.joinDate': 'Katılım Tarihi',
    'users.actions': 'İşlemler',
    'users.edit': 'Kullanıcıyı Düzenle',
    'users.delete': 'Kullanıcıyı Sil',
    'users.deleteConfirm': 'Bu kullanıcıyı silmek istediğinize emin misiniz?',
    'users.noUsers': 'Kullanıcı bulunamadı',
    'users.resetFilter': 'Filtreyi Sıfırla',
    'users.gridView': 'Izgara Görünümü',
    'users.listView': 'Liste Görünümü',
    'users.selectAll': 'Tümünü Seç',
    'users.bulkActions': 'Toplu İşlemler',
    'users.activate': 'Aktif Et',
    'users.deactivate': 'Pasif Et',
    
    // Roles
    'role.admin': 'Admin',
    'role.manager': 'Müdür',
    'role.member': 'Üye',
    'role.user': 'Kullanıcı',
    
    // Brand Positioning
    'brand.tagline': 'Görev yönetimi, ekip iletişimi ve proje takibini tek platformda birleştiren sistem.',
    'brand.hero': 'İşlerinizi 5 farklı araç arasında yönetmeyi bırakın',
    'brand.sub': 'Görevleri, iletişimi ve dosyaları tek bir yerde yönetin',
    
    // Premium Features
    'premium.features': 'Premium Özellikler',
    'premium.secure': 'Güvenli ve Özel',
    'premium.fast': 'Çok Hızlı',
    
    // Status
    'status.active': 'Aktif',
    'status.passive': 'Pasif',
    'status.online': 'Çevrimiçi',
    'status.offline': 'Çevrimdışı',
    
    // Documents
    'documents.title': 'Dokümanlar',
    'documents.myDocuments': 'Dokümanlarım',
    'documents.shared': 'Benimle Paylaşılanlar',
    'documents.public': 'Genel Havuz',
    'documents.private': 'Özel',
    'documents.new': 'Yeni Doküman',
    'documents.upload': 'Yükle',
    'documents.share': 'Paylaş',
    'documents.download': 'İndir',
    'documents.visibility': 'Görünürlük',
    'documents.visibility.public': 'Genel',
    'documents.visibility.private': 'Özel',
    'documents.visibility.group': 'Grup',
    'documents.visibility.specific': 'Seçili Kullanıcılar',
    'documents.title': 'Başlık',
    'documents.content': 'İçerik',
    'documents.file': 'Dosya',
    'documents.created': 'Oluşturuldu',
    'documents.modified': 'Değiştirildi',
    'documents.owner': 'Sahibi',
    'documents.noDocuments': 'Doküman bulunamadı',
    'documents.searchPlaceholder': 'Başlık veya içeriğe göre doküman ara...',
    'documents.createFirst': 'İlk Dokümanınızı Oluşturun',
    'documents.tryFilters': 'Filtreleri veya arama terimlerini ayarlayın',
    'documents.description': 'Paylaş, işbirliği yap, organize et',

    // Tasks
    'tasks.title': 'Görevler',
    'tasks.myTasks': 'Görevlerim',
    'tasks.assigned': 'Bana Atananlar',
    'tasks.created': 'Oluşturduklarım',
    'tasks.new': 'Yeni Görev',
    'tasks.create': 'Görev Oluştur',
    'tasks.edit': 'Görevi Düzenle',
    'tasks.delete': 'Görevi Sil',
    'tasks.titlePlaceholder': 'Görev başlığını girin',
    'tasks.descriptionPlaceholder': 'Görev açıklamasını girin',
    'tasks.notesPlaceholder': 'Notlarınızı buraya yazın',
    'tasks.sample.completeDocumentation': 'Dokümantasyonu Tamamla',
    'tasks.sample.reviewPullRequests': 'PR İncelemeleri',
    'tasks.sample.fixLoginBug': 'Login Hatasını Düzelt',
    'tasks.noTasksInColumn': 'Bu sütunda görev yok',
    'tasks.task': 'Görev',
    'tasks.trackAssignCollaborate': 'İzle, Ata ve İşbirliği Yap',
    'tasks.search': 'Görev ara...',
    'tasks.allStatus': 'Tüm Durumlar',
    'tasks.allPriority': 'Tüm Öncelikler',
    'tasks.adjustFilters': 'Filtreleri ayarlayın',
    'tasks.createFirstTask': 'İlk görevi oluştur',
    'tasks.taskDetail': 'Görev Detayı',
    'tasks.updateStatus': 'Durumu Güncelle',
    'tasks.notes': 'Notlar',
    'tasks.saveNotes': 'Notları Kaydet',
    'tasks.markAsCompleted': 'Tamamlandı Olarak İşaretle',
    'tasks.completed': 'Tamamlandı',
    'tasks.description': 'Açıklama',
    'tasks.status': 'Durum',
    'tasks.priority': 'Öncelik',
    'tasks.dueDate': 'Bitiş Tarihi',
    'tasks.assignee': 'Atanan',
    'tasks.assignedTo': 'Atanan Kişi',
    'tasks.noTasks': 'Görev bulunamadı',
    'tasks.search': 'Görev ara: başlık, açıklama veya atanan...',
    'tasks.trackAssignCollaborate': 'takip et, ata, işbirliği yap',
    'tasks.todo': 'Yapılacak',
    'tasks.inProgress': 'Devam Ediyor',
    'tasks.review': 'İncelemede',
    'tasks.done': 'Tamamlandı',
    'tasks.toDo': 'Yapılacak',
    'tasks.inProgressCount': 'Devam Eden',
    'tasks.doneCount': 'Tamamlanan',
    'status.todo': 'Yapılacak',
    'status.inProgress': 'Devam Ediyor',
    'status.done': 'Tamamlandı',

    // View Modes
    'view.board': 'Pano',
    'view.list': 'Liste',
    'view.analytics': 'Analitik',

    // Filters
    'filters.title': 'Filtreler',
    'filters.overdue': 'Gecikmiş',
    'filters.today': 'Bugün',
    'filters.thisWeek': 'Bu Hafta',
    'filters.noDueDate': 'Bitiş Tarihi Yok',
    'filters.unassigned': 'Atanmamış',

    // Priority
    'priority.low': 'Düşük',
    'priority.medium': 'Orta',
    'priority.high': 'Yüksek',
    
    // Meetings
    'meetings.title': 'Toplantılar',
    'meetings.total': 'Toplam Toplantı',
    'meetings.scheduled': 'Planlandı',
    'meetings.inProgress': 'Devam Ediyor',
    'meetings.completed': 'Tamamlandı',
    'meetings.thisWeek': 'Bu Hafta',
    'meetings.upcoming': 'Yaklaşan Toplantılar',
    'meetings.past': 'Geçmiş Toplantılar',
    'meetings.newMeeting': 'Yeni Toplantı',
    'meetings.listView': 'Liste Görünümü',
    'meetings.calendarView': 'Takvim Görünümü',
    'meetings.createTitle': 'Yeni Toplantı Oluştur',
    'meetings.titlePlaceholder': 'Toplantı başlığı',
    'meetings.descriptionPlaceholder': 'Açıklama (isteğe bağlı)',
    'meetings.locationPlaceholder': 'Konum (isteğe bağlı)',
    'meetings.startTime': 'Başlangıç Zamanı',
    'meetings.endTime': 'Bitiş Zamanı',
    'meetings.addParticipants': 'Katılımcı Ekle',
    'meetings.searchPlaceholder': 'Kullanıcıları ara (örneğin, "test") veya e-posta girin...',
    'meetings.manualEmail': 'Veya e-postayı manuel olarak girin',
    'meetings.firstName': 'Ad',
    'meetings.lastName': 'Soyad',
    'meetings.createMeeting': 'Toplantı Oluştur',
    'meetings.cancel': 'İptal',
    'meetings.noUpcoming': 'Planlanmış yaklaşan toplantı yok',
    'meetings.noPast': 'Geçmiş toplantı yok',
    'meetings.participants': 'katılımcı',
    'meetings.videoCall': 'Video Çağrı',
    'meetings.delete': 'Sil',
    'meetings.calendarComingSoon': 'Takvim bileşeni yakında gelecek...',
    'meetings.useListView': 'Şimdilik toplantılarınızı yönetmek için liste görünümünü kullanın.',
    
    // Video Call
    'videoCall.title': 'Video Çağrı',
    'videoCall.participants': 'katılımcı',
    'videoCall.host': 'Ev Sahibi',
    'videoCall.chat': 'Sohbet',
    'videoCall.leave': 'Ayrıl',
    'videoCall.raiseHand': 'El Kaldır',
    'videoCall.lowerHand': 'El İndir',
    'videoCall.toggleVideo': 'Videoyu Aç/Kapat',
    'videoCall.toggleAudio': 'Sesi Aç/Kapat',
    'videoCall.shareScreen': 'Ekran Paylaş',
    'videoCall.stopSharing': 'Paylaşımı Durdur',
    'videoCall.sendMessage': 'Mesaj Gönder',
    'videoCall.typeMessage': 'Mesaj yazın...',
    
    // Messages
    'messages.title': 'Mesajlar',
    'messages.conversations': 'Sohbetler',
    'messages.newMessage': 'Yeni Mesaj',
    'messages.send': 'Gönder',
    'messages.typeMessage': 'Mesaj yazın...',
    'messages.noMessages': 'Henüz mesaj yok',
    
    // Profile
    'profile.title': 'Profil',
    'profile.edit': 'Profili Düzenle',
    'profile.sendMessage': 'Mesaj Gönder',
    'profile.contact': 'İletişim',
    'profile.email': 'E-posta',
    'profile.phone': 'Telefon',
    'profile.location': 'Konum',
    'profile.department': 'Departman',
    'profile.position': 'Pozisyon',
    'profile.joinDate': 'Katılım Tarihi',
    'profile.bio': 'Hakkımda',
    'profile.achievements': 'Başarımlar',
    'profile.level': 'Seviye İlerlemesi',
    'profile.tasks': 'Görevler',
    'profile.theme': 'Tema Seçimi',
    'profile.theme.light': 'Açık',
    'profile.theme.dark': 'Koyu',
    'profile.theme.system': 'Sistem',
    
    // Admin
    'admin.title': 'Yönetici Ayarları',
    'admin.general': 'Genel Ayarlar',
    'admin.security': 'Güvenlik',
    'admin.users': 'Kullanıcı Yönetimi',
    'admin.notifications': 'Bildirimler',
    'admin.integrations': 'Entegrasyonlar',
    'admin.backup': 'Yedekleme',
    'admin.logs': 'Sistem Logları',
    'admin.api': 'API & Geliştirici',
    'admin.save': 'Ayarları Kaydet',
    
    // Modal
    'modal.liveTranslation': 'Canlı Çeviri',
    'modal.speech': 'Konuşma',
    'modal.status': 'Durum',
    'modal.participants': 'Katılımcılar',
    'modal.start': 'Başlat',
    'modal.accept': 'Kabul Et',
    'modal.cancel': 'İptal',
    'modal.close': 'Kapat',
    'modal.confirm': 'Onayla',
    'modal.yes': 'Evet',
    'modal.no': 'Hayır',
    
    // Notifications
    'notifications.title': 'Bildirimler',
    'notifications.email': 'E-posta Bildirimleri',
    'notifications.push': 'Anlık Bildirimler',
    'notifications.none': 'Bildirim yok',
    
    // Errors
    'error.general': 'Bir hata oluştu',
    'error.loading': 'Veriler yüklenemedi',
    'error.saving': 'Kaydetme başarısız',
    'error.required': 'Bu alan zorunludur',
    'error.invalidEmail': 'Geçersiz e-posta adresi',
    
    // Success
    'success.saved': 'Başarıyla kaydedildi',
    'success.created': 'Başarıyla oluşturuldu',
    'success.updated': 'Başarıyla güncellendi',
    'success.deleted': 'Başarıyla silindi',
    'success.invited': 'Davet başarıyla gönderildi',
    
    // Language
    'language': 'Dil',
    'language.en': 'English',
    'language.tr': 'Türkçe',

    // App
    'app.name': 'İş Takip',
    'app.platform': 'Platformu',

    // Login Form
    'login.heroDescription': 'Kurumsal iş süreçlerinizi modern ve güvenli bir şekilde yönetin. Ekip işbirliği, görev takibi ve proje yönetimi tek platformda.',
    'login.welcome': 'Hoş Geldiniz',
    'login.subtitle': 'Hesabınıza giriş yaparak devam edin',
    'login.rememberMe': 'Beni hatırla',
    'login.forgotPassword': 'Şifrenizi mi unuttunuz?',
    'login.loggingIn': 'Giriş yapılıyor',
    'login.noAccount': 'Hesabınız yok mu?',
    'login.signUp': 'Kayıt olun',
    'login.sslSecure': 'SSL Güvenli',
    'login.gdprCompliant': 'GDPR Uyumlu',

    // Features
    'features.taskManagement': 'Görev Yönetimi',
    'features.teamCollaboration': 'Ekip İşbirliği',
    'features.analyticsReports': 'Analitik Raporlar',
    'features.bankLevelSecurity': 'Banka Seviyesi Güvenlik',

    // Stats
    'stats.activeUsers': 'Aktif Kullanıcı',
    'stats.uptime': 'Uptime',
    'stats.support': 'Destek',

    // Footer
    'footer.allRightsReserved': 'Tüm hakları saklıdır',

    // Landing Page
    'landing.title': 'İşlerinizi Daha Verimli Yönetin',
    'landing.subtitle': 'Görevler, dokümanlar, toplantılar - hepsi tek platformda',
    'landing.cta': '14 Gün Ücretsiz Dene',

    // Navigation
    'nav.getStarted': 'Başla',

    // Features
    'features.analytics': 'Analitik'
  }
};

const VALID_LANGUAGES = ['en', 'tr'];

export const useSimpleTranslation = () => {
  const [language, setLanguageState] = useState('en'); // Default to 'en' for SSR
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only run on client side after hydration
    const savedLang = localStorage.getItem('language') || 'en';
    // Validate saved language
    if (VALID_LANGUAGES.includes(savedLang)) {
      setLanguageState(savedLang);
    } else {
      setLanguageState('en');
      localStorage.setItem('language', 'en');
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang) => {
    if (typeof window !== 'undefined' && VALID_LANGUAGES.includes(lang)) {
      localStorage.setItem('language', lang);
      document.documentElement.lang = lang;
      window.location.reload();
    }
  };

  const t = (key) => {
    // During SSR and before hydration, always use 'en'
    const lang = mounted ? language : 'en';
    return translations[lang]?.[key] || key;
  };

  const getCurrentLanguage = () => {
    const lang = mounted ? language : 'en';
    const languageNames = {
      en: { name: 'English', flag: '🇺🇸' },
      tr: { name: 'Türkçe', flag: '🇹🇷' }
    };
    return {
      code: lang,
      name: languageNames[lang]?.name || 'English',
      flag: languageNames[lang]?.flag || '🇺🇸'
    };
  };

  return { t, setLanguage, getCurrentLanguage };
};

export default useSimpleTranslation;
