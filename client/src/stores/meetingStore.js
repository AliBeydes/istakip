import { create } from 'zustand';
import { api } from './authStore';

export const useMeetingStore = create((set, get) => ({
  // State
  meetings: [],
  loading: false,
  error: null,
  filters: {
    status: '',
    type: '',
    startDate: '',
    endDate: ''
  },
  selectedMeeting: null,
  showMeetingModal: false,
  showSchedulerModal: false,

  // Actions
  fetchMeetings: async (workspaceId) => {
    try {
      set({ loading: true, error: null });
      
      const params = new URLSearchParams({
        workspaceId,
        ...get().filters
      });
      
      const response = await api.get(`/meetings?${params}`);
      const { meetings } = response.data;
      
      set({
        meetings: meetings || [],
        loading: false,
        error: null
      });
      
      return meetings;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch meetings';
      set({
        loading: false,
        error: errorMessage
      });
      return [];
    }
  },

  createMeeting: async (meetingData) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.post('/meetings', meetingData);
      const { meeting } = response.data;
      
      set(state => ({
        meetings: [meeting, ...state.meetings],
        loading: false,
        error: null,
        showSchedulerModal: false
      }));
      
      return { success: true, meeting };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create meeting';
      set({
        loading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  updateMeeting: async (meetingId, updateData) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.put(`/meetings/${meetingId}`, updateData);
      const { meeting } = response.data;
      
      set(state => ({
        meetings: state.meetings.map(m => m.id === meetingId ? meeting : m),
        loading: false,
        error: null
      }));
      
      return { success: true, meeting };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update meeting';
      set({
        loading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  cancelMeeting: async (meetingId, reason) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.put(`/meetings/${meetingId}`, {
        status: 'CANCELLED',
        cancellationReason: reason
      });
      
      const { meeting } = response.data;
      
      set(state => ({
        meetings: state.meetings.map(m => 
          m.id === meetingId ? meeting : m
        ),
        loading: false,
        error: null,
        selectedMeeting: meeting
      }));
      
      return { success: true, meeting };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to cancel meeting';
      set({
        loading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  deleteMeeting: async (meetingId) => {
    try {
      set({ loading: true, error: null });
      
      await api.delete(`/meetings/${meetingId}`);
      
      set(state => ({
        meetings: state.meetings.filter(m => m.id !== meetingId),
        loading: false,
        error: null,
        selectedMeeting: null,
        showMeetingModal: false
      }));
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete meeting';
      set({
        loading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  inviteExternalParticipants: async (meetingId, emails) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.post(`/meetings/${meetingId}/invite-external`, { emails });
      
      const { meeting } = response.data;
      
      set(state => ({
        meetings: state.meetings.map(m => 
          m.id === meetingId ? meeting : m
        ),
        selectedMeeting: meeting,
        loading: false,
        error: null
      }));
      
      return { success: true, meeting, results: response.data.results };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to invite external participants';
      set({
        loading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  addParticipants: async (meetingId, participants) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.post(`/meetings/${meetingId}/participants`, { participants });
      const { participants } = response.data;
      
      set(state => ({
        meetings: state.meetings.map(m => 
          m.id === meetingId 
            ? { ...m, participants: [...m.participants, ...participants] }
            : m
        ),
        loading: false,
        error: null
      }));
      
      return { success: true, participants };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to add participants';
      set({
        loading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  updateParticipantStatus: async (meetingId, participantId, status) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.put(`/meetings/${meetingId}/participants/${participantId}`, { status });
      const { participant } = response.data;
      
      set(state => ({
        meetings: state.meetings.map(m => 
          m.id === meetingId 
            ? { 
                ...m, 
                participants: m.participants.map(p => 
                  p.id === participantId ? { ...p, status } : p
                )
              }
            : m
        ),
        loading: false,
        error: null
      }));
      
      return { success: true, participant };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update participant status';
      set({
        loading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  updateMeetingNotes: async (meetingId, notes) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.post(`/meetings/${meetingId}/notes`, { notes });
      const { notes: updatedNotes } = response.data;
      
      set(state => ({
        meetings: state.meetings.map(m => 
          m.id === meetingId ? { ...m, notes: updatedNotes } : m
        ),
        loading: false,
        error: null
      }));
      
      return { success: true, notes: updatedNotes };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update meeting notes';
      set({
        loading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  clearFilters: () => {
    set({
      filters: {
        status: '',
        type: '',
        startDate: '',
        endDate: ''
      }
    });
  },

  setSelectedMeeting: (meeting) => {
    set({
      selectedMeeting: meeting,
      showMeetingModal: !!meeting
    });
  },

  setShowSchedulerModal: (show) => {
    set({
      showSchedulerModal: show,
      selectedMeeting: show ? null : get().selectedMeeting
    });
  },

  clearError: () => {
    set({ error: null });
  },

  // Get meetings by status
  getMeetingsByStatus: () => {
    const { meetings } = get();
    
    return {
      SCHEDULED: meetings.filter(m => m.status === 'SCHEDULED'),
      IN_PROGRESS: meetings.filter(m => m.status === 'IN_PROGRESS'),
      COMPLETED: meetings.filter(m => m.status === 'COMPLETED'),
      CANCELLED: meetings.filter(m => m.status === 'CANCELLED')
    };
  },

  // Get upcoming meetings
  getUpcomingMeetings: () => {
    const { meetings = [] } = get();
    const now = new Date();
    
    return meetings
      .filter(m => new Date(m.startTime) > now)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  },

  // Get past meetings
  getPastMeetings: () => {
    const { meetings = [] } = get();
    const now = new Date();
    
    return meetings
      .filter(m => new Date(m.endTime) < now)
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  },

  // Get meeting statistics
  getMeetingStats: () => {
    const { meetings = [] } = get();
    
    return {
      total: meetings.length,
      scheduled: meetings.filter(m => m.status === 'SCHEDULED').length,
      inProgress: meetings.filter(m => m.status === 'IN_PROGRESS').length,
      completed: meetings.filter(m => m.status === 'COMPLETED').length,
      cancelled: meetings.filter(m => m.status === 'CANCELLED').length,
      today: meetings.filter(m => {
        const today = new Date();
        const meetingDate = new Date(m.startTime);
        return meetingDate.toDateString() === today.toDateString();
      }).length,
      thisWeek: meetings.filter(m => {
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        const weekEnd = new Date(now.setDate(now.getDate() + (6 - now.getDay())));
        const meetingDate = new Date(m.startTime);
        return meetingDate >= weekStart && meetingDate <= weekEnd;
      }).length
    };
  }
}));
