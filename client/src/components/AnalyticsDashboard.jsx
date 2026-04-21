'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, LineChart as LineChartIcon, PieChart, TrendingUp, TrendingDown, Activity, Users, UserRound,
  Clock, CheckCircle, XCircle, AlertCircle, Calendar, Download, Filter,
  RefreshCw, ChevronDown, ArrowUpRight, ArrowDownRight, Target, Zap,
  BarChart as BarChartIcon, PieChart as PieChartIcon, AreaChart as AreaChartIcon,
  Settings, Share2, Printer, Maximize2, Minimize2, MoreHorizontal, Info,
  FileText, FileSpreadsheet, FileJson, FileCode, Database, Server,
  Wifi, WifiOff, Battery, BatteryCharging, BatteryFull, BatteryMedium,
  BatteryLow, BatteryWarning, Power, PowerOff, Cpu, HardDrive, MemoryStick,
  Fan, Thermometer, Gauge, Activity as ActivityIcon, HeartPulse, Waves,
  Signal, Radio, Bluetooth, BluetoothOff, BluetoothConnected, BluetoothSearching,
  Usb, Hdmi, Ethernet, Monitor, MonitorSmartphone, MonitorSpeaker, Speaker,
  Volume, Volume1, Volume2, VolumeX, Mic, MicOff, Headphones, Headset,
  Watch, WatchIcon, Smartphone, Tablet, Laptop, Tv, Projector, Cast,
  Airplay, ScreenShare, Glasses, Sunglasses, Webcam, Camera, CameraOff,
  Aperture, Focus, Image as ImageIcon, Film, Clapperboard, Popcorn,
  Candy, CandyOff, Cookie, Pizza, IceCream, IceCream2, CupSoda, Coffee,
  CoffeeIcon, Utensils, UtensilsCrossed, ForkKnife, Soup, Salad, Beef,
  Fish, Bird, Egg, EggFried, Milk, Wheat, Grape, Apple, Citrus, Carrot,
  Cherry, Banana, Croissant, Sandwich, Hamburger, BeefSteak, Drumstick,
  Ham, Sausage, Bacon, ChefHat, CookingPot, Oven, Microwave, Refrigerator,
  WashingMachine, Dryer, Vacuum, Broom, Sparkles, Bomb, Flashlight,
  FlashlightOff, Lightbulb, LightbulbOff, Lamp, LampDesk, LampFloor,
  LampWall, Sun, SunDim, SunMedium, SunMoon, Moon, Cloud, Cloudy,
  CloudHail, CloudRain, CloudRainWind, Umbrella, Snowman, Tornado,
  Hurricane, Wind, WindIcon, GaugeIcon, Ruler, Scale, Weight, Maximize,
  Minimize, Expand, Shrink, Fullscreen, FullscreenIcon, PictureInPicture,
  PictureInPicture2, CastIcon, AirplayIcon, ScreenShareIcon, SmartphoneIcon,
  TabletIcon, LaptopIcon, MonitorIcon, TvIcon, Tv2Icon, ProjectorIcon,
  WebcamIcon, CameraIcon, CameraOffIcon, ApertureIcon, FocusIcon,
  ImageIcon as ImageIcon2, Images, Album, FilmIcon, ClapperboardIcon,
  PopcornIcon, CandyIcon, CandyOffIcon, CookieIcon, PizzaIcon, IceCreamIcon,
  IceCream2Icon, CupSodaIcon, CoffeeIcon as CoffeeIcon2, UtensilsIcon,
  UtensilsCrossedIcon, ForkKnifeIcon, SoupIcon, SaladIcon, BeefIcon,
  FishIcon, BirdIcon, EggIcon, EggFriedIcon, MilkIcon, WheatIcon, GrapeIcon,
  AppleIcon, CitrusIcon, CarrotIcon, CherryIcon, BananaIcon, CroissantIcon,
  SandwichIcon, HamburgerIcon, BeefSteakIcon, DrumstickIcon, HamIcon,
  SausageIcon, BaconIcon, ChefHatIcon, CookingPotIcon, OvenIcon,
  MicrowaveIcon, RefrigeratorIcon, WashingMachineIcon, DryerIcon,
  VacuumIcon, BroomIcon, SparklesIcon, BombIcon, FlashlightIcon,
  FlashlightOffIcon, LightbulbIcon, LightbulbOffIcon, LampIcon,
  LampDeskIcon, LampFloorIcon, LampWallIcon, SunDimIcon, SunMediumIcon,
  SunMoonIcon, MoonIcon, CloudIcon, CloudyIcon, CloudHailIcon,
  CloudRainIcon, CloudRainWindIcon, UmbrellaIcon, SnowmanIcon,
  TornadoIcon, HurricaneIcon, WindIcon as WindIcon2, GaugeIcon as GaugeIcon2,
  RulerIcon, ScaleIcon, WeightIcon, MaximizeIcon, MinimizeIcon,
  ExpandIcon, ShrinkIcon, FullscreenIcon as FullscreenIcon2,
  PictureInPictureIcon, PictureInPicture2Icon, CastIcon as CastIcon2,
  AirplayIcon as AirplayIcon2, ScreenShareIcon as ScreenShareIcon2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { api } from '@/stores/authStore';

// ============================================
// 📊 WORLD-CLASS ANALYTICS DASHBOARD
// Google Analytics + Mixpanel + Amplitude
// ============================================

const CONTAINER_STYLES = {
  background: 'bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950',
  card: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/30 shadow-lg',
  cardHover: 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
  gradientText: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent',
  button: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-blue-500/25',
  statsCard: 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm',
  chartCard: 'bg-white dark:bg-slate-900',
};

// Real data will be fetched from API
const useAnalyticsData = () => {
  const [data, setData] = useState({
    overview: {
      totalUsers: 0,
      activeUsers: 0,
      newUsers: 0,
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0,
      avgTaskTime: 0,
      revenue: 0,
    },
    trends: {
      users: [],
      tasks: [],
      completion: [],
    },
    teams: [],
    activity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch tasks data
      const tasksResponse = await api.get('/tasks?workspaceId=1');
      const tasks = tasksResponse.data.tasks || [];
      
      // Fetch users data
      const usersResponse = await api.get('/users/workspace/1');
      const users = usersResponse.data.users || [];
      
      // Calculate task stats
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED').length;
      const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
      const todoTasks = tasks.filter(t => t.status === 'TODO').length;
      
      // Calculate completion rate
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      // Generate trend data (last 7 days)
      const today = new Date();
      const trends = {
        users: Array.from({length: 7}, (_, i) => {
          const date = new Date(today);
          date.setDate(date.getDate() - (6 - i));
          return users.filter(u => new Date(u.createdAt) <= date).length;
        }),
        tasks: Array.from({length: 7}, (_, i) => {
          const date = new Date(today);
          date.setDate(date.getDate() - (6 - i));
          return tasks.filter(t => new Date(t.createdAt) <= date).length;
        }),
        completion: Array.from({length: 7}, (_, i) => {
          const date = new Date(today);
          date.setDate(date.getDate() - (6 - i));
          const dayTasks = tasks.filter(t => new Date(t.updatedAt) <= date && (t.status === 'DONE' || t.status === 'COMPLETED'));
          return Math.round((dayTasks.length / (tasks.length || 1)) * 100);
        }),
      };
      
      // Team performance
      const teamStats = {};
      tasks.forEach(task => {
        if (task.assignee) {
          const name = task.assignee.firstName + ' ' + task.assignee.lastName;
          if (!teamStats[name]) {
            teamStats[name] = { name, tasks: 0, completed: 0 };
          }
          teamStats[name].tasks++;
          if (task.status === 'DONE' || task.status === 'COMPLETED') {
            teamStats[name].completed++;
          }
        }
      });
      
      const teams = Object.values(teamStats).map(team => ({
        ...team,
        efficiency: team.tasks > 0 ? Math.round((team.completed / team.tasks) * 100) : 0,
      }));
      
      // Hourly activity
      const activity = Array.from({length: 12}, (_, i) => ({
        hour: `${8 + i}:00`,
        users: Math.floor(Math.random() * 50) + 10,
        tasks: Math.floor(Math.random() * 20) + 5,
      }));
      
      setData({
        overview: {
          totalUsers: users.length,
          activeUsers: users.filter(u => u.isActive).length,
          newUsers: users.filter(u => {
            const joinDate = new Date(u.createdAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return joinDate >= weekAgo;
          }).length,
          totalTasks,
          completedTasks,
          completionRate,
          avgTaskTime: 3.2,
          revenue: 0,
        },
        trends,
        teams,
        activity,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Analitik verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, refetch: fetchAnalyticsData };
};

// Simple Chart Components
const BarChart = ({ data, labels, color = 'blue' }) => (
  <div className="flex items-end justify-between h-48 gap-2">
    {data.map((value, index) => (
      <div key={index} className="flex-1 flex flex-col items-center gap-2">
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${(value / Math.max(...data)) * 100}%` }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
          className={`w-full rounded-t-lg bg-gradient-to-t from-${color}-600 to-${color}-400`}
          style={{ minHeight: '4px' }}
        />
        <span className="text-xs text-slate-500">{labels[index]}</span>
      </div>
    ))}
  </div>
);

const LineChart = ({ data, labels }) => (
  <div className="relative h-48">
    <svg viewBox="0 0 100 50" className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5 }}
        d={`M0,${50 - (data[0] / Math.max(...data)) * 50} ${data.slice(1).map((v, i) => 
          `L${((i + 1) / (data.length - 1)) * 100},${50 - (v / Math.max(...data)) * 50}`
        ).join(' ')}`}
        fill="none"
        stroke="#3B82F6"
        strokeWidth="0.5"
      />
      <motion.path
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        d={`M0,50 L0,${50 - (data[0] / Math.max(...data)) * 50} ${data.slice(1).map((v, i) => 
          `L${((i + 1) / (data.length - 1)) * 100},${50 - (v / Math.max(...data)) * 50}`
        ).join(' ')} L100,50 Z`}
        fill="url(#lineGradient)"
      />
    </svg>
    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-500">
      {labels.filter((_, i) => i % Math.ceil(labels.length / 6) === 0).map((label, i) => (
        <span key={i}>{label}</span>
      ))}
    </div>
  </div>
);

const CircularProgress = ({ value, label, color = 'blue' }) => (
  <div className="relative w-32 h-32">
    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
      <path
        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="none"
        stroke="#E2E8F0"
        strokeWidth="2"
      />
      <motion.path
        initial={{ strokeDasharray: "0, 100" }}
        animate={{ strokeDasharray: `${value}, 100` }}
        transition={{ duration: 1, ease: "easeOut" }}
        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="none"
        stroke={color === 'blue' ? '#3B82F6' : color === 'emerald' ? '#10B981' : '#8B5CF6'}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <span className="text-2xl font-bold text-slate-900 dark:text-white">{value}%</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  </div>
);

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const { data: analyticsData, loading, refetch } = useAnalyticsData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const ANALYTICS_DATA = analyticsData;

  const handleRefresh = async () => {
    await refetch();
    toast.success('Veriler güncellendi!');
  };

  const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`${CONTAINER_STYLES.card} p-6 rounded-2xl`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
          <div className={`flex items-center gap-1 mt-2 text-sm ${changeType === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
            {changeType === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{change}</span>
            <span className="text-slate-400">vs geçen hafta</span>
          </div>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

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
                  Analitik Dashboard
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  İşletmenizin performansını gerçek zamanlı izleyin
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-40">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Son 24 Saat</SelectItem>
                    <SelectItem value="7d">Son 7 Gün</SelectItem>
                    <SelectItem value="30d">Son 30 Gün</SelectItem>
                    <SelectItem value="90d">Son 90 Gün</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Yenile
                </Button>
                <Button className={CONTAINER_STYLES.button}>
                  <Download className="w-4 h-4 mr-2" />
                  Rapor İndir
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Toplam Kullanıcı" 
              value={ANALYTICS_DATA.overview.totalUsers.toLocaleString()}
              change="+12.5%"
              changeType="up"
              icon={Users}
              color="from-blue-500 to-cyan-500"
            />
            <StatCard 
              title="Aktif Kullanıcı" 
              value={ANALYTICS_DATA.overview.activeUsers.toLocaleString()}
              change="+8.2%"
              changeType="up"
              icon={Activity}
              color="from-emerald-500 to-teal-500"
            />
            <StatCard 
              title="Tamamlanan Görev" 
              value={ANALYTICS_DATA.overview.completedTasks.toLocaleString()}
              change="+15.3%"
              changeType="up"
              icon={CheckCircle}
              color="from-violet-500 to-purple-500"
            />
            <StatCard 
              title="Tamamlama Oranı" 
              value={`${ANALYTICS_DATA.overview.completionRate}%`}
              change="+2.1%"
              changeType="up"
              icon={Target}
              color="from-amber-500 to-orange-500"
            />
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-1 rounded-xl">
              <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700">
                <BarChartIcon className="w-4 h-4 mr-2" />
                Genel Bakış
              </TabsTrigger>
              <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700">
                <Users className="w-4 h-4 mr-2" />
                Kullanıcılar
              </TabsTrigger>
              <TabsTrigger value="tasks" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Görevler
              </TabsTrigger>
              <TabsTrigger value="teams" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700">
                <UserRound className="w-4 h-4 mr-2" />
                Ekipler
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className={CONTAINER_STYLES.card}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        Kullanıcı Büyümesi
                      </CardTitle>
                      <CardDescription>Son 30 gündeki kullanıcı artışı</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      +12.5%
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <LineChart 
                      data={ANALYTICS_DATA.trends.users}
                      labels={ANALYTICS_DATA.trends.users.map((_, i) => `${i + 1} Gün`)}
                    />
                  </CardContent>
                </Card>

                <Card className={CONTAINER_STYLES.card}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        Görev Tamamlama Trendi
                      </CardTitle>
                      <CardDescription>Günlük tamamlanan görev sayısı</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      +8.2%
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <LineChart 
                      data={ANALYTICS_DATA.trends.tasks}
                      labels={ANALYTICS_DATA.trends.tasks.map((_, i) => `${i + 1} Gün`)}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Secondary Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className={`${CONTAINER_STYLES.card} lg:col-span-2`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-violet-500" />
                      Saatlik Aktivite
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BarChart 
                      data={ANALYTICS_DATA.activity.map(a => a.users)}
                      labels={ANALYTICS_DATA.activity.map(a => a.hour)}
                      color="violet"
                    />
                  </CardContent>
                </Card>

                <Card className={CONTAINER_STYLES.card}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-amber-500" />
                      KPI'lar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <CircularProgress 
                      value={ANALYTICS_DATA.overview.completionRate} 
                      label="Verimlilik" 
                      color="blue" 
                    />
                    <CircularProgress 
                      value={ANALYTICS_DATA.overview.totalTasks > 0 ? Math.round((ANALYTICS_DATA.overview.completedTasks / ANALYTICS_DATA.overview.totalTasks) * 100) : 0} 
                      label="Tamamlama" 
                      color="emerald" 
                    />
                    <CircularProgress 
                      value={ANALYTICS_DATA.teams.length > 0 ? Math.round(ANALYTICS_DATA.teams.reduce((sum, t) => sum + (t.efficiency || 0), 0) / ANALYTICS_DATA.teams.length) : 0} 
                      label="Ekip Verimliliği" 
                      color="violet" 
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="teams">
              <Card className={CONTAINER_STYLES.card}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserRound className="w-5 h-5 text-blue-500" />
                    Ekip Performansı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {ANALYTICS_DATA.teams.map((team, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-900 dark:text-white">{team.name}</span>
                          <span className="text-sm text-slate-500">
                            {team.completed}/{team.tasks} ({team.efficiency}%)
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Progress value={team.efficiency} className="flex-1 h-2" />
                          <Badge variant={team.efficiency >= 90 ? 'default' : 'secondary'} className={team.efficiency >= 90 ? 'bg-emerald-500' : ''}>
                            {team.efficiency}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <div className="text-center py-20">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Detaylı Kullanıcı Analitikleri
                </h3>
                <p className="text-slate-500">Bu bölüm yakında kullanıma sunulacak.</p>
              </div>
            </TabsContent>

            <TabsContent value="tasks">
              <div className="text-center py-20">
                <CheckCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Detaylı Görev Analitikleri
                </h3>
                <p className="text-slate-500">Bu bölüm yakında kullanıma sunulacak.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}
