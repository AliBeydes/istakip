import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3020';

export function useWebRTC(roomId, userId, userName) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);
  
  const socketRef = useRef(null);
  const peersRef = useRef(new Map());
  const localStreamRef = useRef(null);

  // Get auth token
  const getToken = useCallback(() => {
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
  }, []);

  // Initialize local media stream
  const initLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Kamera ve mikrofon erişimi reddedildi');
      throw err;
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback((targetUserId, isInitiator, stream) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    // Add local stream tracks
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('webrtc:ice-candidate', {
          targetUserId,
          candidate: event.candidate,
        });
      }
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams((prev) => {
        const newMap = new Map(prev);
        newMap.set(targetUserId, remoteStream);
        return newMap;
      });
    };

    return pc;
  }, []);

  // Connect to signaling server
  const connectSocket = useCallback(() => {
    const token = getToken();
    
    if (!token) {
      setError('Oturum bulunamadı. Lütfen giriş yapın.');
      return;
    }

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Connected to signaling server');
      setIsConnected(true);
      setError(null);
      
      // Join room
      socketRef.current.emit('meeting:join', {
        roomId,
        userId,
        userName,
      });
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
      setError('Sunucuya bağlanılamadı: ' + err.message);
      setIsConnected(false);
    });

    socketRef.current.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
      setIsConnected(false);
    });

    // Handle room participants
    socketRef.current.on('meeting:participants', (data) => {
      setParticipants(data.participants);
    });

    // Handle new user joined
    socketRef.current.on('user:joined', async (data) => {
      console.log('👤 User joined:', data.userId);
      
      const stream = localStreamRef.current;
      if (!stream) return;

      const pc = createPeerConnection(data.userId, true, stream);
      peersRef.current.set(data.userId, pc);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketRef.current.emit('webrtc:offer', {
        targetUserId: data.userId,
        offer,
      });
    });

    // Handle user left
    socketRef.current.on('user:left', (data) => {
      console.log('👋 User left:', data.userId);
      
      const pc = peersRef.current.get(data.userId);
      if (pc) {
        pc.close();
        peersRef.current.delete(data.userId);
      }

      setRemoteStreams((prev) => {
        const newMap = new Map(prev);
        newMap.delete(data.userId);
        return newMap;
      });
    });

    // Handle incoming WebRTC offer
    socketRef.current.on('webrtc:offer', async (data) => {
      console.log('📨 Received offer from:', data.userId);
      
      const stream = localStreamRef.current;
      if (!stream) return;

      const pc = createPeerConnection(data.userId, false, stream);
      peersRef.current.set(data.userId, pc);

      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketRef.current.emit('webrtc:answer', {
        targetUserId: data.userId,
        answer,
      });
    });

    // Handle incoming WebRTC answer
    socketRef.current.on('webrtc:answer', async (data) => {
      console.log('📨 Received answer from:', data.userId);
      
      const pc = peersRef.current.get(data.userId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    // Handle ICE candidates
    socketRef.current.on('webrtc:ice-candidate', async (data) => {
      const pc = peersRef.current.get(data.userId);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });
  }, [roomId, userId, userName, getToken, createPeerConnection]);

  // Initialize
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        await initLocalStream();
        if (mounted) {
          connectSocket();
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };

    init();

    return () => {
      mounted = false;
      
      // Cleanup
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      peersRef.current.forEach((pc) => pc.close());
      peersRef.current.clear();

      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [initLocalStream, connectSocket]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }, []);

  // Leave meeting
  const leaveMeeting = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('meeting:leave', { roomId });
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    peersRef.current.forEach((pc) => pc.close());
    peersRef.current.clear();

    setRemoteStreams(new Map());
    setIsConnected(false);
  }, [roomId]);

  return {
    localStream,
    remoteStreams,
    isConnected,
    error,
    participants,
    toggleAudio,
    toggleVideo,
    leaveMeeting,
  };
}
