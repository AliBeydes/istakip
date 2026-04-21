'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/stores/authStore';
import { toast } from 'sonner';
import {
  Building2,
  Users,
  UserPlus,
  Settings,
  Shield,
  Mail,
  Trash2,
  Edit2,
  Crown,
  CheckCircle,
  XCircle,
  ChevronDown,
  Search,
  Plus,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAutoRefresh } from '@/hooks/usePolling';

const ROLES = [
  { value: 'ADMIN', label: 'Firma Yöneticisi', color: 'bg-purple-100 text-purple-700', icon: Crown },
  { value: 'MANAGER', label: 'Takım Lideri', color: 'bg-blue-100 text-blue-700', icon: Shield },
  { value: 'USER', label: 'Çalışan', color: 'bg-green-100 text-green-700', icon: CheckCircle }
];

export default function WorkspaceManager() {
  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('USER');
  const [isInviting, setIsInviting] = useState(false);

  // Fetch workspace data
  const fetchWorkspaceData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      // Get current user's workspace
      const response = await api.get('/workspace/current');
      setWorkspace(response.data.workspace);
      setMembers(response.data.members || []);
    } catch (error) {
      console.error('Error fetching workspace:', error);
      toast.error('Firma bilgileri yüklenemedi');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Auto-refresh every 15 seconds
  useAutoRefresh(useCallback(() => {
    fetchWorkspaceData(false);
  }, []), 15000);

  useEffect(() => {
    fetchWorkspaceData(true);
  }, []);

  // Invite user
  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error('E-posta adresi girin');
      return;
    }

    setIsInviting(true);
    try {
      await api.post('/workspace/invite', {
        email: inviteEmail,
        role: inviteRole
      });
      
      toast.success(`${inviteEmail} davet edildi`);
      setInviteEmail('');
      setInviteDialogOpen(false);
      fetchWorkspaceData(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Davet gönderilemedi');
    } finally {
      setIsInviting(false);
    }
  };

  // Remove member
  const handleRemoveMember = async (memberId) => {
    if (!confirm('Bu kullanıcıyı firmadan çıkarmak istediğinize emin misiniz?')) return;
    
    try {
      await api.delete(`/workspace/members/${memberId}`);
      toast.success('Kullanıcı çıkarıldı');
      fetchWorkspaceData(false);
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  // Update member role
  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await api.put(`/workspace/members/${memberId}/role`, { role: newRole });
      toast.success('Rol güncellendi');
      fetchWorkspaceData(false);
    } catch (error) {
      toast.error('Rol güncellenemedi');
    }
  };

  // Filter members
  const filteredMembers = members.filter(member =>
    member.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Firma Yönetimi
            </h1>
            <p className="text-slate-600">
              {workspace?.name || 'Firmanız'} - Kullanıcıları davet edin ve yönetin
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setSettingsDialogOpen(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Ayarlar
            </Button>
            <Button onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Kullanıcı Davet Et
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold">{members.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Yöneticiler</p>
                <p className="text-2xl font-bold">
                  {members.filter(m => m.role === 'ADMIN').length}
                </p>
              </div>
              <Crown className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Takım Liderleri</p>
                <p className="text-2xl font-bold">
                  {members.filter(m => m.role === 'MANAGER').length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Aktif Plan</p>
                <p className="text-lg font-bold text-green-600">
                  {workspace?.plan === 'starter' ? 'Başlangıç' :
                   workspace?.plan === 'pro' ? 'Profesyonel' : 'Enterprise'}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Kullanıcılar</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Kullanıcı ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={`${member.firstName} ${member.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-semibold">
                      {member.firstName?.[0]}{member.lastName?.[0]}
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">
                        {member.firstName} {member.lastName}
                      </p>
                      {member.isOnline && (
                        <span className="w-2 h-2 rounded-full bg-green-500" title="Çevrimiçi" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{member.email}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {member.department} • {member.position}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge className={ROLES.find(r => r.value === member.role)?.color}>
                    {ROLES.find(r => r.value === member.role)?.icon && (
                      <span className="mr-1">
                        {React.createElement(ROLES.find(r => r.value === member.role).icon, { className: 'w-3 h-3 inline' })}
                      </span>
                    )}
                    {ROLES.find(r => r.value === member.role)?.label}
                  </Badge>
                  
                  <Select
                    value={member.role}
                    onValueChange={(value) => handleUpdateRole(member.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(role => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
            
            {filteredMembers.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Kullanıcı bulunamadı</p>
                <p className="text-sm mt-2">Yeni kullanıcı davet etmek için "Kullanıcı Davet Et" butonuna tıklayın</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Kullanıcı Davet Et</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">E-posta Adresi</label>
              <Input
                type="email"
                placeholder="ornek@firma.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Rol</label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <role.icon className="w-4 h-4" />
                        {role.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-2">
                {inviteRole === 'ADMIN' && 'Tüm firmayı yönetebilir, kullanıcı ekleyip çıkarabilir'}
                {inviteRole === 'MANAGER' && 'Takımını yönetebilir, görev atayabilir'}
                {inviteRole === 'USER' && 'Sadece kendisine atanan görevleri görebilir'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleInvite} disabled={isInviting}>
              {isInviting ? 'Davet Gönderiliyor...' : 'Davet Gönder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Firma Ayarları</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Firma Adı</label>
              <Input defaultValue={workspace?.name} />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Sektör</label>
              <Input defaultValue={workspace?.industry} placeholder="Örn: Yazılım, Üretim, Eğitim" />
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Güvenlik</h4>
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">İki Faktörlü Doğrulama</p>
                  <p className="text-xs text-slate-500">Tüm kullanıcılar için zorunlu</p>
                </div>
                <Button variant="outline" size="sm">Aktif Et</Button>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">IP Kısıtlaması</p>
                  <p className="text-xs text-slate-500">Sadece ofis IP&apos;lerinden erişim</p>
                </div>
                <Button variant="outline" size="sm">Yapılandır</Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
              Kapat
            </Button>
            <Button onClick={() => { toast.success('Ayarlar kaydedildi'); setSettingsDialogOpen(false); }}>
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
