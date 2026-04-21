'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { useSimpleTranslation } from '@/hooks/useSimpleTranslation';
import NotificationBell from '@/components/NotificationBell';
import SimplifiedNav from '@/components/SimplifiedNav';
import OnboardingFlow from '@/components/OnboardingFlow';
import useSocketStore from '@/stores/socketStore';

// Lazy load components
const TaskDashboard = lazy(() => import('@/components/TaskDashboard'));
const UserProfile = lazy(() => import('@/components/UserProfile'));
const DocumentDashboard = lazy(() => import('@/components/DocumentDashboard'));
const MeetingDashboard = lazy(() => import('@/components/MeetingDashboard'));
const AnalyticsDashboard = lazy(() => import('@/components/AnalyticsDashboard'));
const UserManagement = lazy(() => import('@/components/UserManagement'));
const WorkspaceManager = lazy(() => import('@/components/WorkspaceManager'));
const SubscriptionPlans = lazy(() => import('@/components/SubscriptionPlans'));
const NotesDashboard = lazy(() => import('@/components/NotesDashboard'));
const ProfessionalOverview = lazy(() => import('@/components/ProfessionalOverview'));
const AdminSettings = lazy(() => import('@/components/AdminSettings'));
const MessagesSection = lazy(() => import('@/components/MessagesSection'));
const AutomationRulesDashboard = lazy(() => import('@/components/AutomationRulesDashboard'));
const TaskTemplatesDashboard = lazy(() => import('@/components/TaskTemplatesDashboard'));
const GamificationDashboard = lazy(() => import('@/components/GamificationDashboard'));

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const { t } = useSimpleTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAdmin, setIsAdmin] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const { connect, disconnect } = useSocketStore();
  
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);
  
  useEffect(() => {
    if (user) {
      const hasAdminRole = user.workspaceMembers?.some(m => m.role === 'ADMIN') || 
                          user.ownedWorkspaces?.length > 0 ||
                          user?.email?.toLowerCase().includes('admin');
      setIsAdmin(hasAdminRole);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      connect(user.id, user.workspaceId || '1');
    }
    return () => disconnect();
  }, [isAuthenticated, user, connect, disconnect]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    // Load logo from localStorage
    const savedSettings = localStorage.getItem('admin-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setLogoUrl(parsed.logoUrl || null);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <OnboardingFlow />
      <SimplifiedNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('dashboard.welcome')}, {user?.firstName}!
              </h1>
              <p className="text-sm text-gray-600">{t('dashboard.description')}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <NotificationBell />
              
              <div className="flex items-center gap-3">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.firstName} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                )}
                <div className="text-left">
                  <div className="font-semibold text-gray-900 text-sm">{user?.firstName} {user?.lastName}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
              </div>
              
              <button
                onClick={() => { useAuthStore.getState().logout(); router.push('/login'); }}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 p-8">
          <Suspense fallback={<div className="text-center py-20 text-gray-500">Yükleniyor...</div>}>
            {activeTab === 'overview' && <ProfessionalOverview />}
            {activeTab === 'tasks' && <TaskDashboard />}
            {activeTab === 'notes' && <NotesDashboard />}
            {activeTab === 'communication' && <MessagesSection />}
            {activeTab === 'files' && <DocumentDashboard />}
            {activeTab === 'meetings' && <MeetingDashboard />}
            {activeTab === 'analytics' && <AnalyticsDashboard />}
            {activeTab === 'automation' && <AutomationRulesDashboard />}
            {activeTab === 'templates' && <TaskTemplatesDashboard />}
            {activeTab === 'gamification' && <GamificationDashboard />}
            {activeTab === 'profile' && <UserProfile />}
            {activeTab === 'admin' && isAdmin && <AdminSettings />}
            {activeTab === 'users' && <UserManagement workspaceId="1" />}
            {activeTab === 'workspace' && isAdmin && <WorkspaceManager />}
            {activeTab === 'plans' && <SubscriptionPlans />}
          </Suspense>
        </main>
      </div>
    </div>
  );
}