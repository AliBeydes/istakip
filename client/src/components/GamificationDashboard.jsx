'use client';

import { useEffect, useState } from 'react';
import { api } from '@/stores/authStore';
import { useSimpleTranslation } from '@/hooks/useSimpleTranslation';
import { 
  Trophy, 
  Medal, 
  Star,
  Target,
  Zap,
  Calendar,
  CheckCircle,
  Users,
  TrendingUp
} from 'lucide-react';

export default function GamificationDashboard() {
  const { t } = useSimpleTranslation();
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
    fetchStats();
  }, []);

  const fetchBadges = async () => {
    try {
      console.log('Fetching badges...');
      const response = await api.get('/analytics/badges?workspaceId=1');
      console.log('Badges response:', response.data);
      setBadges(response.data || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
      setBadges([]);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('Fetching gamification stats...');
      const response = await api.get('/analytics/metrics/workspace/1');
      console.log('Gamification stats response:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching gamification stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const defaultBadges = [
    { id: 1, name: 'İlk Görev', description: 'İlk görevini tamamla', icon: CheckCircle, color: 'bg-green-500', earned: true },
    { id: 2, name: 'Verimli Çalışan', description: '10 görev tamamla', icon: Zap, color: 'bg-yellow-500', earned: false, progress: 60 },
    { id: 3, name: 'Takım Oyuncusu', description: '5 grup görevine katıl', icon: Users, color: 'bg-blue-500', earned: false, progress: 40 },
    { id: 4, name: 'Hedef Odaklı', description: '30 gün üst üste görev tamamla', icon: Target, color: 'bg-red-500', earned: false, progress: 20 },
    { id: 5, name: 'Yıldız Performans', description: '50 görev tamamla', icon: Star, color: 'bg-purple-500', earned: false, progress: 10 },
  ];

  const displayBadges = badges.length > 0 ? badges : defaultBadges;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 text-orange-600"></div>
      </div>
    );
  }

  const earnedCount = displayBadges.filter(b => b.earned).length;
  const totalCount = displayBadges.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-orange-500" />
          Rozetler ve Başarımlar
        </h2>
        <p className="text-gray-600 mt-1">
          Görevlerini tamamlayarak rozetler kazan
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Toplam Rozet</p>
              <p className="text-3xl font-bold">{earnedCount}/{totalCount}</p>
            </div>
            <Trophy className="w-10 h-10 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Tamamlanan Görev</p>
              <p className="text-3xl font-bold">{stats?.completedTasks || 0}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Aktif Seri</p>
              <p className="text-3xl font-bold">{stats?.currentStreak || 0} gün</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-200" />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rozetler</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {displayBadges.map((badge) => {
            const IconComponent = badge.icon || Medal;
            return (
              <div
                key={badge.id}
                className={`rounded-xl p-6 text-center transition-all ${
                  badge.earned 
                    ? 'bg-white border-2 border-orange-200 shadow-md' 
                    : 'bg-gray-50 border border-gray-200 opacity-70'
                }`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  badge.earned ? badge.color || 'bg-orange-500' : 'bg-gray-300'
                }`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">
                  {badge.name}
                </h4>
                <p className="text-xs text-gray-500 mb-2">
                  {badge.description}
                </p>
                {badge.earned ? (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                    <Trophy className="w-3 h-3" />
                    Kazanıldı
                  </span>
                ) : (
                  <div className="space-y-1">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-orange-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${badge.progress || 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">%{badge.progress || 0}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard Preview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Medal className="w-5 h-5 text-yellow-500" />
          Liderlik Tablosu
        </h3>
        <div className="space-y-3">
          {[
            { rank: 1, name: 'Sen', points: stats?.totalPoints || 150, avatar: 'AU' },
            { rank: 2, name: 'Ekip Üyesi 1', points: 120, avatar: 'E1' },
            { rank: 3, name: 'Ekip Üyesi 2', points: 95, avatar: 'E2' },
          ].map((user) => (
            <div
              key={user.rank}
              className={`flex items-center gap-4 p-3 rounded-lg ${
                user.rank === 1 ? 'bg-orange-50 border border-orange-100' : 'bg-gray-50'
              }`}
            >
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                user.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                user.rank === 2 ? 'bg-gray-300 text-gray-700' :
                'bg-orange-200 text-orange-800'
              }`}>
                #{user.rank}
              </span>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user.avatar}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{user.name}</p>
              </div>
              <span className="font-bold text-orange-600">{user.points} puan</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
