'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAutoRefresh } from '@/hooks/usePolling';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/stores/authStore';
import { toast } from 'sonner';
import {
  Users, Search, UserPlus, Plus, Pencil, Trash2, Mail, Shield, Crown, CheckCircle, XCircle,
  MoreVertical, Grid3x3, List, TrendingUp, Activity, Clock, Layers, UserCheck, Zap,
  LayoutGrid, X, Settings2, CheckCheck, Briefcase, Building2, Phone, Kanban,
  Trash, RefreshCw, Sparkles, Send, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================
// 🌟 WORLD-CLASS USER MANAGEMENT COMPONENT
// Asana, Trello, Notion'dan Daha İyi!
// ============================================

const CONTAINER_STYLES = {
  background: 'bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950',
  card: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg shadow-slate-200/50 dark:shadow-black/20',
  cardHover: 'hover:shadow-xl hover:shadow-slate-300/50 dark:hover:shadow-slate-800/30 hover:-translate-y-0.5',
  button: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40',
  input: 'bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20',
  badge: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
  gradientText: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent',
  glass: 'bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/30 dark:border-slate-700/40',
  statsCard: 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200/60 dark:border-slate-700/40',
};

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  },
  card: {
    hover: { scale: 1.02, y: -4, transition: { duration: 0.2 } },
    tap: { scale: 0.98 }
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  }
};

export default function UserManagement({ workspaceId, onlineOnly = false }) {
  // 🎯 State Management
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, kanban
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkActionMode, setBulkActionMode] = useState(false);
  
  // 🎨 UI States
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'MEMBER' });
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    position: '',
    department: '',
    role: 'MEMBER'
  });
  
  // 🎭 Roles Management - populated from API
  const [roles, setRoles] = useState([]);

  // 📊 Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    online: 0,
    admins: 0,
    newThisMonth: 0
  });

  // 🔄 Fetch Data & Load Roles
  useEffect(() => {
    fetchUsers(true); // Show loading on initial
    fetchGroups();
    loadRolesFromAdminSettings();
  }, []);

  // Auto-refresh users every 10 seconds when page is visible
  useAutoRefresh(useCallback(() => {
    fetchUsers(false); // Don't show loading spinner on auto-refresh
  }, []), 10000);

  // Load roles from AdminSettings localStorage only
  const loadRolesFromAdminSettings = () => {
    try {
      const adminSettings = localStorage.getItem('admin-settings');
      if (adminSettings) {
        const parsed = JSON.parse(adminSettings);
        if (parsed.roles && parsed.roles.length > 0) {
          console.log('Loaded roles from admin-settings:', parsed.roles);
          setRoles(parsed.roles);
        } else {
          console.log('No roles found in admin-settings');
          setRoles([]);
        }
      } else {
        console.log('No admin-settings found in localStorage');
        setRoles([]);
      }
    } catch (error) {
      console.error('Error loading roles from admin settings:', error);
      setRoles([]);
    }
  };

  const fetchUsers = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await api.get('/users/workspace/1');
      const userData = response.data.users || [];
      setUsers(userData);
      
      // Calculate stats
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      
      setStats({
        total: userData.length,
        online: userData.filter(u => u.isOnline === true).length,
        admins: userData.filter(u => u.role === 'ADMIN' || u.role === 'MANAGER').length,
        newThisMonth: userData.filter(u => {
          const joinDate = new Date(u.createdAt);
          return joinDate.getMonth() === thisMonth && joinDate.getFullYear() === thisYear;
        }).length
      });
    } catch (error) {
      toast.error('Kullanıcılar yüklenirken hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups?workspaceId=1');
      setGroups(response.data.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  // 🔍 Filter Users
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Online only filter (from prop)
    if (onlineOnly) {
      filtered = filtered.filter(u => u.isOnline === true);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u.firstName?.toLowerCase().includes(query) ||
        u.lastName?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.position?.toLowerCase().includes(query) ||
        u.department?.toLowerCase().includes(query)
      );
    }

    // Tab filter (only apply if not onlineOnly mode)
    if (!onlineOnly) {
      switch (activeTab) {
        case 'online':
          filtered = filtered.filter(u => u.isOnline === true);
          break;
        case 'admins':
          filtered = filtered.filter(u => u.role === 'ADMIN' || u.role === 'MANAGER');
          break;
        case 'recent':
          const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(u => new Date(u.createdAt) > lastWeek);
          break;
      }
    }
    
    return filtered;
  }, [users, searchQuery, activeTab]);

  // 👤 User Actions
  const handleInviteUser = async (userData) => {
    console.log('Inviting user with data:', userData);
    try {
      const response = await api.post('/users/invite', { ...userData, workspaceId: '1' });
      console.log('Invite response:', response.data);
      toast.success('Kullanıcı davet edildi!');
      setShowInviteModal(false);
      setInviteForm({ email: '', role: 'MEMBER' });
      fetchUsers();
    } catch (error) {
      console.error('Invite error:', error);
      toast.error(error.response?.data?.error || 'Davet gönderilemedi');
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      await api.put(`/users/${userId}`, updates);
      toast.success('Kullanıcı güncellendi!');
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      toast.error('Güncelleme başarısız');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    
    try {
      await api.delete(`/users/${userId}`);
      toast.success('Kullanıcı silindi');
      fetchUsers();
    } catch (error) {
      toast.error('Silme işlemi başarısız');
    }
  };

  const handleBulkAction = async (action) => {
    try {
      switch (action) {
        case 'delete':
          if (!confirm(`${selectedUsers.length} kullanıcıyı silmek istediğinize emin misiniz?`)) return;
          await Promise.all(selectedUsers.map(id => api.delete(`/users/${id}`)));
          toast.success(`${selectedUsers.length} kullanıcı silindi`);
          break;
      }
      setSelectedUsers([]);
      setBulkActionMode(false);
      fetchUsers();
    } catch (error) {
      toast.error('Toplu işlem başarısız');
    }
  };

  // 🎨 Render Functions
  const renderStatsCards = () => (
    <motion.div 
      variants={ANIMATION_VARIANTS.container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {[
        { label: 'Toplam Kullanıcı', value: stats.total, icon: Users, color: 'from-blue-500 to-cyan-500', trend: '+12%', filter: 'all' },
        { label: 'Çevrimiçi', value: stats.online, icon: Zap, color: 'from-amber-500 to-orange-500', trend: '+3%', filter: 'online' },
        { label: 'Yöneticiler', value: stats.admins, icon: Crown, color: 'from-violet-500 to-purple-500', trend: '+1', filter: 'admins' },
        { label: 'Yeni Bu Ay', value: stats.newThisMonth, icon: Sparkles, color: 'from-pink-500 to-rose-500', trend: '+5', filter: 'recent' }
      ].map((stat, index) => (
        <motion.div
          key={stat.label}
          variants={ANIMATION_VARIANTS.item}
          whileHover={ANIMATION_VARIANTS.card.hover}
          onClick={() => setActiveTab(stat.filter)}
          className={`relative overflow-hidden rounded-2xl ${CONTAINER_STYLES.statsCard} p-5 group cursor-pointer ${activeTab === stat.filter ? 'ring-2 ring-blue-500' : ''}`}
        >
          <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-8 -mt-8 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500`} />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg shadow-blue-500/20`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                {stat.trend}
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  const renderToolbar = () => (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col sm:flex-row gap-4 mb-6 p-4 rounded-2xl ${CONTAINER_STYLES.glass}`}
    >
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Kullanıcı ara (isim, email, pozisyon...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`pl-12 h-12 ${CONTAINER_STYLES.input} rounded-xl`}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* View Mode Toggle */}
      <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v)} className="bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl">
        <ToggleGroupItem value="grid" aria-label="Grid view">
          <LayoutGrid className="w-4 h-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label="List view">
          <List className="w-4 h-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="kanban" aria-label="Kanban view">
          <Kanban className="w-4 h-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Actions */}
      <div className="flex gap-2">
        {bulkActionMode ? (
          <>
            <Button variant="outline" onClick={() => setBulkActionMode(false)} className="h-12">
              <X className="w-4 h-4 mr-2" />
              İptal
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12">
                  <Settings2 className="w-4 h-4 mr-2" />
                  Toplu İşlem ({selectedUsers.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>İşlem Seç</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBulkAction('delete')} className="text-red-600">
                  <Trash className="w-4 h-4 mr-2" />
                  Seçilileri Sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Button 
              variant="outline" 
              onClick={() => setBulkActionMode(true)}
              className="h-12 hidden sm:flex"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Seç
            </Button>
            <Button 
              onClick={() => setShowInviteModal(true)}
              className={`h-12 ${CONTAINER_STYLES.button}`}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Davet Et</span>
              <span className="sm:hidden">Davet</span>
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );

  const renderUserListItem = (user) => (
    <motion.div
      layout
      variants={ANIMATION_VARIANTS.item}
      whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
      className={`flex items-center gap-4 p-3 rounded-xl ${CONTAINER_STYLES.card} border border-slate-200 dark:border-slate-700 cursor-pointer`}
    >
      {/* Checkbox */}
      {bulkActionMode && (
        <Checkbox
          checked={selectedUsers.includes(user.id)}
          onCheckedChange={(checked) => {
            if (checked) {
              setSelectedUsers([...selectedUsers, user.id]);
            } else {
              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
            }
          }}
          className="h-4 w-4"
        />
      )}

      {/* Avatar */}
      <Avatar className="w-10 h-10">
        <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
        <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-violet-500 text-white">
          {user.firstName?.[0]}{user.lastName?.[0]}
        </AvatarFallback>
      </Avatar>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-slate-900 dark:text-white truncate">
            {user.firstName} {user.lastName}
          </h3>
          {/* Online Indicator */}
          <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
        </div>
        <p className="text-xs text-slate-500 truncate">{user.email}</p>
      </div>

      {/* Role Badge */}
      <div className="hidden sm:block">
        {user.role === 'ADMIN' ? (
          <Badge className="bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs">
            <Crown className="w-3 h-3 mr-1" />
            Yönetici
          </Badge>
        ) : user.role === 'MANAGER' ? (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs">
            <Shield className="w-3 h-3 mr-1" />
            Müdür
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs text-slate-600">
            <Users className="w-3 h-3 mr-1" />
            Üye
          </Badge>
        )}
      </div>

      {/* Online Status - only show when online */}
      <div className="hidden md:block">
        {user.isOnline && (
          <Badge 
            variant="default" 
            className="bg-emerald-100 text-emerald-700 text-xs"
          >
            🟢 Çevrimiçi
          </Badge>
        )}
      </div>

      {/* Groups */}
      <div className="hidden lg:block text-sm text-slate-600">
        {user.groups?.length > 0 ? (
          <span className="flex items-center gap-1">
            <Layers className="w-4 h-4" />
            {user.groups.length} grup
          </span>
        ) : (
          <span className="text-slate-400">-</span>
        )}
      </div>

      {/* Join Date */}
      <div className="hidden xl:block text-sm text-slate-500">
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : '-'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedUser(user);
            setEditForm({
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              email: user.email || '',
              position: user.position || '',
              department: user.department || '',
              role: user.role || 'MEMBER',
              isActive: user.isActive !== false
            });
            setShowEditModal(true);
          }}
        >
          <Pencil className="w-4 h-4 text-slate-400" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            deleteUser(user.id);
          }}
        >
          <Trash2 className="w-4 h-4 text-slate-400" />
        </Button>
      </div>
    </motion.div>
  );

  const renderUserCard = (user) => (
    <motion.div
      layout
      variants={ANIMATION_VARIANTS.item}
      whileHover={ANIMATION_VARIANTS.card.hover}
      whileTap={ANIMATION_VARIANTS.card.tap}
      className={`relative group rounded-2xl ${CONTAINER_STYLES.card} ${CONTAINER_STYLES.cardHover} overflow-hidden ${
        user.isOnline ? 'ring-2 ring-emerald-500 ring-opacity-50 shadow-lg shadow-emerald-500/20' : ''
      }`}
    >
      {/* Selection Checkbox */}
      {bulkActionMode && (
        <div className="absolute top-4 left-4 z-20">
          <Checkbox
            checked={selectedUsers.includes(user.id)}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedUsers([...selectedUsers, user.id]);
              } else {
                setSelectedUsers(selectedUsers.filter(id => id !== user.id));
              }
            }}
            className="h-5 w-5 border-2 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
        </div>
      )}

      {/* Online Indicator */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`w-4 h-4 rounded-full ${user.isOnline ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse' : 'bg-slate-300'} ring-2 ring-white dark:ring-slate-800`} />
        {user.isOnline && (
          <div className="absolute inset-0 w-4 h-4 rounded-full bg-emerald-500 animate-ping opacity-75" />
        )}
      </div>

      <div className="p-6">
        {/* Avatar & Basic Info */}
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-16 h-16 ring-4 ring-white dark:ring-slate-700 shadow-lg">
            <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
            <AvatarFallback className="text-xl bg-gradient-to-br from-blue-500 to-violet-500 text-white">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white text-lg truncate">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {/* Online Status Badge - only show when online */}
              {user.isOnline && (
                <Badge 
                  variant="default" 
                  className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                >
                  🟢 Çevrimiçi
                </Badge>
              )}
              
              {/* Role Badge */}
              {user.role === 'ADMIN' ? (
                <Badge className="bg-gradient-to-r from-violet-500 to-purple-500 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Yönetici
                </Badge>
              ) : user.role === 'MANAGER' ? (
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  <Shield className="w-3 h-3 mr-1" />
                  Müdür
                </Badge>
              ) : (
                <Badge variant="outline" className="text-slate-600">
                  <Users className="w-3 h-3 mr-1" />
                  Üye
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          {user.position && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span>{user.position}</span>
            </div>
          )}
          {user.department && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>{user.department}</span>
            </div>
          )}
          {user.phone && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{user.phone}</span>
            </div>
          )}
          {/* Groups */}
          {user.groups && user.groups.length > 0 && (
            <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Layers className="w-4 h-4 text-slate-400 mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {user.groups.slice(0, 2).map((group) => (
                  <Badge key={group.id} variant="outline" className="text-xs bg-slate-50">
                    {group.name}
                  </Badge>
                ))}
                {user.groups.length > 2 && (
                  <Badge variant="outline" className="text-xs">+{user.groups.length - 2}</Badge>
                )}
              </div>
            </div>
          )}
          {/* Join Date */}
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-500">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : 'Tarih bilinmiyor'}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-100 dark:border-slate-700">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-900 dark:text-white">{user.taskCount || 0}</p>
            <p className="text-xs text-slate-500">Görev</p>
          </div>
          <div className="text-center border-x border-slate-100 dark:border-slate-700">
            <p className="text-lg font-bold text-slate-900 dark:text-white">{user.completedTasks || 0}</p>
            <p className="text-xs text-slate-500">Tamamlandı</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-900 dark:text-white">{user.groups?.length || 0}</p>
            <p className="text-xs text-slate-500">Grup</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => {
              setSelectedUser(user);
              setEditForm({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                position: user.position || '',
                department: user.department || '',
                role: user.role || 'MEMBER'
              });
              setShowEditModal(true);
            }}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Düzenle
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="px-2">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                setSelectedUser(user);
                setEditForm({
                  firstName: user.firstName || '',
                  lastName: user.lastName || '',
                  position: user.position || '',
                  department: user.department || '',
                  role: user.role || 'MEMBER'
                });
                setShowEditModal(true);
              }}>
                <Pencil className="w-4 h-4 mr-2" />
                Profili Düzenle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Kullanıcıyı Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );

  // Main Render
  return (
    <TooltipProvider>
      <div className={`min-h-screen p-6 ${CONTAINER_STYLES.background}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className={`text-3xl sm:text-4xl font-bold ${CONTAINER_STYLES.gradientText} mb-2`}>
                  Takım Yönetimi
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Çalışanlarınızı yönetin, gruplar oluşturun ve işbirliğini artırın
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowGroupModal(true)} className="h-12">
                  <Layers className="w-4 h-4 mr-2" />
                  Gruplar
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          {renderStatsCards()}

          {/* Filter Indicator */}
          <div className="flex items-center gap-2 mb-4 px-1">
            <span className="text-sm text-slate-500 dark:text-slate-400">Filtre:</span>
            <Badge variant="secondary" className="capitalize">
              {activeTab === 'all' && 'Tümü'}
              {activeTab === 'online' && 'Çevrimiçi'}
              {activeTab === 'admins' && 'Yöneticiler'}
              {activeTab === 'recent' && 'Yeni Bu Ay'}
            </Badge>
            <button 
              onClick={() => setActiveTab('all')}
              className="text-xs text-blue-500 hover:text-blue-600 ml-2"
            >
              Sıfırla
            </button>
          </div>

          {/* Toolbar */}
          {renderToolbar()}

          {/* Users Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="h-80">
                  <CardContent className="p-6">
                    <Skeleton className="w-16 h-16 rounded-full mb-4" />
                    <Skeleton className="w-3/4 h-6 mb-2" />
                    <Skeleton className="w-1/2 h-4 mb-4" />
                    <Skeleton className="w-full h-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Users className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Kullanıcı Bulunamadı
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Arama kriterlerinize uygun kullanıcı bulunmuyor.
              </p>
              <Button onClick={() => { setSearchQuery(''); setActiveTab('all'); }} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Filtreleri Temizle
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              variants={ANIMATION_VARIANTS.container}
              initial="hidden"
              animate="show"
              className={`${
                viewMode === 'list' 
                  ? 'flex flex-col gap-2' 
                  : `grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`
              }`}
            >
              {filteredUsers.map((user) => 
                viewMode === 'list' ? 
                  <React.Fragment key={user.id}>{renderUserListItem(user)}</React.Fragment> : 
                  <React.Fragment key={user.id}>{renderUserCard(user)}</React.Fragment>
              )}
            </motion.div>
          )}

          {/* Results Count */}
          {!loading && filteredUsers.length > 0 && (
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
              {filteredUsers.length} kullanıcı gösteriliyor (Toplam: {users.length})
            </p>
          )}
        </div>

        {/* Invite Modal */}
        <Dialog open={showInviteModal} onOpenChange={(open) => {
          setShowInviteModal(open);
          if (!open) setInviteForm({ email: '', role: 'MEMBER' });
        }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-500" />
                Yeni Kullanıcı Davet Et
              </DialogTitle>
              <DialogDescription>
                Ekibinize yeni bir kullanıcı davet edin. Davet e-posta olarak gönderilecektir.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>💡 Bilgi:</strong> Kullanıcıya şifre belirleme linki içeren bir davet e-postası gönderilecektir. 
                  Kullanıcı e-postasındaki linke tıklayarak kendi şifresini oluşturabilir.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-email">E-posta Adresi</Label>
                <Input 
                  id="invite-email" 
                  type="email" 
                  placeholder="ornek@sirket.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">Rol</Label>
                <Select 
                  value={inviteForm.role}
                  onValueChange={(value) => setInviteForm({...inviteForm, role: value})}
                >
                  <SelectTrigger id="invite-role">
                    <SelectValue placeholder="Rol seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${role.color}`} />
                          <span>{role.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInviteModal(false)}>İptal</Button>
              <Button 
                onClick={() => handleInviteUser(inviteForm)} 
                className={CONTAINER_STYLES.button}
                disabled={!inviteForm.email}
              >
                <Send className="w-4 h-4 mr-2" />
                Davet Gönder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Groups Modal */}
        <Dialog open={showGroupModal} onOpenChange={setShowGroupModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-500" />
                Grup Yönetimi
              </DialogTitle>
              <DialogDescription>
                Çalışan gruplarını oluşturun ve yönetin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Create New Group */}
              <div className="flex gap-2">
                <Input 
                  placeholder="Yeni grup adı..." 
                  id="newGroupName"
                />
                <Button 
                  onClick={() => {
                    const input = document.getElementById('newGroupName');
                    if (input?.value.trim()) {
                      const newGroup = {
                        id: Date.now().toString(),
                        name: input.value.trim(),
                        memberCount: 0,
                        createdAt: new Date().toISOString()
                      };
                      setGroups([...groups, newGroup]);
                      toast.success('Grup oluşturuldu');
                      input.value = '';
                    }
                  }}
                  className={CONTAINER_STYLES.button}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ekle
                </Button>
              </div>
              
              {/* Groups List */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {groups.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Layers className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Henüz grup oluşturulmadı</p>
                  </div>
                ) : (
                  groups.map((group) => (
                    <div 
                      key={group.id}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                          {group.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{group.name}</p>
                          <p className="text-xs text-slate-500">{group.memberCount || 0} üye</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedGroup(group);
                            toast.info(`${group.name} grubu seçildi`);
                          }}
                        >
                          <Users className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setGroups(groups.filter(g => g.id !== group.id));
                            toast.success('Grup silindi');
                          }}
                        >
                          <Trash className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowGroupModal(false)}>Kapat</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-500" />
                Kullanıcı Düzenle
              </DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedUser.avatar} />
                    <AvatarFallback>{selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedUser.firstName} {selectedUser.lastName}</h3>
                    <p className="text-sm text-slate-500">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ad</Label>
                    <Input 
                      value={editForm.firstName} 
                      onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Soyad</Label>
                    <Input 
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Pozisyon</Label>
                  <Input 
                    value={editForm.position}
                    onChange={(e) => setEditForm({...editForm, position: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Departman</Label>
                  <Input 
                    value={editForm.department}
                    onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rütbe</Label>
                  <Select 
                    value={editForm.role}
                    onValueChange={(value) => setEditForm({...editForm, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Rol seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${role.color}`} />
                            <span>{role.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Group Selection */}
                <div className="space-y-2">
                  <Label>Gruplar</Label>
                  <div className="max-h-32 overflow-y-auto space-y-1 border rounded-md p-2">
                    {groups.length === 0 ? (
                      <p className="text-sm text-slate-500">Henüz grup oluşturulmadı</p>
                    ) : (
                      groups.map((group) => (
                        <div key={group.id} className="flex items-center gap-2">
                          <Checkbox 
                            id={`group-${group.id}`}
                            checked={selectedUser?.groups?.some(g => g.id === group.id)}
                            onCheckedChange={(checked) => {
                              const currentGroups = selectedUser?.groups || [];
                              if (checked) {
                                selectedUser.groups = [...currentGroups, group];
                              } else {
                                selectedUser.groups = currentGroups.filter(g => g.id !== group.id);
                              }
                            }}
                          />
                          <Label htmlFor={`group-${group.id}`} className="text-sm cursor-pointer">
                            {group.name}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>İptal</Button>
              <Button 
                onClick={() => {
                  if (selectedUser) {
                    handleUpdateUser(selectedUser.id, {
                      firstName: editForm.firstName,
                      lastName: editForm.lastName,
                      position: editForm.position,
                      department: editForm.department,
                      role: editForm.role,
                      groups: selectedUser.groups
                    });
                  }
                }}
                className={CONTAINER_STYLES.button}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Kaydet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
