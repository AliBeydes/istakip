'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { toast } from 'sonner';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Users,
  MessageSquare,
  MoreVertical,
  ScreenShare,
  Hand,
  Settings,
} from 'lucide-react';

export function MeetingRoom({ meeting, onClose }) {
  const userId = 'current-user'; // Get from auth context
  const userName = 'Current User'; // Get from auth context
  
  const {
    localStream,
    remoteStreams,
    isConnected,
    error,
    participants,
    toggleAudio,
    toggleVideo,
    leaveMeeting,
  } = useWebRTC(meeting.id, userId, userName);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle leave
  const handleLeave = () => {
    leaveMeeting();
    onClose();
  };

  // Toggle mute
  const handleToggleMute = () => {
    const enabled = toggleAudio();
    setIsMuted(!enabled);
  };

  // Toggle video
  const handleToggleVideo = () => {
    const enabled = toggleVideo();
    setIsVideoOff(!enabled);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/50 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-white">{meeting.title}</h2>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                {isConnected ? 'Bağlı' : 'Bağlanıyor...'}
              </span>
              <span>•</span>
              <span>{participants.length} katılımcı</span>
            </div>
          </div>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>

        {/* Video Grid */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="h-full grid gap-4" style={{
            gridTemplateColumns: `repeat(${Math.min(remoteStreams.size + 1, 4)}, 1fr)`,
            gridTemplateRows: `repeat(${Math.ceil((remoteStreams.size + 1) / 4)}, 1fr)`,
          }}>
            {/* Local Video */}
            <VideoTile
              stream={localStream}
              isLocal={true}
              userName={userName}
              isMuted={isMuted}
              isVideoOff={isVideoOff}
            />

            {/* Remote Videos */}
            {Array.from(remoteStreams.entries()).map(([participantId, stream]) => (
              <VideoTile
                key={participantId}
                stream={stream}
                isLocal={false}
                userName={participants.find(p => p.userId === participantId)?.userName || 'Katılımcı'}
              />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 px-6 py-6 bg-slate-900/50 border-t border-slate-800">
          {/* Mute */}
          <button
            onClick={handleToggleMute}
            className={`p-4 rounded-full transition-all ${
              isMuted
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-slate-700 text-white hover:bg-slate-600'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Video */}
          <button
            onClick={handleToggleVideo}
            className={`p-4 rounded-full transition-all ${
              isVideoOff
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-slate-700 text-white hover:bg-slate-600'
            }`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>

          {/* Screen Share */}
          <button
            className="p-4 rounded-full bg-slate-700 text-white hover:bg-slate-600 transition-all"
            onClick={() => toast.info('Ekran paylaşımı yakında!')}
          >
            <ScreenShare className="w-6 h-6" />
          </button>

          {/* Leave */}
          <button
            onClick={handleLeave}
            className="p-4 rounded-full bg-red-600 text-white hover:bg-red-500 transition-all"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col">
          {/* Sidebar Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-sm font-medium transition-all ${
                activeTab === 'chat'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sohbet
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`flex-1 py-3 text-sm font-medium transition-all ${
                activeTab === 'participants'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Katılımcılar ({participants.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'chat' ? (
              <div className="space-y-4">
                <div className="text-center text-slate-500 text-sm py-8">
                  Sohbet mesajları burada görünecek
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div
                    key={participant.userId}
                    className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {participant.userName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {participant.userName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {participant.userId === userId ? 'Siz' : 'Katılımcı'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Video Tile Component
function VideoTile({ stream, isLocal, userName, isMuted, isVideoOff }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative bg-slate-800 rounded-2xl overflow-hidden">
      {stream && !isVideoOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-800">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {userName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      )}

      {/* Name Tag */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-sm rounded-lg">
          {userName} {isLocal && '(Siz)'}
        </span>
        {isMuted && (
          <span className="p-1.5 bg-red-500/80 rounded-lg">
            <MicOff className="w-4 h-4 text-white" />
          </span>
        )}
      </div>
    </div>
  );
}
