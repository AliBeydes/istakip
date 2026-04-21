'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { api } from '@/stores/authStore';
import { Calendar, Clock, User, Video, MapPin, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function JoinMeetingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const meetingId = params.id;
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meeting, setMeeting] = useState(null);
  const [participant, setParticipant] = useState(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    fetchMeetingDetails();
  }, [meetingId, token, email]);

  const fetchMeetingDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/meetings/join/${meetingId}?token=${token}&email=${encodeURIComponent(email)}`);
      setMeeting(response.data.meeting);
      setParticipant(response.data.participant);
      
      if (response.data.participant.status === 'JOINED') {
        setJoined(true);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Toplantı bilgileri alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/meetings/join/${meetingId}?token=${token}&email=${encodeURIComponent(email)}`);
      setMeeting(response.data.meeting);
      setParticipant(response.data.participant);
      setJoined(true);
    } catch (error) {
      setError(error.response?.data?.error || 'Toplantıya katılım başarısız');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl">Hata</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-xl">Toplantı Bulunamadı</CardTitle>
            <CardDescription>Toplantı bilgilerine ulaşılamadı.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Card>
          <CardHeader className="text-center border-b pb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">{meeting.title}</CardTitle>
            <CardDescription className="text-base mt-2">
              {meeting.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-6">
            {/* Meeting Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Calendar className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-500">Tarih</p>
                  <p className="font-medium">
                    {new Date(meeting.startTime).toLocaleDateString('tr-TR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Clock className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-500">Saat</p>
                  <p className="font-medium">
                    {new Date(meeting.startTime).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })} - 
                    {new Date(meeting.endTime).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              {meeting.location && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500">Konum</p>
                    <p className="font-medium">{meeting.location}</p>
                  </div>
                </div>
              )}
              
              {participant && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <User className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-blue-600">Davetli</p>
                    <p className="font-medium text-blue-800">{participant.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Join Button */}
            {!joined ? (
              <Button 
                onClick={handleJoinMeeting}
                className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Video className="w-5 h-5 mr-2" />
                Toplantıya Katıl
              </Button>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-green-700">Toplantıya Katıldınız!</p>
                  <p className="text-slate-500 mt-1">
                    Toplantıya başarıyla katıldınız. Yönlendiriliyorsunuz...
                  </p>
                </div>
                
                {meeting.meetingLink && (
                  <a 
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4"
                  >
                    <Button variant="outline" className="w-full">
                      <Video className="w-4 h-4 mr-2" />
                      Toplantı Linkine Git
                    </Button>
                  </a>
                )}
              </div>
            )}

            {/* Participants Count */}
            <div className="pt-4 border-t">
              <p className="text-sm text-slate-500 text-center">
                <User className="w-4 h-4 inline mr-1" />
                {meeting.participants?.length || 0} katılımcı
              </p>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center text-xs text-slate-400 mt-6">
          İş Takip Platformu - Harici Katılımcı Daveti
        </p>
      </div>
    </div>
  );
}
