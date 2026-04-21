import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3020/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem('auth-storage');
  console.log('🔍 auth-storage:', authStorage ? 'EXISTS' : 'NOT FOUND');
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      const token = parsed.state?.user?.token;
      console.log('🔍 Token:', token ? `${token.substring(0, 20)}...` : 'NOT FOUND');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error parsing auth token:', e);
    }
  }
  return config;
});

export const meetingService = {
  // Get all meetings for workspace
  getMeetings: async (workspaceId) => {
    const response = await api.get(`/meetings?workspaceId=${workspaceId}`);
    return response.data;
  },

  // Create new meeting
  createMeeting: async (data) => {
    const response = await api.post('/meetings', data);
    return response.data;
  },

  // Get meeting by ID
  getMeeting: async (meetingId) => {
    const response = await api.get(`/meetings/${meetingId}`);
    return response.data;
  },

  // Update meeting
  updateMeeting: async (meetingId, data) => {
    const response = await api.patch(`/meetings/${meetingId}`, data);
    return response.data;
  },

  // Delete meeting
  deleteMeeting: async (meetingId) => {
    const response = await api.delete(`/meetings/${meetingId}`);
    return response.data;
  },

  // Join meeting room
  joinMeeting: async (meetingId) => {
    const response = await api.post(`/meetings/${meetingId}/join`);
    return response.data;
  },

  // Leave meeting room
  leaveMeeting: async (meetingId) => {
    const response = await api.post(`/meetings/${meetingId}/leave`);
    return response.data;
  },

  // Get meeting participants
  getParticipants: async (meetingId) => {
    const response = await api.get(`/meetings/${meetingId}/participants`);
    return response.data;
  },
};
