'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, Star,
  Calendar, Clock, Globe, Link2, Edit2, Camera, CheckCircle, XCircle,
  Linkedin, Github, Twitter, Facebook, Instagram, Youtube, Globe2,
  Building2, MapPinned, Navigation, Compass, Target, Flag, Bookmark,
  Heart, Share2, MessageSquare, Bell, Settings, Shield, Lock, Eye,
  EyeOff, Upload, Download, FileText, Image as ImageIcon, Video,
  Activity, TrendingUp, BarChart2, PieChart, Users, UserPlus,
  UserCheck, UserX, UserRound, Trophy, Medal, Crown, Sparkles,
  Zap, Flame, Snowflake, Sun, Moon, Cloud, CloudRain, Wind,
  Thermometer, Droplets, Umbrella, Rainbow, Eclipse, Sunrise, Sunset,
  Mountain, Tent, TreePine, TreeDeciduous, Flower, Leaf, Sprout,
  Seedling, Recycle, Trash2, Archive, Inbox, Send, MailOpen, MailPlus,
  MailMinus, MailCheck, MailX, MailQuestion, MailWarning, MailSearch,
  AtSign, Hash, Asterisk, Type, Text, TextCursor, TextSelect,
  Quote, Blockquote, Code, Terminal, Command, Keyboard, Mouse,
  MousePointerClick, Touchpad, Gamepad, Gamepad2, Joystick, Plug,
  Unplug, Battery, BatteryCharging, BatteryFull, BatteryMedium,
  BatteryLow, BatteryWarning, Power, PowerOff, Radio, Wifi, WifiOff,
  Bluetooth, BluetoothOff, BluetoothConnected, BluetoothSearching,
  Usb, Hdmi, Ethernet, Monitor, MonitorSmartphone, MonitorSpeaker,
  Speaker, Volume, Volume1, Volume2, VolumeX, Mic, MicOff, Headphones,
  Headset, Glasses, Sunglasses, Watch, WatchIcon, Smartphone, Tablet,
  Laptop, Tv, Projector, Cast, Airplay, ScreenShare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { api, useAuthStore } from '@/stores/authStore';

// ============================================
// 👤 WORLD-CLASS USER PROFILE
// LinkedIn + Behance + Dribbble Birleşimi
// ============================================


const CONTAINER_STYLES = {
  background: 'bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950',
  card: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/30 shadow-lg',
  cardHover: 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
  gradientText: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent',
  button: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-blue-500/25',
  coverGradient: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600',
  statsCard: 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm',
};

const SKILLS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes',
  'GraphQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Kafka', 'Elasticsearch'
];

const ACHIEVEMENTS = [
  { icon: Trophy, name: 'Top Performer', description: 'Q4 2024 en yüksek performans', color: 'from-amber-500 to-orange-500' },
  { icon: Star, name: '5 Yıldızlı Üye', description: '100+ olumlu değerlendirme', color: 'from-yellow-500 to-amber-500' },
  { icon: Zap, name: 'Hızlı Tamamlayıcı', description: '30+ görev zamanında teslim', color: 'from-blue-500 to-cyan-500' },
  { icon: Heart, name: 'Takım Oyuncusu', description: 'En çok yardım eden üye', color: 'from-rose-500 to-pink-500' },
  { icon: Crown, name: 'Lider', description: '5+ başarılı proje liderliği', color: 'from-violet-500 to-purple-500' },
  { icon: Target, name: 'Hedef Uzmanı', description: '100% hedef tamamlama oranı', color: 'from-emerald-500 to-teal-500' },
];

export default function UserProfile() {
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    company: '',
    location: '',
    bio: ''
  });

  // Real user data from API
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      setEditForm({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        position: currentUser.position || '',
        department: currentUser.department || '',
        company: currentUser.company || '',
        location: currentUser.location || '',
        bio: currentUser.bio || ''
      });
    }
    setLoading(false);
  }, [currentUser]);

  const handleSave = async () => {
    toast.success('Profil güncellendi!');
    setEditing(false);
  };

  if (loading || !user) {
    return (
      <div className={`min-h-screen ${CONTAINER_STYLES.background} flex items-center justify-center`}>
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={`min-h-screen ${CONTAINER_STYLES.background} pb-20`}>
        {/* Cover Image */}
        <div className={`h-64 sm:h-80 ${CONTAINER_STYLES.coverGradient} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyem0tNiA2aC00djJoNHYtMnptMC02di00aC00djRoNHptLTYgNmgtNHYyaDR2LTJ6bTAtNnYtNGgtNHY0aDR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <button 
            className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            onClick={() => toast.info('Kapak fotoğrafı değiştirme yakında!')}
          >
            <Camera className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
          {/* Profile Header Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${CONTAINER_STYLES.card} rounded-2xl p-6 sm:p-8 mb-6`}
          >
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <div className="relative -mt-20 sm:-mt-28">
                <Avatar className="w-32 h-32 sm:w-40 sm:h-40 ring-8 ring-white dark:ring-slate-900 shadow-2xl">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-500 to-violet-500 text-white">
                    {user.firstName[0]}{user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <button 
                  onClick={() => setShowAvatarModal(true)}
                  className="absolute bottom-2 right-2 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Camera className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                      {user.firstName} {user.lastName}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">{user.position}</p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {user.company}
                      </span>
                      {user.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {user.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditForm({
                          firstName: user.firstName,
                          lastName: user.lastName,
                          email: user.email,
                          phone: user.phone,
                          position: user.position,
                          department: user.department,
                          company: user.company,
                          location: user.location,
                          bio: user.bio
                        });
                        setShowEditModal(true);
                      }}
                      className="h-11"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Profili Düzenle
                    </Button>
                    <Button 
                      className={`h-11 ${CONTAINER_STYLES.button}`}
                      onClick={() => setShowMessageModal(true)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Mesaj Gönder
                    </Button>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap gap-3 mt-4">
                  {user.social?.linkedin && (
                    <a href={`https://${user.social.linkedin}`} target="_blank" rel="noopener noreferrer" 
                       className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      <Linkedin className="w-4 h-4 text-blue-600" />
                      LinkedIn
                    </a>
                  )}
                  {user.social?.github && (
                    <a href={`https://${user.social.github}`} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                  )}
                  {user.social?.twitter && (
                    <a href={`https://${user.social.twitter}`} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      <Twitter className="w-4 h-4 text-sky-500" />
                      Twitter
                    </a>
                  )}
                  {user.social?.website && (
                    <a href={`https://${user.social.website}`} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      <Globe2 className="w-4 h-4 text-emerald-500" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
          >
            {[
              { label: 'Seviye', value: user.level, icon: Trophy, color: 'from-amber-500 to-orange-500', suffix: '' },
              { label: 'İtibar Puanı', value: user.reputation, icon: Star, color: 'from-yellow-500 to-amber-500', suffix: '' },
              { label: 'Tamamlanan', value: user.completedTasks, icon: CheckCircle, color: 'from-emerald-500 to-teal-500', suffix: '' },
              { label: 'Başarı Oranı', value: user.successRate, icon: TrendingUp, color: 'from-blue-500 to-cyan-500', suffix: '%' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className={`${CONTAINER_STYLES.card} ${CONTAINER_STYLES.statsCard} p-4 rounded-xl`}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}{stat.suffix}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Simplified Info Cards */}
              <div className="space-y-6">
                <Card className={CONTAINER_STYLES.card}>
                  <CardHeader className="flex flex-row items-center gap-3">
                    <Activity className="w-5 h-5 text-blue-500" />
                    <CardTitle>Aktivite Özeti</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{user.completedTasks}</p>
                        <p className="text-sm text-slate-500">Tamamlanan Görev</p>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{user.ongoingTasks}</p>
                        <p className="text-sm text-slate-500">Devam Eden</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column - 3 Cards Side by Side */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Achievements */}
                <Card className={CONTAINER_STYLES.card}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      Başarımlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {ACHIEVEMENTS.slice(0, 4).map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${achievement.color} flex items-center justify-center flex-shrink-0`}>
                          <achievement.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white text-xs truncate">
                            {achievement.name}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Level Progress */}
                <Card className={CONTAINER_STYLES.card}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Target className="w-5 h-5 text-emerald-500" />
                      Seviye İlerlemesi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Seviye {user.level}
                      </span>
                      <span className="text-xs text-slate-500">
                        {user.reputation % 500}/500 XP
                      </span>
                    </div>
                    <Progress value={(user.reputation % 500) / 5} className="h-2" />
                    <p className="text-xs text-slate-500">
                      Bir sonraki seviyeye {500 - (user.reputation % 500)} XP kaldı
                    </p>
                  </CardContent>
                </Card>

                {/* Contact Info */}
                <Card className={CONTAINER_STYLES.card}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Mail className="w-5 h-5 text-blue-500" />
                      İletişim
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400 text-xs truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400 text-xs">{user.phone}</span>
                    </div>
                    {user.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-600 dark:text-slate-400 text-xs">{user.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400 text-xs">
                        {user.joinDate ? new Date(user.joinDate).toLocaleDateString('tr-TR') : (user.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : 'Belirtilmemiş')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

                          </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Profili Düzenle</DialogTitle>
            <DialogDescription>
              Profil bilgilerinizi güncelleyin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Ad</Label>
                <Input 
                  id="firstName" 
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Soyad</Label>
                <Input 
                  id="lastName" 
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input 
                id="email" 
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input 
                id="phone" 
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Pozisyon</Label>
              <Input 
                id="position" 
                value={editForm.position}
                onChange={(e) => setEditForm({...editForm, position: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>İptal</Button>
            <Button 
              onClick={() => {
                setUser({...user, ...editForm});
                toast.success('Profil güncellendi');
                setShowEditModal(false);
              }}
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Mesaj Gönder</DialogTitle>
            <DialogDescription>
              {user.firstName} {user.lastName} adlı kullanıcıya mesaj gönderin
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              placeholder="Mesajınızı yazın..."
              rows={5}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageModal(false)}>İptal</Button>
            <Button 
              onClick={() => {
                toast.success('Mesaj gönderildi');
                setMessageContent('');
                setShowMessageModal(false);
              }}
            >
              <Send className="w-4 h-4 mr-2" />
              Gönder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </TooltipProvider>
  );
};
