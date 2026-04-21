'use client';
import { useState } from 'react';
import { 
  CheckSquare, 
  MessageSquare, 
  Folder, 
  Settings2,
  User,
  Users,
  Building,
  CreditCard,
  BarChart3,
  Video,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export default function SimplifiedNav({ activeTab, onTabChange }) {
  const [advancedExpanded, setAdvancedExpanded] = useState(false);

  const mainItems = [
    { id: 'tasks', icon: CheckSquare, label: 'Görevler' },
    { id: 'communication', icon: MessageSquare, label: 'İletişim' },
    { id: 'files', icon: Folder, label: 'Dosyalar' },
    { id: 'meetings', icon: Video, label: 'Toplantılar' }
  ];

  const advancedItems = [
    { id: 'analytics', label: 'Analitikler' },
    { id: 'automation', label: 'Otomasyon' },
    { id: 'templates', label: 'Şablonlar' },
    { id: 'gamification', label: 'Rozetler' },
    { id: 'users', label: 'Kullanıcı Yönetimi' },
    { id: 'workspace', label: 'Çalışma Alanı' },
    { id: 'plans', label: 'Planlar' },
    { id: 'profile', label: 'Profil' },
    { id: 'admin', label: 'Admin Paneli' }
  ];

  return (
    <nav className="w-64 bg-white border-r border-gray-200 h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Taskera</h1>
      </div>
      
      <div className="px-4 space-y-2">
        {mainItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              console.log('SimplifiedNav: Changing tab to', item.id);
              onTabChange(item.id);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === item.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-900'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => setAdvancedExpanded(!advancedExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Settings2 className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-600">Gelişmiş</span>
            </div>
            {advancedExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {advancedExpanded && (
            <div className="ml-8 mt-2 space-y-1">
              {advancedItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    console.log('SimplifiedNav: Changing tab to', item.id);
                    onTabChange(item.id);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 ${
                    activeTab === item.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
