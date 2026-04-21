import { create } from 'zustand';
import { api } from './authStore';

export const useDocumentStore = create((set, get) => ({
  // State
  documents: [],
  loading: false,
  error: null,
  filters: {
    type: '',
    search: '',
    tags: []
  },

  // Actions
  fetchDocuments: async (workspaceId) => {
    try {
      set({ loading: true, error: null });
      
      const params = new URLSearchParams({
        workspaceId,
        ...get().filters
      });
      
      const response = await api.get(`/documents?${params}`);
      const { documents } = response.data;
      
      set({
        documents: documents || [],
        loading: false,
        error: null
      });
      
      return documents;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch documents';
      set({
        loading: false,
        error: errorMessage
      });
      return [];
    }
  },

  createDocument: async (documentData) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.post('/documents', documentData);
      const { document } = response.data;
      
      set(state => ({
        documents: [document, ...state.documents],
        loading: false,
        error: null
      }));
      
      return { success: true, document };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create document';
      set({
        loading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  updateDocument: async (documentId, updateData) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.put(`/documents/${documentId}`, updateData);
      const { document } = response.data;
      
      set(state => ({
        documents: state.documents.map(d => d.id === documentId ? document : d),
        loading: false,
        error: null
      }));
      
      return { success: true, document };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update document';
      set({
        loading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  deleteDocument: async (documentId) => {
    try {
      set({ loading: true, error: null });
      
      await api.delete(`/documents/${documentId}`);
      
      set(state => ({
        documents: state.documents.filter(d => d.id !== documentId),
        loading: false,
        error: null
      }));
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete document';
      set({
        loading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  uploadDocument: async (file, title, workspaceId, tags = []) => {
    try {
      set({ loading: true, error: null });
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('workspaceId', workspaceId);
      if (tags.length > 0) {
        tags.forEach(tag => formData.append('tags', tag));
      }
      
      const response = await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const { document } = response.data;
      
      set(state => ({
        documents: [document, ...state.documents],
        loading: false,
        error: null
      }));
      
      return { success: true, document };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to upload document';
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
        type: '',
        search: '',
        tags: []
      }
    });
  },

  clearError: () => {
    set({ error: null });
  },

  // Get documents by type
  getDocumentsByType: () => {
    const { documents = [] } = get();
    
    return {
      FILE: documents.filter(doc => doc.type === 'FILE'),
      NOTE: documents.filter(doc => doc.type === 'NOTE'),
      MEETING_NOTES: documents.filter(doc => doc.type === 'MEETING_NOTES')
    };
  },

  // Get document statistics
  getDocumentStats: () => {
    const { documents = [] } = get();
    
    return {
      total: documents.length,
      files: documents.filter(d => d.type === 'FILE').length,
      notes: documents.filter(d => d.type === 'NOTE').length,
      meetingNotes: documents.filter(d => d.type === 'MEETING_NOTES').length,
      totalSize: documents.reduce((acc, doc) => acc + (doc.fileSize || 0), 0)
    };
  }
}));
