'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MeetingRoom from '@/components/MeetingRoom';
import { toast } from 'sonner';
import { User, Mail, Video } from 'lucide-react';

export default function MeetingPage({ params }) {
  const router = useRouter();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '' });
  const [joinedAsGuest, setJoinedAsGuest] = useState(false);

  useEffect(() => {
    const loadMeeting = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const invite = urlParams.get('invite');
        
        if (invite === 'true') {
          setIsGuest(true);
        }

        // Use public endpoint for invite links
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3020/api'}/public/meetings/${params.id}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Toplantı bulunamadı');
        }

        const data = await response.json();
        setMeeting(data.meeting);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMeeting();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Toplantı Bulunamadı</h1>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  const handleJoinAsGuest = async (e) => {
    e.preventDefault();
    
    if (!guestInfo.name || !guestInfo.email) {
      toast.error('İsim ve email zorunludur');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3020/api'}/public/meetings/${params.id}/join-guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: guestInfo.name,
          email: guestInfo.email
        })
      });

      if (!response.ok) {
        throw new Error('Toplantıya katılım başarısız');
      }

      const data = await response.json();
      setGuestInfo(prev => ({ ...prev, id: data.guestUser.id }));
      setJoinedAsGuest(true);
      toast.success('Toplantıya katıldınız!');
    } catch (err) {
      toast.error('Katılım hatası: ' + err.message);
    }
  };

  if (joinedAsGuest) {
    return <MeetingRoom meeting={meeting} guestUser={guestInfo} onClose={() => router.push('/')} />;
  }

  if (isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center text-white max-w-md p-8 w-full">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Toplantı Daveti</h1>
            <div className="bg-slate-800/50 rounded-xl p-6 mb-6 border border-slate-700">
              <h2 className="text-xl font-semibold mb-2 text-white">{meeting.title}</h2>
              <p className="text-slate-400 mb-4">
                {new Date(meeting.startTime).toLocaleString('tr-TR')}
              </p>
              {meeting.description && (
                <p className="text-slate-300">{meeting.description}</p>
              )}
            </div>
            
            <form onSubmit={handleJoinAsGuest} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  İsim
                </label>
                <input
                  type="text"
                  value={guestInfo.name}
                  onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                  placeholder="Adınız Soyadınız"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={guestInfo.email}
                  onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-all transform hover:scale-105"
              >
                Toplantıya Katıl
              </button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-slate-700">
              <button
                onClick={() => router.push('/login')}
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Hesabınız var mı? Giriş yapın
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <MeetingRoom meeting={meeting} onClose={() => router.push('/dashboard?tab=meetings')} />;
}
