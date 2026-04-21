'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAutoRefresh } from '@/hooks/usePolling';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, BarChart3, PieChart, Activity, TrendingUp, TrendingDown,
  Users, UserPlus, UserCheck, Clock, CheckCircle, XCircle, AlertCircle,
  Calendar, CalendarDays, CalendarRange, Clock4, Timer, Hourglass,
  Zap, Sparkles, Star, Heart, ThumbsUp, MessageSquare, Bell, Settings,
  Search, Filter, Download, Share2, MoreHorizontal, Plus, Minus,
  ArrowUpRight, ArrowDownRight, ChevronRight, ChevronLeft, ChevronUp,
  ChevronDown, ChevronsUp, ChevronsDown, Maximize2, Minimize2, Expand,
  Shrink, Target, Flag, FlagTriangle, Bookmark, BookmarkCheck, BookmarkX,
  Pin, PinOff, Archive, ArchiveRestore, ArchiveX, Inbox, Mail, Send,
  FileText, FilePlus, FileMinus, FileX, FileCheck, Folder, FolderOpen,
  FolderClosed, FolderPlus, FolderMinus, FolderTree, Briefcase, Building2,
  Building, Home, MapPin, Navigation, Compass, Globe, Globe2, World,
  Plane, Car, Bus, Train, Ship, Bike, Walk, Footprints, Anchor,
  Mountain, Tent, TreePine, TreeDeciduous, Flower, Leaf, Sprout,
  Sun, Moon, Cloud, CloudRain, CloudSnow, CloudLightning, Wind,
  Thermometer, Droplets, Umbrella, Snowflake, Flame, FireExtinguisher,
  Smoke, CloudFog, Tornado, Hurricane, Rainbow, Eclipse, Sunrise, Sunset,
  MoonStar, Stars, Rocket, Satellite, Telescope, Microscope, GlassWater,
  FlaskConical, FlaskRound, Atom, Dna, Microscope2, Pill, Stethoscope,
  HeartPulse, Activity2, Brain, Eye, Ear, Bone, Weight, Ruler, Scale,
  Gauge, GaugeCircle, GaugeSquare, GaugeMinimal, GaugeSimple
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { api } from '@/stores/authStore';

// ============================================
// 🎯 WORLD-CLASS PROFESSIONAL OVERVIEW
// Dashboard Ana Sayfa - Vercel + Linear Tarzı
// ============================================

const CONTAINER_STYLES = {
  background: 'bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950',
  card: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/30 shadow-lg',
  cardHover: 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
  gradientText: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent',
  button: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-blue-500/25',
  heroGradient: 'bg-gradient-to-r from-blue-600 via-indigo-600 via-purple-600 to-pink-600',
  glass: 'bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/30 dark:border-slate-700/40',
};

// Real data state - initially empty
const useDashboardData = () => {
  const [data, setData] = useState({
    stats: {
      tasksCompleted: 0,
      tasksTotal: 0,
      meetingsToday: 0,
      unreadMessages: 0,
      pendingApprovals: 0,
      weeklyProgress: 0,
    },
    recentActivity: [],
    upcoming: [],
    team: [],
    productivity: {
      week: [0, 0, 0, 0, 0, 0, 0],
      focus: 0,
      tasksPerDay: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  // Auto-refresh every 10 seconds when page is visible
  useAutoRefresh(useCallback(() => {
    fetchDashboardData(false); // false = don't show loading spinner on refresh
  }, []), 10000);

  useEffect(() => {
    fetchDashboardData(true); // true = show loading on initial load
  }, []);

  const fetchDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      // Fetch tasks
      const tasksResponse = await api.get('/tasks?workspaceId=1');
      const tasks = tasksResponse.data.tasks || [];
      
      // Fetch users for team
      const usersResponse = await api.get('/users/workspace/1');
      const users = usersResponse.data.users || [];
      
      // Fetch meetings
      const meetingsResponse = await api.get('/meetings?workspaceId=1');
      const meetings = meetingsResponse.data.meetings || [];
      
      // Calculate stats
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED').length;
      const pendingTasks = tasks.filter(t => t.status === 'TODO' || t.status === 'IN_PROGRESS').length;
      
      // Today's meetings
      const today = new Date().toISOString().split('T')[0];
      const todayMeetings = meetings.filter(m => m.date?.startsWith(today)).length;
      
      // Team data from real users
      const teamData = users.map((u, i) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        role: u.position || 'Team Member',
        status: u.isActive ? 'online' : 'offline',
        avatar: u.avatar,
      }));
      
      // Generate real activity from tasks
      const activities = tasks
        .filter(t => t.updatedAt)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5)
        .map((task, i) => ({
          id: task.id,
          type: task.status === 'DONE' ? 'task' : 'milestone',
          title: task.title,
          time: formatTimeAgo(task.updatedAt),
          icon: task.status === 'DONE' ? CheckCircle : Flag,
          color: task.status === 'DONE' ? 'emerald' : 'blue',
        }));
      
      // Upcoming from due dates
      const upcomingItems = tasks
        .filter(t => t.dueDate && new Date(t.dueDate) >= new Date())
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 3)
        .map(task => ({
          id: task.id,
          title: task.title,
          time: new Date(task.dueDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          type: 'task',
          priority: task.priority?.toLowerCase() || 'medium',
        }));
      
      setData({
        stats: {
          tasksCompleted: completedTasks,
          tasksTotal: totalTasks,
          meetingsToday: todayMeetings,
          unreadMessages: 0, // Will be fetched from messages API
          pendingApprovals: pendingTasks,
          weeklyProgress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        },
        recentActivity: activities.length > 0 ? activities : [],
        upcoming: upcomingItems.length > 0 ? upcomingItems : [],
        team: teamData.length > 0 ? teamData : [],
        productivity: {
          week: [0, 0, 0, 0, 0, 0, 0], // Will be calculated from time tracking
          focus: 0,
          tasksPerDay: totalTasks > 0 ? (completedTasks / 7).toFixed(1) : 0,
        },
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays === 1) return 'Dün';
    return `${diffDays} gün önce`;
  };

  return { data, loading, refetch: fetchDashboardData };
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
};

// Components
const StatWidget = ({ title, value, subtitle, icon: Icon, trend, trendValue, color, onClick }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ scale: 1.02, y: -4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`${CONTAINER_STYLES.card} ${CONTAINER_STYLES.cardHover} p-5 rounded-2xl cursor-pointer group`}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

const ActivityItem = ({ activity, onClick }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    onClick={onClick}
    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
  >
    <div className={`w-10 h-10 rounded-lg bg-${activity.color}-100 dark:bg-${activity.color}-900/30 flex items-center justify-center flex-shrink-0`}>
      <activity.icon className={`w-5 h-5 text-${activity.color}-600`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {activity.title}
      </p>
      <p className="text-xs text-slate-500">{activity.time}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
  </motion.div>
);

const TeamMember = ({ member }) => (
  <motion.div 
    whileHover={{ scale: 1.05 }}
    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
  >
    <div className="relative">
      <Avatar className="w-10 h-10 ring-2 ring-white dark:ring-slate-800">
        <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-violet-500 text-white">
          {member.name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${
        member.status === 'online' ? 'bg-emerald-500' :
        member.status === 'busy' ? 'bg-amber-500' :
        'bg-slate-300'
      }`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{member.name}</p>
      <p className="text-xs text-slate-500 truncate">{member.role}</p>
    </div>
  </motion.div>
);

const MiniChart = ({ data, onClick }) => (
  <div className="h-16 flex items-end gap-1 cursor-pointer" onClick={onClick}>
    {data.map((value, index) => (
      <motion.div
        key={index}
        initial={{ height: 0 }}
        animate={{ height: `${value}%` }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        className="flex-1 rounded-t bg-violet-500/60 hover:bg-violet-500 transition-colors"
        style={{ minHeight: '4px' }}
      />
    ))}
  </div>
);

export default function ProfessionalOverview({ onTabChange }) {
  const router = useRouter();
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const { data: dashboardData, loading } = useDashboardData();
  const [siteSettings, setSiteSettings] = useState({
    welcomeTitle: 'Panele Hoş Geldin',
    welcomeMessage: 'Bu kişisel panelin. Görevlerini yönetebilir, dokümanlarına erişebilir ve ekibinle işbirliği yapabilirsin.',
    logoUrl: null
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Günaydın');
    else if (hour < 18) setGreeting('İyi günler');
    else setGreeting('İyi akşamlar');

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);

    // Load site settings from localStorage
    const savedSettings = localStorage.getItem('admin-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSiteSettings(prev => ({
        ...prev,
        welcomeTitle: parsed.welcomeTitle || prev.welcomeTitle,
        welcomeMessage: parsed.welcomeMessage || prev.welcomeMessage,
        logoUrl: parsed.logoUrl || null
      }));
    }

    return () => clearInterval(timer);
  }, []);

  const handleActivityClick = (activity) => {
    if (onTabChange) {
      if (activity.type === 'task') onTabChange('tasks');
      else if (activity.type === 'meeting') onTabChange('meetings');
      else if (activity.type === 'message') onTabChange('messages');
      else if (activity.type === 'document') onTabChange('documents');
      else if (activity.type === 'note') onTabChange('notes');
    }
  };

  return (
    <TooltipProvider>
      <div className={`min-h-screen p-4 sm:p-6 lg:p-8 ${CONTAINER_STYLES.background}`}>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto space-y-6"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="relative overflow-hidden">
            <div className={`${CONTAINER_STYLES.heroGradient} rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden`}>
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <circle cx="5" cy="5" r="1" fill="currentColor" />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#grid)" />
                </svg>
              </div>
              
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Logo - Left side of welcome message */}
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-white/80 text-lg mb-1"
                    >
                      {greeting} 👋
                    </motion.p>
                  <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl sm:text-4xl font-bold mb-2"
                  >
                    {siteSettings.welcomeTitle || 'Panele Hoş Geldin'}, Admin!
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-white/70"
                  >
                    {siteSettings.welcomeMessage || 'Bu kişisel panelin. Görevlerini yönetebilir, dokümanlarına erişebilir ve ekibinle işbirliği yapabilirsin.'}
                  </motion.p>
                </div>
              </div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-end gap-3"
              >
                  <p className="text-4xl sm:text-5xl font-bold">
                    {currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-white/70">
                    {currentTime.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatWidget
              title="Görevlerim"
              value={`${dashboardData.stats.tasksCompleted}/${dashboardData.stats.tasksTotal}`}
              subtitle={`${dashboardData.stats.tasksTotal > 0 ? Math.round((dashboardData.stats.tasksCompleted / dashboardData.stats.tasksTotal) * 100) : 0}% tamamlandı`}
              icon={CheckCircle}
              color="from-emerald-500 to-teal-500"
              trend="up"
              trendValue="+12%"
              onClick={() => onTabChange && onTabChange('tasks')}
            />
            <StatWidget
              title="Toplantılar"
              value={dashboardData.stats.meetingsToday}
              subtitle="Bugün planlı"
              icon={Calendar}
              color="from-blue-500 to-cyan-500"
              onClick={() => onTabChange && onTabChange('meetings')}
            />
            <StatWidget
              title="Mesajlar"
              value={dashboardData.stats.unreadMessages}
              subtitle="Okunmamış"
              icon={MessageSquare}
              color="from-violet-500 to-purple-500"
              onClick={() => onTabChange && onTabChange('messages')}
            />
            <StatWidget
              title="Notlar"
              subtitle="Son notlar"
              icon={FileText}
              color="from-orange-500 to-amber-500"
              onClick={() => onTabChange && onTabChange('notes')}
            />
            <StatWidget
              title="Onay Bekleyen"
              value={dashboardData.stats.pendingApprovals}
              subtitle="Acil işlem"
              icon={AlertCircle}
              color="from-amber-500 to-orange-500"
              onClick={() => onTabChange && onTabChange('tasks')}
            />
            <StatWidget
              title="Haftalık İlerleme"
              value={`${dashboardData.stats.weeklyProgress}%`}
              subtitle="Hedef: 100%"
              icon={TrendingUp}
              color="from-rose-500 to-pink-500"
              trend="up"
              trendValue="+8%"
              onClick={() => onTabChange && onTabChange('analytics')}
            />
            <StatWidget
              title="Odak Süresi"
              value={`${dashboardData.productivity.focus}h`}
              subtitle="Ortalama günlük"
              icon={Zap}
              color="from-indigo-500 to-blue-500"
              onClick={() => onTabChange && onTabChange('analytics')}
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Activity & Tasks */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Activity */}
              <motion.div variants={itemVariants} className={CONTAINER_STYLES.card + ' rounded-2xl overflow-hidden'}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Activity className="w-5 h-5 text-blue-500" />
                      Son Aktiviteler
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-slate-500">
                      Tümünü Gör
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {dashboardData.recentActivity.length > 0 ? dashboardData.recentActivity.map((activity) => (
                      <ActivityItem
                        key={activity.id}
                        activity={activity}
                        onClick={() => handleActivityClick(activity)}
                      />
                    )) : (
                      <div className="text-center py-8 text-slate-400">
                        <p>Henüz aktivite yok</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </motion.div>

              {/* Productivity Chart */}
              <motion.div variants={itemVariants} className={CONTAINER_STYLES.card + ' rounded-2xl p-6'}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-violet-500" />
                    Haftalık Verimlilik
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      +18%
                    </Badge>
                  </div>
                </div>
                <MiniChart data={dashboardData.productivity.week} onClick={() => onTabChange && onTabChange('analytics')} />
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <span>Pzt</span>
                  <span>Sal</span>
                  <span>Çar</span>
                  <span>Per</span>
                  <span>Cum</span>
                  <span>Cmt</span>
                  <span>Paz</span>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Team & Upcoming */}
            <div className="space-y-6">
              {/* Upcoming */}
              <motion.div variants={itemVariants} className={CONTAINER_STYLES.card + ' rounded-2xl overflow-hidden'}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5 text-amber-500" />
                    Yaklaşan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData.upcoming.length > 0 ? dashboardData.upcoming.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          item.priority === 'high' ? 'bg-rose-100 text-rose-600' :
                          item.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                          'bg-emerald-100 text-emerald-600'
                        }`}>
                          {item.type === 'meeting' ? <Users className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
                          <p className="text-xs text-slate-500">{item.time}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {item.time}
                        </Badge>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-slate-400">
                        <p>Yaklaşan görev yok</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </motion.div>

              {/* Activity Summary */}
              <motion.div variants={itemVariants} className={CONTAINER_STYLES.card + ' rounded-2xl p-6'}>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Aktivite Özeti
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                    <p className="text-sm text-slate-500 mb-1">Tamamlanan Görev</p>
                    <p className="text-2xl font-bold text-emerald-600">{dashboardData.stats.tasksCompleted}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                    <p className="text-sm text-slate-500 mb-1">Devam Eden</p>
                    <p className="text-2xl font-bold text-amber-600">{dashboardData.stats.pendingApprovals}</p>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div variants={itemVariants} className={CONTAINER_STYLES.card + ' rounded-2xl p-6'}>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Hızlı İşlemler
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-auto py-3 flex-col items-center gap-2"
                    onClick={() => onTabChange && onTabChange('tasks')}
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-xs">Yeni Görev</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-3 flex-col items-center gap-2"
                    onClick={() => onTabChange && onTabChange('meetings')}
                  >
                    <Calendar className="w-5 h-5" />
                    <span className="text-xs">Toplantı</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-3 flex-col items-center gap-2"
                    onClick={() => onTabChange && onTabChange('documents')}
                  >
                    <FileText className="w-5 h-5" />
                    <span className="text-xs">Doküman</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-3 flex-col items-center gap-2"
                    onClick={() => onTabChange && onTabChange('messages')}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-xs">Mesaj</span>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
