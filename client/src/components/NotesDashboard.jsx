'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Search, Trash2, Clock, Star, Folder, Tag, MoreVertical,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered,
  Link2, Image as ImageIcon, Code, Quote, Heading1, Heading2, Heading3,
  Type, Palette, Grid, Layout, Share2, Download, Printer, Fullscreen,
  ChevronLeft, ChevronRight, Pin, PinOff, Archive, ArchiveRestore, History,
  Sparkles, Wand2, Sparkle, Bot, MessageSquare, Command, Check, X,
  Menu, Sidebar, PanelLeft, PanelRight, Moon, Sun, TypeIcon, StickyNote,
  Paperclip, Loader2
} from 'lucide-react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { api } from '@/stores/authStore';
import useDebounce from '@/hooks/useDebounce';

// ============================================
// 📝 WORLD-CLASS NOTES DASHBOARD
// Notion + Obsidian + Google Docs Birleşimi
// ============================================

const CONTAINER_STYLES = {
  background: 'bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950',
  sidebar: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/30',
  editor: 'bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-black/30',
  toolbar: 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/30',
  card: 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all',
  gradientText: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent',
  button: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-blue-500/25',
};

const ANIMATION = {
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  slide: { initial: { x: -20, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -20, opacity: 0 } },
  scale: { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.95, opacity: 0 } },
};

// Simple Rich Text Editor Component
const RichTextEditor = ({ content, onChange, placeholder }) => {
  const editorRef = React.useRef(null);

  // Update editor content when prop changes
  React.useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content || '';
    }
  }, [content]);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className={`flex items-center gap-1 p-2 ${CONTAINER_STYLES.toolbar} rounded-t-lg flex-wrap`}>
        <div className="flex items-center gap-0.5 bg-slate-100/50 dark:bg-slate-700/50 rounded-lg p-1">
          <Tooltip><TooltipTrigger asChild>
            <button onClick={() => execCommand('bold')} className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded">
              <Bold className="w-4 h-4" />
            </button>
          </TooltipTrigger><TooltipContent>Kalın (Ctrl+B)</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild>
            <button onClick={() => execCommand('italic')} className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded">
              <Italic className="w-4 h-4" />
            </button>
          </TooltipTrigger><TooltipContent>İtalik (Ctrl+I)</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild>
            <button onClick={() => execCommand('underline')} className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded">
              <Underline className="w-4 h-4" />
            </button>
          </TooltipTrigger><TooltipContent>Altı Çizili (Ctrl+U)</TooltipContent></Tooltip>
        </div>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <div className="flex items-center gap-0.5 bg-slate-100/50 dark:bg-slate-700/50 rounded-lg p-1">
          <Tooltip><TooltipTrigger asChild>
            <button onClick={() => execCommand('justifyLeft')} className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded">
              <AlignLeft className="w-4 h-4" />
            </button>
          </TooltipTrigger></Tooltip>
          <Tooltip><TooltipTrigger asChild>
            <button onClick={() => execCommand('justifyCenter')} className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded">
              <AlignCenter className="w-4 h-4" />
            </button>
          </TooltipTrigger></Tooltip>
          <Tooltip><TooltipTrigger asChild>
            <button onClick={() => execCommand('justifyRight')} className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded">
              <AlignRight className="w-4 h-4" />
            </button>
          </TooltipTrigger></Tooltip>
        </div>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <div className="flex items-center gap-0.5 bg-slate-100/50 dark:bg-slate-700/50 rounded-lg p-1">
          <Tooltip><TooltipTrigger asChild>
            <button onClick={() => execCommand('insertUnorderedList')} className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded">
              <List className="w-4 h-4" />
            </button>
          </TooltipTrigger></Tooltip>
          <Tooltip><TooltipTrigger asChild>
            <button onClick={() => execCommand('insertOrderedList')} className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded">
              <ListOrdered className="w-4 h-4" />
            </button>
          </TooltipTrigger></Tooltip>
        </div>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <div className="flex items-center gap-0.5 bg-slate-100/50 dark:bg-slate-700/50 rounded-lg p-1">
          <Tooltip><TooltipTrigger asChild>
            <button onClick={() => execCommand('formatBlock', 'H1')} className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded font-bold text-xs">H1</button>
          </TooltipTrigger></Tooltip>
          <Tooltip><TooltipTrigger asChild>
            <button onClick={() => execCommand('formatBlock', 'H2')} className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded font-bold text-xs">H2</button>
          </TooltipTrigger></Tooltip>
          <Tooltip><TooltipTrigger asChild>
            <button onClick={() => execCommand('formatBlock', 'H3')} className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded font-bold text-xs">H3</button>
          </TooltipTrigger></Tooltip>
        </div>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Tooltip><TooltipTrigger asChild>
          <button onClick={() => {
            const url = prompt('Link URL:');
            if (url) execCommand('createLink', url);
          }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
            <Link2 className="w-4 h-4" />
          </button>
        </TooltipTrigger><TooltipContent>Link Ekle</TooltipContent></Tooltip>
        <Tooltip><TooltipTrigger asChild>
          <button onClick={() => execCommand('removeFormat')} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-red-500">
            <X className="w-4 h-4" />
          </button>
        </TooltipTrigger><TooltipContent>Formatı Temizle</TooltipContent></Tooltip>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Tooltip><TooltipTrigger asChild>
          <button onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.onchange = (e) => {
              const file = e.target.files[0];
              if (file) {
                toast.success(`${file.name} eklendi`);
                // Insert file link
                execCommand('insertHTML', `<a href="#" class="file-attachment">📎 ${file.name}</a>`);
              }
            };
            input.click();
          }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-blue-500">
            <Paperclip className="w-4 h-4" />
          </button>
        </TooltipTrigger><TooltipContent>Dosya Ekle</TooltipContent></Tooltip>
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="flex-1 p-6 outline-none prose dark:prose-invert max-w-none overflow-y-auto text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900"
        style={{ minHeight: '300px' }}
        onInput={(e) => {
          const newHtml = e.currentTarget.innerHTML;
          onChange(newHtml);
        }}
        onBlur={() => {
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
          }
        }}
        placeholder={placeholder}
      />
    </div>
  );
};

// AI Assistant Component
const AIAssistant = ({ onGenerate, loading }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 border border-violet-200 dark:border-violet-800 rounded-xl p-4 mb-4"
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
        <Sparkles className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-sm text-slate-900 dark:text-white">AI Yazma Asistanı</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">Notunuzu genişletin, özetleyin veya iyileştirin</p>
      </div>
      <Button 
        size="sm" 
        onClick={onGenerate}
        disabled={loading}
        className="bg-gradient-to-r from-violet-500 to-purple-500 text-white"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
        {loading ? 'Yazıyor...' : 'AI ile Yaz'}
      </Button>
    </div>
  </motion.div>
);

// Note Card Component
const NoteCard = ({ note, isSelected, onClick, onDelete, onPin, viewMode = 'grid' }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    whileHover={{ scale: 1.02, y: -2 }}
    onClick={onClick}
    className={`group relative p-4 rounded-xl cursor-pointer transition-all ${
      isSelected 
        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-500 shadow-lg' 
        : CONTAINER_STYLES.card + ' border border-slate-200/50 dark:border-slate-700/30 hover:shadow-md'
    }`}
  >
    {note.isPinned && (
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
        <Pin className="w-3 h-3 text-white" />
      </div>
    )}
    <div className="flex items-start gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
        note.color || 'bg-gradient-to-br from-blue-500 to-indigo-500'
      }`}>
        <StickyNote className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-900 dark:text-white truncate mb-1">{note.title || 'İsimsiz Not'}</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
          {note.content?.replace(/<[^>]*>/g, '').substring(0, 100) || 'İçerik yok'}
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-3 h-3" />
          {new Date(note.updatedAt).toLocaleDateString('tr-TR')}
          {note.tags?.map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
        </div>
      </div>
    </div>
    
    {/* Actions */}
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
      <button 
        onClick={(e) => { e.stopPropagation(); onPin(note); }}
        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
      >
        {note.isPinned ? <PinOff className="w-4 h-4 text-amber-500" /> : <Pin className="w-4 h-4" />}
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(note); }}
        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-500"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </motion.div>
);

export default function NotesDashboard() {
  // 📝 State
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // 📁 Folders
  const folders = [
    { id: 'all', name: 'Tüm Notlar', icon: Layout, count: notes.length },
    { id: 'pinned', name: 'Sabitlenmiş', icon: Pin, count: notes.filter(n => n.isPinned).length },
    { id: 'recent', name: 'Son Güncellenen', icon: Clock, count: notes.filter(n => new Date(n.updatedAt) > new Date(Date.now() - 24*60*60*1000)).length },
    { id: 'starred', name: 'Yıldızlı', icon: Star, count: notes.filter(n => n.isStarred).length },
    { id: 'shared', name: 'Paylaşılan', icon: Share2, count: 0 },
    { id: 'trash', name: 'Çöp Kutusu', icon: Trash2, count: 0 },
  ];

  // 🔄 Fetch Notes
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notes?workspaceId=1');
      setNotes(response.data.notes || []);
    } catch (error) {
      // Keep empty state if API fails - user can create new notes
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  // ✏️ CRUD Operations
  const createNote = async () => {
    const newNote = {
      id: Date.now().toString(),
      title: 'Yeni Not',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
      isPinned: false,
      isStarred: false,
      folder: 'all'
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    toast.success('Yeni not oluşturuldu');
  };

  const updateNote = async (id, updates) => {
    setNotes(notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));
    if (selectedNote?.id === id) {
      setSelectedNote({ ...selectedNote, ...updates, updatedAt: new Date().toISOString() });
    }
  };

  const deleteNote = async (note) => {
    if (!confirm('Bu notu silmek istediğinize emin misiniz?')) return;
    setNotes(notes.filter(n => n.id !== note.id));
    if (selectedNote?.id === note.id) setSelectedNote(null);
    toast.success('Not silindi');
  };

  const pinNote = async (note) => {
    updateNote(note.id, { isPinned: !note.isPinned });
    toast.success(note.isPinned ? 'Sabitleme kaldırıldı' : 'Not sabitlendi');
  };

  // 🤖 AI Generation
  const generateWithAI = async () => {
    setAiLoading(true);
    setTimeout(() => {
      const generated = '<h2>AI Tarafından Oluşturulan İçerik</h2><p>Bu bölüm yapay zeka tarafından otomatik olarak oluşturuldu. Gerçek bir AI entegrasyonu için OpenAI API anahtarı ekleyin.</p><ul><li>Önemli nokta 1</li><li>Önemli nokta 2</li><li>Önemli nokta 3</li></ul>';
      updateNote(selectedNote.id, { content: selectedNote.content + generated });
      setAiLoading(false);
      toast.success('AI içerik oluşturdu');
    }, 2000);
  };

  // 🔍 Filter Notes
  const filteredNotes = useMemo(() => {
    let filtered = notes;
    
    // Search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(n => 
        n.title?.toLowerCase().includes(query) ||
        n.content?.toLowerCase().includes(query) ||
        n.tags?.some(t => t.toLowerCase().includes(query))
      );
    }
    
    // Folder
    switch (activeFolder) {
      case 'pinned':
        filtered = filtered.filter(n => n.isPinned);
        break;
      case 'recent':
        filtered = filtered.filter(n => new Date(n.updatedAt) > new Date(Date.now() - 24*60*60*1000));
        break;
      case 'starred':
        filtered = filtered.filter(n => n.isStarred);
        break;
    }
    
    // Sort by pinned first, then by date
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  }, [notes, debouncedSearch, activeFolder]);

  // 🎨 Render
  return (
    <TooltipProvider>
      <div className={`flex h-screen overflow-hidden ${CONTAINER_STYLES.background}`}>
        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className={`${CONTAINER_STYLES.sidebar} flex flex-col`}
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/30">
                <div className="flex items-center justify-between mb-4">
                  <h1 className={`text-xl font-bold ${CONTAINER_STYLES.gradientText}`}>Notlarım</h1>
                  <Button size="sm" onClick={createNote} className={CONTAINER_STYLES.button}>
                    <Plus className="w-4 h-4 mr-1" />
                    Yeni
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Notlarda ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-100/50 dark:bg-slate-800/50 border-0"
                  />
                </div>
              </div>

              {/* Folders */}
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-1">
                  {folders.map(folder => (
                    <button
                      key={folder.id}
                      onClick={() => setActiveFolder(folder.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                        activeFolder === folder.id 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <folder.icon className="w-5 h-5" />
                      <span className="flex-1 text-left">{folder.name}</span>
                      <Badge variant={activeFolder === folder.id ? 'secondary' : 'outline'} className="text-xs">
                        {folder.count}
                      </Badge>
                    </button>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Tags */}
                <div className="px-3">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">Etiketler</h3>
                  <div className="flex flex-wrap gap-2">
                    {['iş', 'kişisel', 'fikir', 'toplantı', 'plan'].map(tag => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-slate-200">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className={`flex items-center justify-between px-4 py-3 ${CONTAINER_STYLES.toolbar}`}>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <PanelLeft className="w-5 h-5" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {folders.find(f => f.id === activeFolder)?.name}
              </span>
              <Badge variant="secondary" className="ml-2">{filteredNotes.length} not</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-1 flex">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Dışa Aktar
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Notes List */}
            <div className={`${selectedNote ? 'hidden lg:block lg:w-96' : 'w-full'} overflow-y-auto p-4`}>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredNotes.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <FileText className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Not Bulunamadı
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    {searchQuery ? 'Arama kriterlerinize uygun not bulunmuyor.' : 'Henüz not oluşturmadınız.'}
                  </p>
                  <Button onClick={createNote} className={CONTAINER_STYLES.button}>
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Not Oluştur
                  </Button>
                </motion.div>
              ) : (
                <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                  <AnimatePresence>
                    {filteredNotes.map(note => (
                      <NoteCard 
                        key={note.id} 
                        note={note} 
                        isSelected={selectedNote?.id === note.id}
                        onClick={() => setSelectedNote(note)}
                        onDelete={deleteNote}
                        onPin={pinNote}
                        viewMode={viewMode}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Editor */}
            {selectedNote && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '100%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="flex-1 flex flex-col border-l border-slate-200/50 dark:border-slate-700/30 bg-white dark:bg-slate-900"
              >
                {/* Editor Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/50 dark:border-slate-700/30">
                  <div className="flex items-center gap-3 flex-1">
                    <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSelectedNote(null)}>
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Input 
                      value={selectedNote.title}
                      onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                      className="text-xl font-bold border-0 bg-transparent focus-visible:ring-0 px-0"
                      placeholder="Not Başlığı"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip><TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => updateNote(selectedNote.id, { isStarred: !selectedNote.isStarred })}>
                        <Star className={`w-5 h-5 ${selectedNote.isStarred ? 'text-amber-500 fill-amber-500' : ''}`} />
                      </Button>
                    </TooltipTrigger></Tooltip>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => pinNote(selectedNote)}>
                          {selectedNote.isPinned ? <PinOff className="w-4 h-4 mr-2" /> : <Pin className="w-4 h-4 mr-2" />}
                          {selectedNote.isPinned ? 'Sabitlemeyi Kaldır' : 'Sabitle'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => deleteNote(selectedNote)} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* AI Assistant */}
                <AIAssistant onGenerate={generateWithAI} loading={aiLoading} />

                {/* Rich Text Editor */}
                <div className="flex-1 overflow-hidden">
                  <RichTextEditor 
                    content={selectedNote.content}
                    onChange={(html) => updateNote(selectedNote.id, { content: html })}
                    placeholder="Notunuzu yazmaya başlayın..."
                  />
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-slate-200/50 dark:border-slate-700/30 flex items-center justify-between text-sm text-slate-500">
                  <span>Son güncelleme: {new Date(selectedNote.updatedAt).toLocaleString('tr-TR')}</span>
                  <div className="flex items-center gap-2">
                    <span>Karakter: {selectedNote.content?.length || 0}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span>Kelime: {(selectedNote.content?.match(/\w+/g) || []).length}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}

