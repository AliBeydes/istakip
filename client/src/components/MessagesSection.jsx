'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Users, Clock, Search, Send, MoreVertical,
  Phone, Video, Info, Trash2, Check, CheckCheck, Bell,
  ChevronLeft, Plus, X, RefreshCw, Archive, Star, UserPlus,
  Crown, Shield, User, Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { api } from '@/stores/authStore';

const CONTAINER_STYLES = {
  card: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/30 shadow-lg',
};

export default function MessagesSection() {
  const [activeTab, setActiveTab] = useState('personal'); // personal, groups, recent
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentActivities, setRecentActivities] = useState([]);

  // Real data - will be populated from API
  const [conversations, setConversations] = useState([]);

  // Real data - will be populated from API
  const [groups, setGroups] = useState([]);

  // User search modal state
  const [showUserSearchModal, setShowUserSearchModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  const handleClearRecentActivities = () => {
    setRecentActivities([]);
    toast.success('Son aktiviteler temizlendi!');
  };

  const handleCreateChat = () => {
    setShowUserSearchModal(true);
    setUserSearchQuery('');
    fetchUsers();
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await api.get('/users/workspace/1');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSelectUser = (user) => {
    const existingChat = conversations.find(c => c.userId === user.id);
    if (existingChat) {
      setSelectedChat(existingChat);
      toast.info(`${user.firstName} ile olan sohbete devam ediliyor`);
    } else {
      const newChat = {
        id: Date.now(),
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        avatar: user.avatar,
        message: '',
        time: 'Şimdi',
        unread: 0,
        online: user.isActive || false,
        messages: []
      };
      setConversations(prev => [newChat, ...prev]);
      setSelectedChat(newChat);
      toast.success(`${user.firstName} ile yeni sohbet başlatıldı!`);
    }
    setShowUserSearchModal(false);
    setUserSearchQuery('');
  };

  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const handleCreateGroup = () => {
    const name = prompt('Yeni grup adı:');
    if (name && name.trim()) {
      const newGroup = {
        id: Date.now(),
        name: name.trim(),
        icon: '💬',
        members: 1,
        message: '',
        time: 'Şimdi',
        unread: 0,
        messages: []
      };
      setGroups(prev => [newGroup, ...prev]);
      setSelectedGroup(newGroup);
      toast.success('Yeni grup oluşturuldu!');
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    if (selectedChat) {
      const newMessage = {
        id: Date.now(),
        sender: 'me',
        text: messageInput,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setConversations(prev => prev.map(conv => 
        conv.id === selectedChat.id 
          ? { ...conv, messages: [...conv.messages, newMessage], message: messageInput, time: 'Şimdi' }
          : conv
      ));
      
      setSelectedChat(prev => ({ ...prev, messages: [...prev.messages, newMessage] }));
    }
    
    if (selectedGroup) {
      const newMessage = {
        id: Date.now(),
        sender: 'Ben',
        text: messageInput,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        avatar: null
      };
      
      setGroups(prev => prev.map(group => 
        group.id === selectedGroup.id 
          ? { ...group, messages: [...group.messages, newMessage], message: messageInput, time: 'Şimdi' }
          : group
      ));
      
      setSelectedGroup(prev => ({ ...prev, messages: [...prev.messages, newMessage] }));
    }
    
    setMessageInput('');
  };

  const filteredConversations = conversations.filter(conv => 
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-blue-500" />
            Mesajlar
          </h2>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => { setActiveTab('personal'); setSelectedGroup(null); }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'personal'
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              <User className="w-4 h-4 inline mr-1" />
              Kişisel
            </button>
            <button
              onClick={() => { setActiveTab('groups'); setSelectedChat(null); }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'groups'
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              <Users className="w-4 h-4 inline mr-1" />
              Gruplar
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={activeTab === 'groups' ? handleCreateGroup : handleCreateChat}
          >
            <Plus className="w-4 h-4 mr-1" />
            {activeTab === 'groups' ? 'Yeni Grup' : 'Yeni Sohbet'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
        {/* Left Sidebar - List */}
        <div className="border-r border-slate-200 dark:border-slate-700 pr-4 flex flex-col">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'groups' ? 'Grup ara...' : 'Kişi ara...'}
              className="pl-9"
            />
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto space-y-1">
            {activeTab === 'personal' && (
              <>
                {filteredConversations.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                      selectedChat?.id === chat.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm">
                            {chat.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {chat.online && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                            {chat.name}
                          </span>
                          <span className="text-xs text-slate-400">{chat.time}</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {chat.message}
                        </p>
                      </div>
                      {chat.unread > 0 && (
                        <Badge className="bg-blue-500 text-white text-xs px-2 py-0.5">
                          {chat.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'groups' && (
              <>
                {filteredGroups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => setSelectedGroup(group)}
                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                      selectedGroup?.id === group.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                        {group.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                            {group.name}
                          </span>
                          <span className="text-xs text-slate-400">{group.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-400">{group.members}</span>
                          <span className="text-sm text-slate-500 dark:text-slate-400 truncate ml-1">
                            {group.message}
                          </span>
                        </div>
                      </div>
                      {group.unread > 0 && (
                        <Badge className="bg-blue-500 text-white text-xs px-2 py-0.5">
                          {group.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}

          </div>
        </div>

        {/* Right Side - Chat Area */}
        <div className="md:col-span-2 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {selectedChat.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{selectedChat.name}</h3>
                    <p className="text-xs text-slate-500">
                      {selectedChat.online ? '🟢 Çevrimiçi' : '⚪ Çevrimdışı'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="w-5 h-5 text-slate-600" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="w-5 h-5 text-slate-600" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Info className="w-5 h-5 text-slate-600" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setSelectedChat(null)}
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 my-4 overflow-y-auto">
                <div className="space-y-3">
                  {selectedChat.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          msg.sender === 'me'
                            ? 'bg-blue-500 text-white rounded-br-sm'
                            : 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white rounded-bl-sm shadow-sm'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <span className={`text-xs ${msg.sender === 'me' ? 'text-blue-200' : 'text-slate-400'} mt-1 block`}>
                          {msg.time}
                          {msg.sender === 'me' && <CheckCheck className="w-3 h-3 inline ml-1" />}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Mesaj yazın..."
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} className="bg-blue-500 hover:bg-blue-600">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : selectedGroup ? (
            <>
              {/* Group Chat Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
                    {selectedGroup.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{selectedGroup.name}</h3>
                    <p className="text-xs text-slate-500">{selectedGroup.members} üye</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Users className="w-5 h-5 text-slate-600" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Info className="w-5 h-5 text-slate-600" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setSelectedGroup(null)}
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </Button>
                </div>
              </div>

              {/* Group Messages */}
              <div className="flex-1 bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 my-4 overflow-y-auto">
                <div className="space-y-3">
                  {selectedGroup.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'Ben' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[80%] ${msg.sender === 'Ben' ? 'flex-row-reverse' : ''}`}>
                        {msg.sender !== 'Ben' && (
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-green-500 to-teal-600 text-white text-xs">
                              {msg.sender[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          {msg.sender !== 'Ben' && (
                            <p className="text-xs text-slate-500 mb-0.5 ml-1">{msg.sender}</p>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              msg.sender === 'Ben'
                                ? 'bg-blue-500 text-white rounded-br-sm'
                                : 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white rounded-bl-sm shadow-sm'
                            }`}
                          >
                            <p className="text-sm">{msg.text}</p>
                            <span className={`text-xs ${msg.sender === 'Ben' ? 'text-blue-200' : 'text-slate-400'} mt-1 block`}>
                              {msg.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group Input */}
              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Gruba mesaj yazın..."
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} className="bg-purple-500 hover:bg-purple-600">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Sohbet başlatmak için bir kişi veya grup seçin</p>
                <p className="text-sm mt-2">Sol panelden seçim yapabilirsiniz</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* User Search Modal */}
      <Dialog open={showUserSearchModal} onOpenChange={setShowUserSearchModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Sohbet</DialogTitle>
            <DialogDescription>
              Sohbet başlatmak için bir kullanıcı arayın ve seçin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Kullanıcı ara..."
                className="pl-9"
                autoFocus
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  {userSearchQuery ? 'Kullanıcı bulunamadı' : 'Kullanıcı listesi yükleniyor...'}
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                  >
                    <Avatar className="w-10 h-10">
                      {user.avatar ? (
                        <AvatarImage src={user.avatar} alt={user.firstName} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-slate-500 truncate">{user.email}</p>
                    </div>
                    {user.isActive && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
