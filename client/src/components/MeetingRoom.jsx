'use client';

import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import SimplePeer from 'simple-peer';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Users,
  MessageSquare,
  ScreenShare,
  Copy,
  Settings,
  Clock,
  X,
  Send,
  Volume2,
  VolumeX,
  MonitorSpeaker,
} from 'lucide-react';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3020';

export default function MeetingRoom({ meeting, onClose, guestUser }) {
  const [localStream, setLocalStream] = useState(null);
  const [peers, setPeers] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(guestUser || null);
  const [userName, setUserName] = useState(guestUser?.name || 'Guest');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  
  const socketRef = useRef(null);
  const userVideoRef = useRef(null);
  const peersRef = useRef({});
  const messagesEndRef = useRef(null);

  // Get auth token
  const getToken = () => {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed.state?.user?.token || null;
      }
    } catch (e) {
      console.error('Error getting token:', e);
    }
    return null;
  };

  // Initialize
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        // Get local media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        setLocalStream(stream);

        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }

        // Connect socket (with or without token for guest users)
        const token = getToken();
        const auth = guestUser 
          ? { 
              userId: guestUser.id || guestUser.email, 
              userName: guestUser.name, 
              email: guestUser.email,
              isGuest: true 
            }
          : { token };

        socketRef.current = io(SOCKET_URL, {
          auth,
          transports: ['websocket', 'polling'],
        });

        socketRef.current.on('connect', () => {
          console.log('✅ Connected to server');
          setIsConnected(true);
          
          // Join room
          socketRef.current.emit('meeting:join', {
            roomId: meeting.id,
            userId: guestUser?.id || guestUser?.email || 'current-user',
            userName: guestUser?.name || 'Current User',
            isGuest: guestUser?.isGuest || false,
          });
        });

        socketRef.current.on('connect_error', (err) => {
          console.error('❌ Connection error:', err.message);
          setError('Sunucuya bağlanılamadı: ' + err.message);
        });

        socketRef.current.on('meeting:participants', (data) => {
          console.log('👥 Participants:', data.participants);
          setParticipants(data.participants);
        });

        socketRef.current.on('meeting:user-joined', ({ userId, userName, isGuest }) => {
          console.log(`👋 ${userName} joined`);
          toast.success(`${userName} katıldı`);
          
          // Create peer connection for new user
          createPeerConnection(userId, userName, stream, true);
        });

        socketRef.current.on('meeting:user-left', ({ userId, userName }) => {
          console.log(`👋 ${userName} left`);
          toast.info(`${userName} ayrıldı`);
          
          // Remove peer
          if (peersRef.current[userId]) {
            peersRef.current[userId].destroy();
            delete peersRef.current[userId];
            setPeers(prev => {
              const newPeers = { ...prev };
              delete newPeers[userId];
              return newPeers;
            });
          }
        });

        socketRef.current.on('meeting:signal', ({ userId, signal }) => {
          console.log('📡 Received signal from', userId);
          if (peersRef.current[userId]) {
            peersRef.current[userId].signal(signal);
          }
        });

        socketRef.current.on('meeting:chat', (data) => {
          setMessages(prev => [...prev, data]);
        });

      } catch (err) {
        console.error('❌ Error initializing:', err);
        setError('Kamera/mikrofon erişimi sağlanamadı');
      }
    };

    init();

    return () => {
      mounted = false;
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      Object.values(peersRef.current).forEach(peer => peer.destroy());
    };
  }, [meeting.id, guestUser]);

  const createPeerConnection = (userId, userName, stream, initiator = false) => {
    console.log(`🔗 Creating peer connection for ${userName} (initiator: ${initiator})`);
    
    const peer = new SimplePeer({
      initiator,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      console.log('📡 Sending signal to', userId);
      socketRef.current.emit('meeting:signal', {
        roomId: meeting.id,
        userId,
        signal,
      });
    });

    peer.on('stream', (remoteStream) => {
      console.log('📹 Received stream from', userName);
      setPeers(prev => ({
        ...prev,
        [userId]: { userName, stream: remoteStream }
      }));
    });

    peer.on('error', (err) => {
      console.error('❌ Peer error:', err);
    });

    peer.on('connect', () => {
      console.log(`✅ Connected to ${userName}`);
    });

    peersRef.current[userId] = peer;
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const handleLeave = () => {
    if (socketRef.current) {
      socketRef.current.emit('meeting:leave', {
        roomId: meeting.id,
        userId: guestUser?.id || guestUser?.email || 'current-user',
      });
    }
    onClose();
  };

  const copyMeetingLink = () => {
    const link = `${window.location.origin}/meeting/${meeting.id}?invite=true`;
    navigator.clipboard.writeText(link);
    toast.success('Link kopyalandı');
  };

  const sendMessage = () => {
    if (newMessage.trim() && socketRef.current) {
      const message = {
        id: Date.now(),
        userId: guestUser?.id || guestUser?.email || 'current-user',
        userName: userName,
        text: newMessage,
        timestamp: new Date().toISOString(),
      };
      socketRef.current.emit('meeting:chat', {
        roomId: meeting.id,
        ...message,
      });
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (error) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 z-50 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Hata</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
          >
            Çıkış
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900/60 backdrop-blur-2xl border-b border-slate-800/50 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handleLeave} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all">
              <X className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-white font-semibold text-lg">{meeting.title}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(meeting.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {participants.length + 1}
                </span>
                {isConnected && (
                  <span className="flex items-center gap-1.5 text-green-400">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Bağlı
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyMeetingLink}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
              title="Linki kopyala"
            >
              <Copy className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
              title="Ayarlar"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="h-full grid gap-4" style={{
          gridTemplateColumns: `repeat(${Math.min(Object.keys(peers).length + 1, 4)}, 1fr)`,
          gridTemplateRows: Object.keys(peers).length > 0 ? 'repeat(2, 1fr)' : '1fr',
        }}>
          {/* Local Video */}
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl">
            <video
              ref={userVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl">
              <span className="text-white text-sm font-medium">{userName} (Siz)</span>
            </div>
            {isMuted && (
              <div className="absolute top-4 left-4 p-2 bg-red-500/90 backdrop-blur-sm rounded-xl shadow-lg">
                <MicOff className="w-4 h-4 text-white" />
              </div>
            )}
            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
                  {userName.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>

          {/* Remote Videos */}
          {Object.entries(peers).map(([userId, { userName, stream }]) => (
            <div key={userId} className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl">
              <video
                autoPlay
                playsInline
                muted={!isSpeakerOn}
                className="w-full h-full object-cover"
                ref={(videoRef) => {
                  if (videoRef) {
                    videoRef.srcObject = stream;
                  }
                }}
              />
              <div className="absolute bottom-4 left-4 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl">
                <span className="text-white text-sm font-medium">{userName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-900/60 backdrop-blur-2xl border-t border-slate-800/50 px-6 py-4">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-2xl transition-all shadow-lg ${
              isMuted
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
            title="Mikrofon"
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-2xl transition-all shadow-lg ${
              isVideoOff
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
            title="Kamera"
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>

          <button
            onClick={toggleSpeaker}
            className={`p-4 rounded-2xl transition-all shadow-lg ${
              !isSpeakerOn
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
            title="Hoparlör"
          >
            {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>

          <button
            onClick={() => toast.info('Ekran paylaşımı yakında!')}
            className="p-4 rounded-2xl bg-slate-800 text-white hover:bg-slate-700 transition-all shadow-lg"
            title="Ekran paylaş"
          >
            <ScreenShare className="w-6 h-6" />
          </button>

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-4 rounded-2xl transition-all shadow-lg ${
              showSidebar ? 'text-blue-400 bg-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Sohbet"
          >
            <MessageSquare className="w-6 h-6" />
          </button>

          <button
            onClick={() => {
              setShowSidebar(true);
              setActiveTab('participants');
            }}
            className={`p-4 rounded-2xl transition-all shadow-lg ${
              showParticipants && activeTab === 'participants' ? 'text-blue-400 bg-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Katılımcılar"
          >
            <Users className="w-6 h-6" />
          </button>

          <button
            onClick={handleLeave}
            className="p-4 rounded-2xl bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg"
            title="Ayrıl"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <div className="absolute right-0 top-16 bottom-20 w-[420px] bg-slate-900/95 backdrop-blur-2xl border-l border-slate-800/50 flex flex-col shadow-2xl">
          <div className="p-4 border-b border-slate-800/50">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 px-4 py-2.5 rounded-xl transition-all font-medium ${
                  activeTab === 'chat' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Sohbet
              </button>
              <button
                onClick={() => setActiveTab('participants')}
                className={`flex-1 px-4 py-2.5 rounded-xl transition-all font-medium ${
                  activeTab === 'participants' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Katılımcılar ({participants.length + 1})
              </button>
            </div>
          </div>

          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center text-slate-500 text-sm py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Henüz mesaj yok</p>
                    <p className="text-xs mt-1">İlk mesajı siz yazın!</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.userId === (guestUser?.id || guestUser?.email || 'current-user')
                        ? 'items-end'
                        : 'items-start'
                    }`}
                  >
                    <span className="text-xs text-slate-500 mb-1 px-1">{msg.userName}</span>
                    <div
                      className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${
                        msg.userId === (guestUser?.id || guestUser?.email || 'current-user')
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md'
                          : 'bg-slate-800 text-white rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                    <span className="text-xs text-slate-600 mt-1 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Mesaj yazın..."
                    className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  />
                  <button
                    onClick={sendMessage}
                    className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl text-white shadow-lg transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'participants' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">{userName}</p>
                  <p className="text-blue-400 text-sm">Siz (Organizatör)</p>
                </div>
                <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Çevrimiçi</div>
              </div>
              {participants.map((p) => (
                <div key={p.userId} className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800/70 transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {p.userName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{p.userName}</p>
                    <p className="text-slate-500 text-sm">Katılımcı</p>
                  </div>
                  <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Çevrimiçi</div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowSidebar(false)}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl p-6 w-[420px] shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Ayarlar</h2>
              <button onClick={() => setShowSettings(false)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isMuted ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                    {isMuted ? <MicOff className="w-5 h-5 text-red-400" /> : <Mic className="w-5 h-5 text-blue-400" />}
                  </div>
                  <div>
                    <p className="text-white font-medium">Mikrofon</p>
                    <p className="text-slate-500 text-sm">{isMuted ? 'Kapalı' : 'Açık'}</p>
                  </div>
                </div>
                <button onClick={toggleAudio} className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all">
                  {isMuted ? 'Aç' : 'Kapat'}
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isVideoOff ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                    {isVideoOff ? <VideoOff className="w-5 h-5 text-red-400" /> : <Video className="w-5 h-5 text-blue-400" />}
                  </div>
                  <div>
                    <p className="text-white font-medium">Kamera</p>
                    <p className="text-slate-500 text-sm">{isVideoOff ? 'Kapalı' : 'Açık'}</p>
                  </div>
                </div>
                <button onClick={toggleVideo} className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all">
                  {isVideoOff ? 'Aç' : 'Kapat'}
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${!isSpeakerOn ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                    {!isSpeakerOn ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-blue-400" />}
                  </div>
                  <div>
                    <p className="text-white font-medium">Hoparlör</p>
                    <p className="text-slate-500 text-sm">{!isSpeakerOn ? 'Kapalı' : 'Açık'}</p>
                  </div>
                </div>
                <button onClick={toggleSpeaker} className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all">
                  {!isSpeakerOn ? 'Aç' : 'Kapat'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
