'use client';

import React, { useEffect, useState } from 'react';
import { meetingService } from '@/services/meetingService';
import { useSimpleTranslation } from '@/hooks/useSimpleTranslation';
import { MeetingRoom } from './MeetingRoom';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  Users,
  Video,
  Plus,
  Search,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
} from 'lucide-react';

export function MeetingHub({ workspaceId = '1' }) {
  const { t } = useSimpleTranslation();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch meetings
  useEffect(() => {
    loadMeetings();
  }, [workspaceId]);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const data = await meetingService.getMeetings(workspaceId);
      setMeetings(data.meetings || []);
    } catch (err) {
      console.error('Error loading meetings:', err);
      toast.error('Toplantılar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Filter meetings
  const filteredMeetings = meetings.filter((meeting) =>
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create meeting
  const handleCreateMeeting = async (meetingData) => {
    try {
      await meetingService.createMeeting({
        ...meetingData,
        workspaceId,
      });
      toast.success('Toplantı oluşturuldu');
      setShowCreateModal(false);
      loadMeetings();
    } catch (err) {
      console.error('Error creating meeting:', err);
      toast.error('Toplantı oluşturulamadı');
    }
  };

  // Delete meeting
  const handleDeleteMeeting = async (meetingId) => {
    if (!confirm('Bu toplantıyı silmek istediğinize emin misiniz?')) return;

    try {
      await meetingService.deleteMeeting(meetingId);
      toast.success('Toplantı silindi');
      loadMeetings();
    } catch (err) {
      console.error('Error deleting meeting:', err);
      toast.error('Toplantı silinemedi');
    }
  };

  // Join meeting
  const handleJoinMeeting = (meeting) => {
    setActiveMeeting(meeting);
  };

  // Close meeting room
  const handleCloseMeeting = () => {
    setActiveMeeting(null);
    loadMeetings(); // Refresh participant counts
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Check if meeting is today
  const isToday = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if meeting is live
  const isLive = (meeting) => {
    const now = new Date();
    const start = new Date(meeting.startTime);
    const end = new Date(meeting.endTime);
    return now >= start && now <= end;
  };

  // Active meeting room
  if (activeMeeting) {
    return (
      <MeetingRoom
        meeting={activeMeeting}
        onClose={handleCloseMeeting}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white">Toplantılar</h1>
          <p className="text-slate-400 mt-1">
            {filteredMeetings.length} toplantı
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Toplantı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-64"
            />
          </div>
          {/* Create Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-medium transition-all"
          >
            <Plus className="w-5 h-5" />
            Yeni Toplantı
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-white">
            {new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(currentDate)}
          </h2>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={() => setCurrentDate(new Date())}
          className="px-3 py-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          Bugüne Dön
        </button>
      </div>

      {/* Meetings List */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Calendar className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">Toplantı bulunamadı</p>
            <p className="text-sm mt-2">Yeni bir toplantı oluşturun</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="group bg-slate-900/50 hover:bg-slate-800/50 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {meeting.title}
                      </h3>
                      {isLive(meeting) && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-medium rounded-full animate-pulse">
                          ● CANLI
                        </span>
                      )}
                      {isToday(meeting.startTime) && !isLive(meeting) && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                          Bugün
                        </span>
                      )}
                    </div>
                    
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                      {meeting.description || 'Açıklama yok'}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(meeting.startTime)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {Math.round((new Date(meeting.endTime) - new Date(meeting.startTime)) / 60000)} dk
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {meeting.participants?.length || 0} katılımcı
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleJoinMeeting(meeting)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg font-medium transition-all"
                    >
                      <Video className="w-4 h-4" />
                      {isLive(meeting) ? 'Katıl' : 'Başlat'}
                    </button>
                    <button
                      onClick={() => handleDeleteMeeting(meeting.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
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

      {/* Create Modal */}
      {showCreateModal && (
        <CreateMeetingModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateMeeting}
        />
      )}
    </div>
  );
}

// Create Meeting Modal
function CreateMeetingModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    type: 'VIDEO',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.startTime || !formData.endTime) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    setLoading(true);
    await onCreate(formData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6">Yeni Toplantı</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Toplantı Başlığı
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Örn: Haftalık Sync"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Açıklama
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 h-20 resize-none"
              placeholder="Toplantı açıklaması..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Başlangıç
              </label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Bitiş
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 rounded-lg transition-all"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {loading ? 'Oluşturuluyor...' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
