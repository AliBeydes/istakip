'use client';

import React, { useState, useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { Users, Search, UserPlus, Edit2, Trash2, Mail, Shield, MoreVertical } from 'lucide-react';

export default function UserManagement() {
  const { users, fetchWorkspaceUsers, loading } = useUserStore();
  const { isAuthenticated } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkspaceUsers('1');
    }
  }, [isAuthenticated]);

  const filteredUsers = users.filter(user => 
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Kullanıcılar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Takım Yönetimi</h1>
          <p className="text-slate-600">Çalışanlarınızı yönetin ve işbirliğini artırın</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <p className="text-2xl font-bold text-slate-900">{users.length}</p>
            <p className="text-sm text-slate-500">Toplam Kullanıcı</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <p className="text-2xl font-bold text-emerald-600">{users.filter(u => u.isActive).length}</p>
            <p className="text-sm text-slate-500">Aktif</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <p className="text-2xl font-bold text-blue-600">{users.filter(u => u.isOnline).length}</p>
            <p className="text-sm text-slate-500">Çevrimiçi</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <p className="text-2xl font-bold text-violet-600">{users.filter(u => u.role === 'ADMIN' || u.role === 'MANAGER').length}</p>
            <p className="text-sm text-slate-500">Yönetici</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Kullanıcı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center">
            <UserPlus className="w-5 h-5" />
            <span>Yeni Kullanıcı</span>
          </button>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-semibold">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${user.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <button className="p-1 hover:bg-slate-100 rounded">
                    <MoreVertical className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
              
              <h3 className="font-semibold text-slate-900 mb-1">{user.firstName} {user.lastName}</h3>
              <p className="text-sm text-slate-500 mb-3">{user.email}</p>
              
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {user.isActive ? 'Aktif' : 'Pasif'}
                </span>
                {user.role === 'ADMIN' && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                    Admin
                  </span>
                )}
              </div>

              {user.position && (
                <p className="text-sm text-slate-600 mb-1">{user.position}</p>
              )}
              {user.department && (
                <p className="text-sm text-slate-500">{user.department}</p>
              )}

              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                <button className="flex-1 px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2 text-sm">
                  <Edit2 className="w-4 h-4" />
                  Düzenle
                </button>
                <button className="px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Kullanıcı Bulunamadı</h3>
            <p className="text-slate-500">Arama kriterlerinize uygun kullanıcı bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
