'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { meetingService } from '@/services/meetingService';
import { useSimpleTranslation } from '@/hooks/useSimpleTranslation';
import MeetingRoom from './MeetingRoom';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  Users,
  Video,
  Plus,
  Search,
  Trash2,
  Mail,
} from 'lucide-react';

export default function MeetingDashboard({ workspaceId = '1' }) {
  const { t } = useSimpleTranslation();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState(null);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      console.log('📥 Loading meetings for workspace:', workspaceId);
      const response = await meetingService.getMeetings(workspaceId);
      console.log('📊 API Response:', response);
      
      // API returns { meetings: [...] } or [...]
      const meetingsData = Array.isArray(response) ? response : (response.meetings || []);
      console.log('📊 Meetings received:', meetingsData.length, 'items');
      console.log('📊 Meetings data:', meetingsData);
      
      setMeetings(meetingsData.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)));
    } catch (err) {
      console.error('❌ Error loading meetings:', err);
      toast.error('Toplantılar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, [workspaceId]);

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    console.log('📝 Creating meeting with data:', {
      title: formData.get('title'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
      workspaceId,
    });
    
    try {
      const result = await meetingService.createMeeting({
        title: formData.get('title'),
        description: formData.get('description'),
        startTime: new Date(formData.get('startTime')).toISOString(),
        endTime: new Date(formData.get('endTime')).toISOString(),
        workspaceId,
      });
      console.log('✅ Meeting created:', result);
      toast.success('Toplantı oluşturuldu');
      setShowCreateModal(false);
      loadMeetings();
    } catch (err) {
      console.error('❌ Error creating meeting:', err);
      console.error('Error response:', err.response?.data);
      toast.error('Toplantı oluşturulamadı: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return;
    try {
      await meetingService.deleteMeeting(meetingId);
      toast.success('Toplantı silindi');
      loadMeetings();
    } catch (err) {
      toast.error('Silinemedi');
    }
  };

  const handleJoinMeeting = (meeting) => {
    setActiveMeeting(meeting);
  };

  const handleCloseMeeting = () => {
    setActiveMeeting(null);
    loadMeetings();
  };

  const handleInviteByEmail = async (meetingId, email) => {
    console.log('📧 Sending invite to:', email, 'for meeting:', meetingId);
    
    if (!email || !email.includes('@')) {
      toast.error('Geçerli bir email girin');
      return;
    }

    try {
      const authStorage = localStorage.getItem('auth-storage');
      console.log('📧 Auth storage:', authStorage ? 'exists' : 'missing');
      
      const parsed = JSON.parse(authStorage);
      const token = parsed.state?.user?.token;
      console.log('📧 Token:', token ? 'exists' : 'missing');
      
      const url = `http://localhost:3020/api/meetings/${meetingId}/invite-external`;
      console.log('📧 API URL:', url);
      
      const response = await axios.post(
        url,
        { email },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log('📧 Response:', response.data);
      toast.success('Davet gönderildi!');
      return true;
    } catch (err) {
      console.error('❌ Error sending invite:', err);
      console.error('❌ Error response:', err.response?.data);
      toast.error('Davet gönderilemedi: ' + (err.response?.data?.error || err.message));
      return false;
    }
  };

  const filteredMeetings = meetings.filter((meeting) =>
    meeting.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  console.log('🎯 meetings state:', meetings.length, 'items');
  console.log('🎯 filteredMeetings:', filteredMeetings.length, 'items');
  console.log('🔍 searchQuery:', searchQuery);

  const isLive = (meeting) => {
    const now = new Date();
    const start = new Date(meeting.startTime);
    const end = new Date(meeting.endTime);
    return now >= start && now <= end;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (activeMeeting) {
    return <MeetingRoom meeting={activeMeeting} onClose={handleCloseMeeting} />;
  }

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <div className="flex items-center justify-between p-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white">Toplantılar</h1>
          <p className="text-slate-400 mt-1">Videolu toplantılar</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
        >
          <Plus className="w-5 h-5" />
          Yeni Toplantı
        </button>
      </div>

      <div className="p-4 border-b border-slate-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Calendar className="w-16 h-16 mb-4 opacity-50" />
            <p>Toplantı bulunamadı</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="group bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{meeting.title}</h3>
                      {isLive(meeting) && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                          CANLI
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mb-4">{meeting.description}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(meeting.startTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {meeting.participants?.length || 0} katılımcı
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleJoinMeeting(meeting)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl"
                    >
                      <Video className="w-4 h-4" />
                      {isLive(meeting) ? 'Katıl' : 'Başlat'}
                    </button>
                    <button
                      onClick={() => {
                        const email = prompt('Davet edilecek email adresi:');
                        if (email) handleInviteByEmail(meeting.id, email);
                      }}
                      className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg"
                      title="Email ile davet et"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMeeting(meeting.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-white mb-4">Yeni Toplantı</h2>
            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Başlık</label>
                <input
                  name="title"
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Açıklama</label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Başlangıç</label>
                  <input
                    name="startTime"
                    type="datetime-local"
                    required
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Bitiş</label>
                  <input
                    name="endTime"
                    type="datetime-local"
                    required
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                >
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
