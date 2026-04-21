'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Users, Shield, Bell, Database, Palette, Globe, Lock,
  Mail, Smartphone, CreditCard, FileText, BarChart3, Activity, Zap,
  CheckCircle, XCircle, AlertTriangle, Info, ChevronRight, Save,
  RefreshCw, Eye, EyeOff, Trash2, Plus, Search, Filter, Download,
  Upload, Copy, ExternalLink, HelpCircle, Command, Keyboard, BadgeCheck, Crown,
  Image as ImageIcon, MessageSquare, Globe as GlobeIcon,
  Wifi, WifiOff, Battery, BatteryCharging, BatteryFull, Volume2,
  VolumeX, Mic, MicOff, Camera, CameraOff, Video, VideoOff,
  Cast, Airplay, ScreenShare, CastOff, AirplayOff, ScreenShareOff,
  Maximize, Minimize, Fullscreen, ExitFullscreen, PictureInPicture,
  Grid3x3, LayoutGrid, LayoutList, Rows3, Columns3, SeparatorHorizontal,
  SeparatorVertical, GripVertical, Move, MoveHorizontal, MoveVertical,
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ChevronsLeft, ChevronsRight,
  PanelLeft, PanelRight, PanelTop, PanelBottom, Sidebar, SidebarClose,
  SidebarOpen, Menu, X, Check, Loader2, Sparkles, Star, Heart,
  ThumbsUp, ThumbsDown, MessageCircle, Share2, Bookmark, Flag,
  MoreHorizontal, MoreVertical, EllipsisVertical, DotsHorizontal,
  DotsVertical, GripHorizontal, AlignJustify, Indent, Outdent, List as ListIcon,
  ListOrdered, ListChecks, ListX, ListPlus, ListMinus, ListStart,
  ListEnd, ListTree, ListVideo, ListMusic, ListTodo, ListCollapse,
  ListRestart, ListFilter, ListOrderedBy, ListOrderedByAsc, ListOrderedByDesc,
  UnorderedList, OrderedList, TaskList, TodoList, BulletList, NumberedList,
  CheckboxList, Checklist, NestedList, TreeList, FolderTree, FolderKanban,
  FolderGit, FolderSync, FolderCog, FolderSearch, FolderHeart, FolderInput,
  FolderOutput, FolderX, FolderPlus, FolderMinus, FolderOpen, FolderClosed,
  File, FilePlus, FileMinus, FileX, FileCheck, FileEdit, FileJson,
  FileCode, FileType, FileImage, FileVideo, FileAudio, FileSpreadsheet,
  FileArchive, FileUp, FileDown, FileClock, FileHeart, FileKey, FileLock,
  FileQuestion, FileWarning, FileSearch, FileScan, FileCog, FileCode2,
  FileDigit, FileAxis3d, FileBox, FileStack, FileSymlink, FileTerminal,
  Files, Folder, Folders, FolderRoot, FolderGit2, FolderKanbanSquare,
  StickyNote, Notebook, NotebookPen, NotebookTabs, BookOpen, BookMarked,
  BookX, BookCheck, BookCopy, BookDown, BookUp, BookKey, BookLock,
  BookOpenCheck, BookPlus, BookMinus, Library, Newspaper, Scroll,
  Page, PageUp, PageDown, FileText as FileTextIcon, Type, Text, TextSelect,
  TextCursor, TextCursorInput, TextQuote, Quote, Blockquote, Code, Code2,
  Terminal, TerminalSquare, Command as CommandIcon, Keyboard as KeyboardIcon,
  Mouse, MousePointerClick, Touchpad, Gamepad, Gamepad2, Joystick
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

// ============================================
// ⚙️ WORLD-CLASS ADMIN SETTINGS PANEL
// Google Admin + AWS Console + Vercel Dashboard
// ============================================

const CONTAINER_STYLES = {
  background: 'bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950',
  card: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/30 shadow-lg',
  cardHover: 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
  gradientText: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent',
  button: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-blue-500/25',
  sidebar: 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/30',
  input: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20',
  navItem: 'flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer',
  navItemActive: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg',
  navItemInactive: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
};

const ADMIN_SECTIONS = [
  { id: 'general', name: 'Genel Ayarlar', icon: Settings, description: 'Temel sistem yapılandırması' },
  { id: 'security', name: 'Güvenlik', icon: Shield, description: 'Güvenlik politikaları ve erişim kontrolü' },
  { id: 'roles', name: 'Rütbe Yönetimi', icon: BadgeCheck, description: 'Kullanıcı rütbeleri ve pozisyonlar' },
  { id: 'users', name: 'Kullanıcı Yönetimi', icon: Users, description: 'Kullanıcı rolleri ve izinler' },
  { id: 'notifications', name: 'Bildirimler', icon: Bell, description: 'E-posta ve push bildirim ayarları' },
  { id: 'integrations', name: 'Entegrasyonlar', icon: Zap, description: '3. parti servis bağlantıları' },
  { id: 'backup', name: 'Yedekleme', icon: Database, description: 'Veri yedekleme ve geri yükleme' },
  { id: 'logs', name: 'Sistem Logları', icon: FileText, description: 'Audit logları ve raporlar' },
  { id: 'api', name: 'API & Geliştirici', icon: Command, description: 'API anahtarları ve webhooklar' },
];

export default function AdminSettings() {
  const [activeSection, setActiveSection] = useState('general');
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-settings');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
      // General
      siteName: 'İş Takip',
      siteDescription: 'Profesyonel İş Yönetim Platformu',
      welcomeTitle: 'Panele Hoş Geldin',
      welcomeMessage: 'Bu kişisel panelin. Görevlerini yönetebilir, dokümanlarına erişebilir ve ekibinle işbirliği yapabilirsin.',
      timezone: 'Europe/Istanbul',
      dateFormat: 'DD/MM/YYYY',
      language: 'tr',
      maxFileSize: 10, // MB
      maintenanceMode: false,

      // Security
      twoFactorAuth: true,
      passwordMinLength: 8,
      passwordRequireSpecial: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      ipWhitelist: '',

      // Notifications
      emailNotifications: true,
      pushNotifications: true,
      dailyDigest: true,
      weeklyReport: true,
      mentionNotifications: true,

      // Appearance
      theme: 'system',
      primaryColor: 'blue',
      logo: null,
      logoUrl: null,
      favicon: null,
      customCss: '',

      // Integrations
      slackWebhook: '',
      googleAnalytics: '',
      sentryDsn: '',
      openaiKey: '',

      // SMTP Email
      smtpHost: '',
      smtpPort: '',
      smtpUser: '',
      smtpPass: '',
    };
  });

  const handleSave = async () => {
    setSaving(true);
    // Save to localStorage
    localStorage.setItem('admin-settings', JSON.stringify(settings));
    
    // Also save SMTP to server if configured
    if (settings.smtpHost && settings.smtpPort && settings.smtpUser && settings.smtpPass) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3020/api'}/meetings/configure-smtp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth-storage')).state?.user?.token}`
          },
          body: JSON.stringify({
            smtpHost: settings.smtpHost,
            smtpPort: settings.smtpPort,
            smtpUser: settings.smtpUser,
            smtpPass: settings.smtpPass
          })
        });
        if (response.ok) {
          toast.success('SMTP ayarları kaydedildi! Server\'ı yeniden başlatın.');
        } else {
          toast.error('SMTP ayarları kaydedilemedi');
        }
      } catch (err) {
        console.error('Error saving SMTP:', err);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Ayarlar kaydedildi!');
    setSaving(false);
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo dosyası 2MB\'dan küçük olmalıdır!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('logoUrl', reader.result);
        toast.success('Logo yüklendi!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    handleChange('logoUrl', null);
    toast.success('Logo kaldırıldı!');
  };

  // Role Management State - populated from API
  const [roles, setRoles] = useState([]);

  // Load roles from localStorage on mount
  useEffect(() => {
    try {
      const adminSettings = localStorage.getItem('admin-settings');
      if (adminSettings) {
        const parsed = JSON.parse(adminSettings);
        if (parsed.roles && parsed.roles.length > 0) {
          setRoles(parsed.roles);
        }
      }
    } catch (error) {
      console.error('Error loading roles from localStorage:', error);
    }
  }, []);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    level: 50,
    color: 'bg-blue-500',
    permissions: []
  });

  const availablePermissions = [
    { id: 'all', name: 'Tam Yetki', description: 'Tüm sistem yetkileri' },
    { id: 'admin', name: 'Admin Paneli', description: 'Yönetici ayarlarına erişim' },
    { id: 'users', name: 'Kullanıcı Yönetimi', description: 'Kullanıcıları görüntüleme ve düzenleme' },
    { id: 'tasks', name: 'Görev Yönetimi', description: 'Görev oluşturma ve atama' },
    { id: 'documents', name: 'Doküman Yönetimi', description: 'Doküman erişimi ve paylaşımı' },
    { id: 'meetings', name: 'Toplantı Yönetimi', description: 'Toplantı planlama ve yönetimi' },
    { id: 'analytics', name: 'Raporlar & Analiz', description: 'Analitik ve raporlara erişim' },
    { id: 'settings', name: 'Ayarlar', description: 'Sistem ayarlarını değiştirme' },
    { id: 'view', name: 'Sadece Görüntüleme', description: 'Salt okunur erişim' },
  ];

  const colorOptions = [
    { value: 'bg-purple-500', label: 'Mor', color: '#8b5cf6' },
    { value: 'bg-blue-600', label: 'Lacivert', color: '#2563eb' },
    { value: 'bg-blue-500', label: 'Mavi', color: '#3b82f6' },
    { value: 'bg-cyan-500', label: 'Turkuaz', color: '#06b6d4' },
    { value: 'bg-teal-500', label: 'Yeşil', color: '#14b8a6' },
    { value: 'bg-green-500', label: 'Açık Yeşil', color: '#22c55e' },
    { value: 'bg-orange-500', label: 'Turuncu', color: '#f97316' },
    { value: 'bg-red-500', label: 'Kırmızı', color: '#ef4444' },
    { value: 'bg-pink-500', label: 'Pembe', color: '#ec4899' },
    { value: 'bg-indigo-500', label: 'İndigo', color: '#6366f1' },
    { value: 'bg-slate-500', label: 'Gri', color: '#64748b' },
    { value: 'bg-gray-400', label: 'Açık Gri', color: '#9ca3af' },
    { value: 'bg-gray-300', label: 'Çok Açık Gri', color: '#d1d5db' },
    { value: 'bg-yellow-500', label: 'Sarı', color: '#eab308' },
    { value: 'bg-amber-600', label: 'Kehribar', color: '#d97706' },
  ];

  const saveRolesToStorage = (newRoles) => {
    try {
      const adminSettings = JSON.parse(localStorage.getItem('admin-settings') || '{}');
      adminSettings.roles = newRoles;
      localStorage.setItem('admin-settings', JSON.stringify(adminSettings));
    } catch (error) {
      console.error('Error saving roles:', error);
    }
  };

  const handleRoleSubmit = () => {
    if (!roleForm.name.trim()) {
      toast.error('Rütbe adı zorunludur!');
      return;
    }

    let updatedRoles;
    if (editingRole) {
      updatedRoles = roles.map(r => r.id === editingRole.id ? { ...roleForm, id: r.id } : r);
      setRoles(updatedRoles);
      toast.success('Rütbe güncellendi!');
    } else {
      const newId = Math.max(...roles.map(r => r.id), 0) + 1;
      updatedRoles = [...roles, { ...roleForm, id: newId }];
      setRoles(updatedRoles);
      toast.success('Yeni rütbe oluşturuldu!');
    }

    // Save to localStorage
    saveRolesToStorage(updatedRoles);

    setShowRoleModal(false);
    setEditingRole(null);
    setRoleForm({ name: '', description: '', level: 50, color: 'bg-blue-500', permissions: [] });
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description,
      level: role.level,
      color: role.color,
      permissions: role.permissions || []
    });
    setShowRoleModal(true);
  };

  const handleDeleteRole = (roleId) => {
    if (confirm('Bu rütbeyi silmek istediğinize emin misiniz? Bu rütbeye sahip kullanıcılar etkilenebilir.')) {
      const updatedRoles = roles.filter(r => r.id !== roleId);
      setRoles(updatedRoles);
      saveRolesToStorage(updatedRoles);
      toast.success('Rütbe silindi!');
    }
  };

  const togglePermission = (permId) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-6">
            {/* Site Identity & Logo */}
            <Card className={CONTAINER_STYLES.card}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-500" />
                  Site Kimliği ve Logo
                </CardTitle>
                <CardDescription>Site adı, açıklaması ve logo ayarlarını yapılandırın</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Upload */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <Label>Site Logosu</Label>
                    <div className="mt-2">
                      {settings.logoUrl ? (
                        <div className="relative w-32 h-32 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center bg-slate-50 dark:bg-slate-800 overflow-hidden group">
                          <img 
                            src={settings.logoUrl} 
                            alt="Site Logo" 
                            className="w-full h-full object-contain p-2"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => document.getElementById('logo-upload').click()}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={handleRemoveLogo}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          onClick={() => document.getElementById('logo-upload').click()}
                          className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                        >
                          <Upload className="w-8 h-8 text-slate-400 mb-2" />
                          <span className="text-xs text-slate-500 text-center">Logo Yükle</span>
                        </div>
                      )}
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Max 2MB, PNG/JPG</p>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Site Adı</Label>
                      <Input
                        id="siteName"
                        value={settings.siteName}
                        onChange={(e) => handleChange('siteName', e.target.value)}
                        className={CONTAINER_STYLES.input}
                        placeholder="Örn: İş Takip"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siteDescription">Site Açıklaması</Label>
                      <Input
                        id="siteDescription"
                        value={settings.siteDescription}
                        onChange={(e) => handleChange('siteDescription', e.target.value)}
                        className={CONTAINER_STYLES.input}
                        placeholder="Örn: Profesyonel İş Yönetim Platformu"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxFileSize">Maksimum Dosya Boyutu (MB)</Label>
                      <Input
                        id="maxFileSize"
                        type="number"
                        min="1"
                        max="100"
                        value={settings.maxFileSize}
                        onChange={(e) => handleChange('maxFileSize', parseInt(e.target.value))}
                        className={CONTAINER_STYLES.input}
                        placeholder="Örn: 10"
                      />
                      <p className="text-xs text-slate-500">Kullanıcıların yükleyebileceği maksimum dosya boyutu</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Welcome Message Configuration */}
            <Card className={CONTAINER_STYLES.card}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-500" />
                  Karşılama Mesajı
                </CardTitle>
                <CardDescription>Dashboard'da görüntülenecek karşılama mesajını özelleştirin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="welcomeTitle">Karşılama Başlığı</Label>
                  <Input
                    id="welcomeTitle"
                    value={settings.welcomeTitle}
                    onChange={(e) => handleChange('welcomeTitle', e.target.value)}
                    className={CONTAINER_STYLES.input}
                    placeholder="Örn: Panele Hoş Geldin"
                  />
                  <p className="text-xs text-slate-500">
                    Kullanıcı ismi otomatik olarak eklenecektir. Örnek: "{settings.welcomeTitle || 'Panele Hoş Geldin'}, Admin!"
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="welcomeMessage">Karşılama Açıklaması</Label>
                  <Textarea
                    id="welcomeMessage"
                    value={settings.welcomeMessage}
                    onChange={(e) => handleChange('welcomeMessage', e.target.value)}
                    className={CONTAINER_STYLES.input + ' min-h-[100px]'}
                    placeholder="Örn: Bu kişisel panelin. Görevlerini yönetebilirsin..."
                  />
                </div>
                {/* Preview */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 mb-2">Önizleme:</p>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {settings.welcomeTitle || 'Panele Hoş Geldin'}, Admin!
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    {settings.welcomeMessage || 'Bu kişisel panelin. Görevlerini yönetebilir, dokümanlarına erişebilir ve ekibinle işbirliği yapabilirsin.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Timezone & Maintenance */}
            <Card className={CONTAINER_STYLES.card}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-amber-500" />
                  Diğer Ayarlar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Zaman Dilimi</Label>
                    <Select value={settings.timezone} onValueChange={(v) => handleChange('timezone', v)}>
                      <SelectTrigger className={CONTAINER_STYLES.input}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Istanbul">İstanbul (UTC+3)</SelectItem>
                        <SelectItem value="Europe/London">Londra (UTC+0)</SelectItem>
                        <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (UTC+9)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Tarih Formatı</Label>
                    <Select value={settings.dateFormat} onValueChange={(v) => handleChange('dateFormat', v)}>
                      <SelectTrigger className={CONTAINER_STYLES.input}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-amber-900 dark:text-amber-100">Bakım Modu</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">Siteyi bakım moduna al</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(v) => handleChange('maintenanceMode', v)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <Card className={CONTAINER_STYLES.card}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-500" />
                  Güvenlik Ayarları
                </CardTitle>
                <CardDescription>Güvenlik politikalarını yapılandırın</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">İki Faktörlü Doğrulama (2FA)</p>
                    <p className="text-sm text-slate-500">Tüm kullanıcılar için zorunlu 2FA</p>
                  </div>
                  <Switch 
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(v) => handleChange('twoFactorAuth', v)}
                  />
                </div>
                <Separator />
                <div className="space-y-4">
                  <div>
                    <Label>Şifre Güçlülüğü</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="space-y-2">
                        <Label className="text-sm text-slate-500">Minimum Karakter</Label>
                        <Slider 
                          value={[settings.passwordMinLength]} 
                          onValueChange={([v]) => handleChange('passwordMinLength', v)}
                          max={20} 
                          min={6}
                          step={1}
                        />
                        <p className="text-sm text-slate-600">{settings.passwordMinLength} karakter</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          checked={settings.passwordRequireSpecial}
                          onCheckedChange={(v) => handleChange('passwordRequireSpecial', v)}
                        />
                        <Label className="text-sm">Özel karakter zorunlu</Label>
                      </div>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Oturum Zaman Aşımı (dakika)</Label>
                    <Input 
                      type="number" 
                      value={settings.sessionTimeout}
                      onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                      className={CONTAINER_STYLES.input}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maksimum Giriş Denemesi</Label>
                    <Input 
                      type="number" 
                      value={settings.maxLoginAttempts}
                      onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
                      className={CONTAINER_STYLES.input}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <Card className={CONTAINER_STYLES.card}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" />
                  Bildirim Tercihleri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'E-posta Bildirimleri', desc: 'Önemli olaylar için e-posta al' },
                  { key: 'pushNotifications', label: 'Push Bildirimleri', desc: 'Tarayıcı push bildirimleri' },
                  { key: 'dailyDigest', label: 'Günlük Özet', desc: 'Her gün aktivite özeti' },
                  { key: 'weeklyReport', label: 'Haftalık Rapor', desc: 'Performans raporu' },
                  { key: 'mentionNotifications', label: 'Etiketlenme Bildirimleri', desc: '@mentions bildirimleri' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                    <Switch 
                      checked={settings[item.key]}
                      onCheckedChange={(v) => handleChange(item.key, v)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6">
            {/* SMTP Email Configuration */}
            <Card className={CONTAINER_STYLES.card}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-500" />
                  SMTP Email Ayarları
                </CardTitle>
                <CardDescription>Email gönderimi için SMTP sunucusu yapılandırması</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Gmail için:</strong> Google Hesabı → Güvenlik → 2 Adımlı Doğrulama → Uygulama Şifreleri → 16 haneli şifre alın
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SMTP Host</Label>
                    <Input 
                      value={settings.smtpHost || ''}
                      onChange={(e) => handleChange('smtpHost', e.target.value)}
                      placeholder="smtp.gmail.com"
                      className={CONTAINER_STYLES.input}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SMTP Port</Label>
                    <Input 
                      type="number"
                      value={settings.smtpPort || ''}
                      onChange={(e) => handleChange('smtpPort', e.target.value)}
                      placeholder="587"
                      className={CONTAINER_STYLES.input}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email Adresi</Label>
                  <Input 
                    type="email"
                    value={settings.smtpUser || ''}
                    onChange={(e) => handleChange('smtpUser', e.target.value)}
                    placeholder="adiniz@gmail.com"
                    className={CONTAINER_STYLES.input}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Uygulama Şifresi / SMTP Password</Label>
                  <Input 
                    type="password"
                    value={settings.smtpPass || ''}
                    onChange={(e) => handleChange('smtpPass', e.target.value)}
                    placeholder="16 haneli uygulama şifresi"
                    className={CONTAINER_STYLES.input}
                  />
                </div>
                <button
                  onClick={async () => {
                    try {
                      const authStorage = localStorage.getItem('auth-storage');
                      if (!authStorage) {
                        toast.error('Giriş yapmalısınız');
                        return;
                      }
                      const parsed = JSON.parse(authStorage);
                      const token = parsed.state?.user?.token;
                      
                      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3020/api'}/meetings/test-smtp`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        }
                      });
                      const data = await response.json();
                      if (response.ok) {
                        toast.success('SMTP test başarılı! Email gönderildi.');
                      } else {
                        toast.error('SMTP test başarısız: ' + data.error);
                      }
                    } catch (err) {
                      toast.error('SMTP test hatası: ' + err.message);
                    }
                  }}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                >
                  SMTP Test Yap
                </button>
              </CardContent>
            </Card>

            <Card className={CONTAINER_STYLES.card}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Diğer Entegrasyonlar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Slack Webhook URL</Label>
                  <Input 
                    value={settings.slackWebhook}
                    onChange={(e) => handleChange('slackWebhook', e.target.value)}
                    placeholder="https://hooks.slack.com/services/..."
                    className={CONTAINER_STYLES.input}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Google Analytics ID</Label>
                  <Input 
                    value={settings.googleAnalytics}
                    onChange={(e) => handleChange('googleAnalytics', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className={CONTAINER_STYLES.input}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sentry DSN</Label>
                  <Input 
                    value={settings.sentryDsn}
                    onChange={(e) => handleChange('sentryDsn', e.target.value)}
                    placeholder="https://...@sentry.io/..."
                    className={CONTAINER_STYLES.input}
                  />
                </div>
                <div className="space-y-2">
                  <Label>OpenAI API Key</Label>
                  <Input 
                    type="password"
                    value={settings.openaiKey}
                    onChange={(e) => handleChange('openaiKey', e.target.value)}
                    placeholder="sk-..."
                    className={CONTAINER_STYLES.input}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'backup':
        return (
          <div className="space-y-6 p-8">
            <Card className={CONTAINER_STYLES.card}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-500" />
                  Yedekleme Yönetimi
                </CardTitle>
                <CardDescription>Otomatik yedekleme ayarlarını yapılandırın</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Otomatik Yedekleme</p>
                    <p className="text-sm text-slate-500">Her gün gece 02:00'de otomatik yedekle</p>
                  </div>
                  <Switch checked={true} />
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Yedekleme Sıklığı</Label>
                    <select className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                      <option>Günlük</option>
                      <option>Haftalık</option>
                      <option>Aylık</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Saklama Süresi (gün)</Label>
                    <Input type="number" value="30" />
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Son Yedeklemeler</h4>
                  <div className="space-y-2">
                    {[
                      { date: '2024-01-15 02:00', size: '245 MB', status: 'success' },
                      { date: '2024-01-14 02:00', size: '242 MB', status: 'success' },
                      { date: '2024-01-13 02:00', size: '240 MB', status: 'success' },
                    ].map((backup, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700 last:border-0">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm">{backup.date}</span>
                        </div>
                        <span className="text-sm text-slate-500">{backup.size}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button><Download className="w-4 h-4 mr-2" /> Manuel Yedekle</Button>
                  <Button variant="outline"><Upload className="w-4 h-4 mr-2" /> Geri Yükle</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'logs':
        return (
          <div className="space-y-6 p-8">
            <Card className={CONTAINER_STYLES.card}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  Sistem Logları
                </CardTitle>
                <CardDescription>Sistem aktivitelerini ve hataları görüntüleyin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Input placeholder="Log ara..." className="flex-1" />
                    <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filtrele</Button>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-300 overflow-x-auto">
                    <div className="space-y-1">
                      <p><span className="text-emerald-400">[2024-01-15 10:23:45]</span> <span className="text-blue-400">INFO</span> Kullanıcı girişi başarılı: user@example.com</p>
                      <p><span className="text-emerald-400">[2024-01-15 10:20:12]</span> <span className="text-blue-400">INFO</span> API isteği: GET /api/users</p>
                      <p><span className="text-emerald-400">[2024-01-15 09:45:30]</span> <span className="text-amber-400">WARN</span> Yüksek CPU kullanımı: %85</p>
                      <p><span className="text-emerald-400">[2024-01-15 09:15:00]</span> <span className="text-blue-400">INFO</span> Yedekleme tamamlandı</p>
                      <p><span className="text-emerald-400">[2024-01-15 08:30:22]</span> <span className="text-rose-400">ERROR</span> Veritabanı bağlantı hatası (timeout)</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">Son 24 saat: 1,245 log kaydı</p>
                    <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Dışa Aktar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'roles':
        return (
          <div className="space-y-6 p-8">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className={`${CONTAINER_STYLES.card} border-l-4 border-l-purple-500`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Toplam Rütbe</p>
                      <p className="text-2xl font-bold">{roles.length}</p>
                    </div>
                    <BadgeCheck className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className={`${CONTAINER_STYLES.card} border-l-4 border-l-blue-500`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Yönetici Seviyesi</p>
                      <p className="text-2xl font-bold">{roles.filter(r => r.level >= 80).length}</p>
                    </div>
                    <Crown className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className={`${CONTAINER_STYLES.card} border-l-4 border-l-green-500`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Standart Roller</p>
                      <p className="text-2xl font-bold">{roles.filter(r => r.level >= 40 && r.level < 80).length}</p>
                    </div>
                    <Users className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className={`${CONTAINER_STYLES.card} border-l-4 border-l-gray-400`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Giriş Seviyesi</p>
                      <p className="text-2xl font-bold">{roles.filter(r => r.level < 40).length}</p>
                    </div>
                    <BadgeCheck className="w-8 h-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Roles List */}
            <Card className={CONTAINER_STYLES.card}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BadgeCheck className="w-5 h-5 text-purple-500" />
                      Rütbe Yönetimi
                    </CardTitle>
                    <CardDescription>
                      Şirketiniz için özel kullanıcı rütbeleri oluşturun ve yönetin
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      setEditingRole(null);
                      setRoleForm({ name: '', description: '', level: 50, color: 'bg-blue-500', permissions: [] });
                      setShowRoleModal(true);
                    }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Rütbe
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {roles.sort((a, b) => b.level - a.level).map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${role.color} rounded-xl flex items-center justify-center shadow-lg`}>
                          <BadgeCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-900 dark:text-white">{role.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              Seviye {role.level}
                            </Badge>
                            {role.level >= 80 && <Crown className="w-4 h-4 text-yellow-500" />}
                          </div>
                          <p className="text-sm text-slate-500">{role.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {role.permissions?.map(permId => {
                              const perm = availablePermissions.find(p => p.id === permId);
                              return perm ? (
                                <span
                                  key={permId}
                                  className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-400"
                                >
                                  {perm.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRole(role)}
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Düzenle
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteRole(role.id)}
                          disabled={role.level === 100} // Protect highest level roles
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Role Modal */}
            {showRoleModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4"
                >
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">
                        {editingRole ? 'Rütbe Düzenle' : 'Yeni Rütbe Oluştur'}
                      </h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowRoleModal(false)}>
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Role Name */}
                    <div className="space-y-2">
                      <Label>Rütbe Adı *</Label>
                      <Input
                        value={roleForm.name}
                        onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Örn: Satış Direktörü, Proje Yöneticisi..."
                        className={CONTAINER_STYLES.input}
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label>Açıklama</Label>
                      <Input
                        value={roleForm.description}
                        onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Rütbenin görev ve yetkilerini açıklayın..."
                        className={CONTAINER_STYLES.input}
                      />
                    </div>

                    {/* Level and Color */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Hiyerarşi Seviyesi (1-100)</Label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="1"
                            max="100"
                            value={roleForm.level}
                            onChange={(e) => setRoleForm(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                          />
                          <span className="w-12 text-center font-semibold">{roleForm.level}</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {roleForm.level >= 80 ? '🔴 Yönetici Seviyesi' :
                           roleForm.level >= 50 ? '🟡 Orta Seviye' :
                           roleForm.level >= 30 ? '🟢 Standart' : '⚪ Giriş Seviyesi'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Rütbe Rengi</Label>
                        <div className="grid grid-cols-5 gap-2">
                          {colorOptions.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => setRoleForm(prev => ({ ...prev, color: color.value }))}
                              className={`w-8 h-8 rounded-full ${color.value} ${
                                roleForm.color === color.value ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                              }`}
                              title={color.label}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="space-y-3">
                      <Label>Yetkiler ve İzinler</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availablePermissions.map((perm) => (
                          <label
                            key={perm.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              roleForm.permissions.includes(perm.id)
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <Checkbox
                              checked={roleForm.permissions.includes(perm.id)}
                              onCheckedChange={() => togglePermission(perm.id)}
                            />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{perm.name}</p>
                              <p className="text-xs text-slate-500">{perm.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-2">Önizleme:</p>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${roleForm.color} rounded-lg flex items-center justify-center`}>
                          <BadgeCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">{roleForm.name || 'Rütbe Adı'}</p>
                          <p className="text-xs text-slate-500">Seviye {roleForm.level}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowRoleModal(false)}>
                      İptal
                    </Button>
                    <Button
                      onClick={handleRoleSubmit}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {editingRole ? 'Kaydet' : 'Oluştur'}
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6 p-8">
            <Card className={CONTAINER_STYLES.card}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Command className="w-5 h-5 text-violet-500" />
                  API & Geliştirici
                </CardTitle>
                <CardDescription>API anahtarları ve webhook yapılandırması</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>API Anahtarı</Label>
                  <div className="flex gap-2">
                    <Input value="sk_live_51H8x...9J2m" type="password" readOnly className="font-mono" />
                    <Button variant="outline" size="icon"><Copy className="w-4 h-4" /></Button>
                    <Button variant="outline"><RefreshCw className="w-4 h-4 mr-2" /> Yenile</Button>
                  </div>
                  <p className="text-xs text-slate-500">Bu anahtarı kimseyle paylaşmayın</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <Input placeholder="https://your-app.com/webhook" />
                  <p className="text-xs text-slate-500">Olay bildirimleri bu URL'ye gönderilecek</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <h4 className="font-medium mb-2">API Kullanımı</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-600 dark:text-slate-400">Toplam İstek: <span className="font-semibold text-slate-900 dark:text-white">45,231</span></p>
                    <p className="text-slate-600 dark:text-slate-400">Başarılı: <span className="font-semibold text-emerald-600">98.5%</span></p>
                    <p className="text-slate-600 dark:text-slate-400">Hata: <span className="font-semibold text-rose-600">1.5%</span></p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button><ExternalLink className="w-4 h-4 mr-2" /> API Dokümantasyonu</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8"
          >
            <div className="max-w-4xl">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Hoş Geldiniz
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Admin panelinden sistem ayarlarını yönetebilirsiniz. Sol menüden bir bölüm seçin.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ADMIN_SECTIONS.slice(0, 4).map((section) => (
                  <div 
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <section.icon className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{section.name}</p>
                        <p className="text-xs text-slate-500">{section.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <TooltipProvider>
      <div className={`min-h-screen ${CONTAINER_STYLES.background}`}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className={`w-72 ${CONTAINER_STYLES.sidebar} flex flex-col`}>
            <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/30">
              <h1 className={`text-2xl font-bold ${CONTAINER_STYLES.gradientText}`}>Admin Panel</h1>
              <p className="text-sm text-slate-500 mt-1">Sistem yapılandırması</p>
            </div>
            <ScrollArea className="flex-1 p-4">
              <nav className="space-y-1">
                {ADMIN_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`${CONTAINER_STYLES.navItem} ${
                      activeSection === section.id ? CONTAINER_STYLES.navItemActive : CONTAINER_STYLES.navItemInactive
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    <div className="flex-1 text-left">
                      <p className="font-medium">{section.name}</p>
                      <p className="text-xs opacity-80 hidden">{section.description}</p>
                    </div>
                    {activeSection === section.id && <ChevronRight className="w-4 h-4" />}
                  </button>
                ))}
              </nav>
            </ScrollArea>
            <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/30">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-500 text-white text-sm">
                    AD
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">Admin Kullanıcı</p>
                  <p className="text-xs text-slate-500 truncate">admin@sirket.com</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-8 py-6 border-b border-slate-200/50 dark:border-slate-700/30 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {ADMIN_SECTIONS.find(s => s.id === activeSection)?.name}
                </h2>
                <p className="text-sm text-slate-500">
                  {ADMIN_SECTIONS.find(s => s.id === activeSection)?.description}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => window.location.reload()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Yenile
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className={CONTAINER_STYLES.button}
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
            </header>

            {/* Content */}
            <ScrollArea className="flex-1 p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-4xl"
                >
                  {renderSectionContent()}
                </motion.div>
              </AnimatePresence>
            </ScrollArea>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
