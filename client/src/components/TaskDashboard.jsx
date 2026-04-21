'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSimpleTranslation } from '@/hooks/useSimpleTranslation';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  CheckCircle,
  Circle,
  AlertCircle,
  Edit,
  Trash2,
  Save,
  Briefcase,
  BarChart3,
  Grid3x3,
  List,
  X
} from 'lucide-react';

export default function TaskDashboard() {
  const { user } = useAuthStore();
  const { t } = useSimpleTranslation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('kanban');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [taskNotes, setTaskNotes] = useState('');
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [editingAssignments, setEditingAssignments] = useState(false);
  const [editSelectedUsers, setEditSelectedUsers] = useState([]);
  const [editSelectedGroups, setEditSelectedGroups] = useState([]);
  const [daysToComplete, setDaysToComplete] = useState(0);

  // Load tasks from API
  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchGroups();
  }, []);

  const fetchUsers = async () => {
    try {
      const workspaceId = localStorage.getItem('currentWorkspaceId') || '1';
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/workspace/${workspaceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Users response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Users data:', data);
        setUsers(data.users || data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const workspaceId = localStorage.getItem('currentWorkspaceId') || '1';
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/groups?workspaceId=${workspaceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Groups response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Groups data:', data);
        setGroups(data.groups || data || []);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      // Try to fetch from API with workspaceId
      const workspaceId = localStorage.getItem('currentWorkspaceId') || '1';
      const response = await fetch(`/api/tasks?workspaceId=${workspaceId}`);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if data is valid
      if (Array.isArray(data)) {
        setTasks(data);
      } else if (data.tasks && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      } else {
        throw new Error('Invalid data format from API');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Use sample data for now
      setTasks([
        {
          id: 1,
          title: t('tasks.sample.completeDocumentation'),
          description: 'Write comprehensive documentation',
          status: 'TODO',
          priority: 'HIGH',
          assignedTo: 'John Doe',
          dueDate: '2024-12-25',
          createdAt: '2024-12-01'
        },
        {
          id: 2,
          title: t('tasks.sample.reviewPullRequests'),
          description: 'Review pending PRs',
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          assignedTo: 'Jane Smith',
          dueDate: '2024-12-20',
          createdAt: '2024-12-02'
        },
        {
          id: 3,
          title: t('tasks.sample.fixLoginBug'),
          description: 'Fix mobile auth issue',
          status: 'DONE',
          priority: 'HIGH',
          assignedTo: 'Mike Johnson',
          dueDate: '2024-12-15',
          createdAt: '2024-12-03'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'MEDIUM':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'LOW':
        return <Circle className="w-4 h-4 text-green-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'DONE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'TODO':
        return t('status.todo');
      case 'IN_PROGRESS':
        return t('status.inProgress');
      case 'DONE':
        return t('status.done');
      default:
        return status;
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'LOW':
        return t('priority.low');
      case 'MEDIUM':
        return t('priority.medium');
      case 'HIGH':
        return t('priority.high');
      default:
        return priority;
    }
  };

  const openTaskDetail = (task) => {
    setSelectedTask(task);
    setTaskNotes(task.notes || '');
    setEditSelectedUsers(task.assignedUserIds || []);
    setEditSelectedGroups(task.assignedGroupIds || []);
    setEditingAssignments(false);
    setShowTaskDetail(true);
  };

  const closeTaskDetail = () => {
    setShowTaskDetail(false);
    setSelectedTask(null);
    setTaskNotes('');
  };

  const saveTaskNotes = () => {
    if (selectedTask) {
      setTasks(tasks.map(t => 
        t.id === selectedTask.id ? { ...t, notes: taskNotes } : t
      ));
      setSelectedTask({ ...selectedTask, notes: taskNotes });
      setShowTaskDetail(false);
    }
  };

  const saveAssignments = async () => {
    if (selectedTask) {
      try {
        const response = await fetch(`/api/tasks/${selectedTask.id}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            assignedUserIds: editSelectedUsers,
            assignedGroupIds: editSelectedGroups
          })
        });
        if (response.ok) {
          const updatedTask = { ...selectedTask, assignedUserIds: editSelectedUsers, assignedGroupIds: editSelectedGroups };
          setTasks(tasks.map(t => t.id === selectedTask.id ? updatedTask : t));
          setSelectedTask(updatedTask);
          setEditingAssignments(false);
        }
      } catch (error) {
        console.error('Error saving assignments:', error);
      }
    }
  };

  const completeTask = () => {
    if (selectedTask) {
      const updatedTask = { ...selectedTask, status: 'DONE' };
      setTasks(tasks.map(t => 
        t.id === selectedTask.id ? updatedTask : t
      ));
      setSelectedTask(updatedTask);
    }
  };

  const updateTaskStatus = (newStatus) => {
    if (selectedTask) {
      const updatedTask = { ...selectedTask, status: newStatus };
      setTasks(tasks.map(t => 
        t.id === selectedTask.id ? updatedTask : t
      ));
      setSelectedTask(updatedTask);
    }
  };

  const renderKanbanBoard = () => {
    const columns = [
      { id: 'TODO', title: t('status.todo'), color: 'blue', gradient: 'from-blue-500/10 to-blue-600/5' },
      { id: 'IN_PROGRESS', title: t('status.inProgress'), color: 'amber', gradient: 'from-amber-500/10 to-amber-600/5' },
      { id: 'DONE', title: t('status.done'), color: 'emerald', gradient: 'from-emerald-500/10 to-emerald-600/5' }
    ];

    const getColumnBorderColor = (color) => {
      switch(color) {
        case 'blue': return 'border-blue-200/60';
        case 'amber': return 'border-amber-200/60';
        case 'emerald': return 'border-emerald-200/60';
        default: return 'border-gray-200';
      }
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(column => {
          const columnTasks = filteredTasks.filter(t => t.status === column.id);
          return (
            <div key={column.id} className={`relative rounded-2xl p-4 bg-gradient-to-b ${column.gradient} border ${getColumnBorderColor(column.color)}`}>
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-${column.color}-500 shadow-sm shadow-${column.color}-500/30`}></div>
                  <h3 className="font-bold text-gray-800 text-sm tracking-wide uppercase">{column.title}</h3>
                </div>
                <span className={`text-xs font-bold bg-white/80 text-${column.color}-600 px-2.5 py-1 rounded-full shadow-sm border border-${column.color}-100`}>
                  {columnTasks.length}
                </span>
              </div>
              
              {/* Tasks */}
              <div className="space-y-3">
                {columnTasks.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => openTaskDetail(task)}
                    className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200/60 transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    {/* Card Header Strip */}
                    <div className={`h-1 bg-gradient-to-r from-${column.color}-400 to-${column.color}-500`}></div>
                    
                    <div className="p-4">
                      {/* Title */}
                      <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{task.title}</h4>
                      
                      {/* Description */}
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{task.description}</p>
                      
                      {/* Meta Row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg bg-${task.priority === 'HIGH' ? 'red' : task.priority === 'MEDIUM' ? 'amber' : 'emerald'}-50`}>
                            {getPriorityIcon(task.priority)}
                          </div>
                          <span className={`text-xs font-semibold ${task.priority === 'HIGH' ? 'text-red-600' : task.priority === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {getPriorityText(task.priority)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(task.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                      
                      {/* Assignee */}
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                        <div className="w-7 h-7 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-xs font-bold text-gray-600">
                            {task.assignedTo ? task.assignedTo.split(' ').map(n => n[0]).join('') : '?'}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-gray-600">{task.assignedTo || 'Atanmamış'}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Empty State */}
                {columnTasks.length === 0 && (
                  <div className="text-center py-8 px-4">
                    <div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <Circle className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-xs text-gray-400 font-medium">{t('tasks.noTasksInColumn')}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('tasks.task')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('tasks.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('tasks.priority')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('tasks.assignedTo')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('tasks.dueDate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      <div className="text-sm text-gray-500">{task.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(task.status)}`}>
                      {getStatusText(task.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(task.priority)}
                      <span className="text-sm text-gray-900">{getPriorityText(task.priority)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {task.assignedTo || 'Atanmamış'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Ultra Premium Header */}
        <div className="relative overflow-hidden rounded-3xl mb-8 bg-white shadow-xl border border-gray-100">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-100/30 to-blue-100/30 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4"></div>
          
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  {/* Premium Icon with gradient border */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-sm opacity-70"></div>
                    <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                      <Briefcase className="w-7 h-7 text-white" strokeWidth={1.5} />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent tracking-tight">
                      {t('tasks.title')}
                    </h1>
                    <p className="text-gray-500 text-sm font-medium mt-1">
                      {tasks.length} {t('tasks.title').toLowerCase()} • {t('tasks.trackAssignCollaborate')}
                    </p>
                  </div>
                </div>
                
                {/* Premium Stats */}
                <div className="flex items-center gap-4 mt-5">
                  <div className="group flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer">
                    <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm shadow-blue-500/30"></div>
                    <span className="text-sm font-semibold text-blue-700">
                      {tasks.filter(t => t.status === 'TODO').length} {t('status.todo')}
                    </span>
                  </div>
                  <div className="group flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-colors cursor-pointer">
                    <div className="w-3 h-3 bg-amber-500 rounded-full shadow-sm shadow-amber-500/30"></div>
                    <span className="text-sm font-semibold text-amber-700">
                      {tasks.filter(t => t.status === 'IN_PROGRESS').length} {t('status.inProgress')}
                    </span>
                  </div>
                  <div className="group flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-pointer">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm shadow-emerald-500/30"></div>
                    <span className="text-sm font-semibold text-emerald-700">
                      {tasks.filter(t => t.status === 'DONE').length} {t('status.done')}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Premium Create Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                <span className="relative flex items-center gap-2">
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  {t('tasks.create')}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Ultra Premium Toolbar */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-5 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Premium Search */}
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder={t('tasks.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
              />
            </div>
            
            {/* Premium View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100/80 p-1.5 rounded-xl">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                  viewMode === 'kanban' 
                    ? 'bg-white text-blue-600 shadow-md shadow-blue-500/10' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
                {t('view.board')}
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-md shadow-blue-500/10' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
              >
                <List className="w-4 h-4" />
                {t('view.list')}
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                  viewMode === 'analytics' 
                    ? 'bg-white text-blue-600 shadow-md shadow-blue-500/10' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                {t('view.analytics')}
              </button>
            </div>

            {/* Premium Filters */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none px-4 py-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <option value="all">{t('tasks.allStatus')}</option>
                  <option value="TODO">{t('status.todo')}</option>
                  <option value="IN_PROGRESS">{t('status.inProgress')}</option>
                  <option value="DONE">{t('status.done')}</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              
              <div className="relative">
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="appearance-none px-4 py-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <option value="all">{t('tasks.allPriority')}</option>
                  <option value="HIGH">{t('priority.high')}</option>
                  <option value="MEDIUM">{t('priority.medium')}</option>
                  <option value="LOW">{t('priority.low')}</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('tasks.noTasks')}</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' 
                ? t('tasks.adjustFilters') 
                : t('tasks.createFirstTask')}
            </p>
            {!searchTerm && filterStatus === 'all' && filterPriority === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tasks.createFirstTask')}
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'kanban' && renderKanbanBoard()}
            {viewMode === 'list' && renderListView()}
            {viewMode === 'analytics' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('analytics.comingSoon')}</h3>
                <p className="text-gray-600">{t('analytics.description')}</p>
              </div>
            )}
          </>
        )}

        {/* Create Task Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('tasks.create')}</h2>
                </div>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const taskData = {
                  title: formData.get('title'),
                  description: formData.get('description'),
                  priority: formData.get('priority'),
                  dueDate: formData.get('dueDate'),
                  status: 'TODO',
                  workspaceId: localStorage.getItem('currentWorkspaceId') || '1',
                  assignedUserIds: selectedUsers,
                  assignedGroupIds: selectedGroups,
                  documentIds: uploadedFiles
                };

                try {
                  const response = await fetch('/api/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(taskData)
                  });
                  if (response.ok) {
                    setShowCreateModal(false);
                    setSelectedUsers([]);
                    setSelectedGroups([]);
                    setUploadedFiles([]);
                    fetchTasks();
                  }
                } catch (error) {
                  console.error('Error creating task:', error);
                }
              }} className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('tasks.title')}</label>
                  <input
                    name="title"
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    placeholder={t('tasks.titlePlaceholder')}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('tasks.description')}</label>
                  <textarea
                    name="description"
                    rows="3"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
                    placeholder={t('tasks.descriptionPlaceholder')}
                  />
                </div>

                {/* Assign Users */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kişi Ata</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Kullanıcı ara..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm"
                    />
                    {userSearchTerm && (
                      <div className="relative max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                        {users
                          .filter(user => 
                            user.firstName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                            user.lastName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                            user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
                          )
                          .map(user => (
                            <label key={user.id} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
                              <input
                                type="checkbox"
                                value={user.id}
                                checked={selectedUsers.includes(user.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUsers([...selectedUsers, user.id]);
                                  } else {
                                    setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                            </label>
                          ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Seçilen: {selectedUsers.length} kişi</p>
                </div>

                {/* Assign Groups */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Grup Ata</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Grup ara..."
                      value={groupSearchTerm}
                      onChange={(e) => setGroupSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm"
                    />
                    {groupSearchTerm && (
                      <div className="relative max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                        {groups
                          .filter(group => 
                            group.name?.toLowerCase().includes(groupSearchTerm.toLowerCase())
                          )
                          .map(group => (
                            <label key={group.id} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
                              <input
                                type="checkbox"
                                value={group.id}
                                checked={selectedGroups.includes(group.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedGroups([...selectedGroups, group.id]);
                                  } else {
                                    setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <div className="text-sm font-medium text-gray-900">{group.name}</div>
                            </label>
                          ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Seçilen: {selectedGroups.length} grup</p>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Dosya Ekle</label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      const adminSettings = JSON.parse(localStorage.getItem('admin-settings') || '{}');
                      const maxFileSize = (adminSettings.maxFileSize || 10) * 1024 * 1024; // Convert MB to bytes
                      
                      const validFiles = files.filter(f => f.size <= maxFileSize);
                      const invalidFiles = files.filter(f => f.size > maxFileSize);
                      
                      if (invalidFiles.length > 0) {
                        alert(`${invalidFiles.length} dosya boyut limitini aşıyor (Max: ${adminSettings.maxFileSize || 10}MB)`);
                      }
                      
                      setUploadedFiles(validFiles.map(f => f.name));
                    }}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                  {uploadedFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                          {file}
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Maksimum dosya boyutu: {JSON.parse(localStorage.getItem('admin-settings') || '{}').maxFileSize || 10}MB
                  </p>
                </div>

                {/* Priority & Due Date */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('tasks.priority')}</label>
                      <select
                        name="priority"
                        defaultValue="MEDIUM"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      >
                        <option value="LOW">{t('priority.low')}</option>
                        <option value="MEDIUM">{t('priority.medium')}</option>
                        <option value="HIGH">{t('priority.high')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('tasks.dueDate')}</label>
                      <input
                        id="dueDateInput"
                        name="dueDate"
                        type="date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kaç Günde Tamamlanır</label>
                    <input
                      type="number"
                      min="0"
                      max="365"
                      value={daysToComplete}
                      onChange={(e) => {
                        const days = parseInt(e.target.value) || 0;
                        setDaysToComplete(days);
                        const dueDateInput = document.getElementById('dueDateInput');
                        if (dueDateInput) {
                          const today = new Date();
                          today.setDate(today.getDate() + days);
                          dueDateInput.value = today.toISOString().split('T')[0];
                        }
                      }}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      placeholder="0 (Bugün)"
                    />
                    <p className="text-xs text-gray-500 mt-1">Gün sayısı girin, bitiş tarihi otomatik hesaplanır</p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <Plus className="w-6 h-6" />
                    {t('tasks.create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Task Detail Modal */}
        {showTaskDetail && selectedTask && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header with Gradient */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-t-3xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-4 h-4 rounded-full ${
                        selectedTask.status === 'TODO' ? 'bg-white' :
                        selectedTask.status === 'IN_PROGRESS' ? 'bg-amber-300' : 'bg-emerald-300'
                      }`}></div>
                      <span className="text-white/90 text-sm font-medium uppercase tracking-wide">
                        {getStatusText(selectedTask.status)}
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">{selectedTask.title}</h2>
                    <p className="text-white/80 text-sm">{selectedTask.description}</p>
                  </div>
                  <button 
                    onClick={closeTaskDetail}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Task Meta Info - Better Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{t('tasks.status')}</span>
                    </div>
                    <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-xl border ${getStatusColor(selectedTask.status)}`}>
                      {getStatusText(selectedTask.status)}
                    </span>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{t('tasks.priority')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {getPriorityIcon(selectedTask.priority)}
                      <span className="text-lg font-bold text-gray-900">{getPriorityText(selectedTask.priority)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{t('tasks.dueDate')}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{new Date(selectedTask.dueDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>

                {/* Assigned Section - Full Width */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="text-lg font-bold text-gray-900">{t('tasks.assignedTo')}</span>
                    </div>
                    <button
                      onClick={() => setEditingAssignments(!editingAssignments)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
                    >
                      {editingAssignments ? 'İptal' : 'Düzenle'}
                    </button>
                  </div>
                  {editingAssignments ? (
                    <div className="space-y-8">
                      {/* Edit Users */}
                      <div>
                        <label className="block text-base font-semibold text-gray-700 mb-4">Kişi Ata</label>
                        <input
                          type="text"
                          placeholder="Kullanıcı ara..."
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          className="w-full px-5 py-4 bg-white border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-base mb-4"
                        />
                        {userSearchTerm && (
                          <div className="max-h-56 overflow-y-auto border border-gray-300 rounded-xl bg-white">
                            {users
                              .filter(user => 
                                user.firstName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                                user.lastName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                                user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
                              )
                              .map(user => (
                                <label key={user.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-0">
                                  <input
                                    type="checkbox"
                                    value={user.id}
                                    checked={editSelectedUsers.includes(user.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setEditSelectedUsers([...editSelectedUsers, user.id]);
                                      } else {
                                        setEditSelectedUsers(editSelectedUsers.filter(id => id !== user.id));
                                      }
                                    }}
                                    className="w-5 h-5 text-purple-600 rounded"
                                  />
                                  <div className="flex-1">
                                    <div className="text-base font-medium text-gray-900">
                                      {user.firstName} {user.lastName}
                                    </div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                  </div>
                                </label>
                              ))}
                          </div>
                        )}
                      </div>
                      {/* Edit Groups */}
                      <div>
                        <label className="block text-base font-semibold text-gray-700 mb-4">Grup Ata</label>
                        <input
                          type="text"
                          placeholder="Grup ara..."
                          value={groupSearchTerm}
                          onChange={(e) => setGroupSearchTerm(e.target.value)}
                          className="w-full px-5 py-4 bg-white border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-base mb-4"
                        />
                        {groupSearchTerm && (
                          <div className="max-h-56 overflow-y-auto border border-gray-300 rounded-xl bg-white">
                            {groups
                              .filter(group => 
                                group.name?.toLowerCase().includes(groupSearchTerm.toLowerCase())
                              )
                              .map(group => (
                                <label key={group.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-0">
                                  <input
                                    type="checkbox"
                                    value={group.id}
                                    checked={editSelectedGroups.includes(group.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setEditSelectedGroups([...editSelectedGroups, group.id]);
                                      } else {
                                        setEditSelectedGroups(editSelectedGroups.filter(id => id !== group.id));
                                      }
                                    }}
                                    className="w-5 h-5 text-purple-600 rounded"
                                  />
                                  <div className="text-base font-medium text-gray-900">{group.name}</div>
                                </label>
                              ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={saveAssignments}
                        className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors text-base"
                      >
                        <Save className="w-5 h-5" />
                        Kaydet
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedTask.assignedUsers && selectedTask.assignedUsers.length > 0 ? (
                        <div className="space-y-2">
                          <div className="text-sm font-semibold text-gray-600 mb-2">Kişiler:</div>
                          {selectedTask.assignedUsers.map(user => (
                            <div key={user.id} className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-gray-200">
                              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-purple-600" />
                              </div>
                              <div className="text-base font-semibold text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-base text-gray-500 italic">{selectedTask.assignedTo || 'Atanmamış'}</div>
                      )}
                      {selectedTask.assignedGroups && selectedTask.assignedGroups.length > 0 && (
                        <div className="space-y-2 mt-4">
                          <div className="text-sm font-semibold text-gray-600 mb-2">Gruplar:</div>
                          <div className="flex flex-wrap gap-2">
                            {selectedTask.assignedGroups.map(group => (
                              <span key={group.id} className="px-4 py-2 bg-white rounded-lg border border-gray-200 text-base font-medium text-gray-900">
                                {group.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Status Update Buttons */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">{t('tasks.updateStatus')}</label>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => updateTaskStatus('TODO')}
                      className={`px-6 py-3 rounded-xl font-bold transition-all ${
                        selectedTask.status === 'TODO' 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
                      }`}
                    >
                      {t('status.todo')}
                    </button>
                    <button
                      onClick={() => updateTaskStatus('IN_PROGRESS')}
                      className={`px-6 py-3 rounded-xl font-bold transition-all ${
                        selectedTask.status === 'IN_PROGRESS' 
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25' 
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300'
                      }`}
                    >
                      {t('status.inProgress')}
                    </button>
                    <button
                      onClick={() => updateTaskStatus('DONE')}
                      className={`px-6 py-3 rounded-xl font-bold transition-all ${
                        selectedTask.status === 'DONE' 
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25' 
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300'
                      }`}
                    >
                      {t('status.done')}
                    </button>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">{t('tasks.notes')}</label>
                  <textarea
                    value={taskNotes}
                    onChange={(e) => setTaskNotes(e.target.value)}
                    placeholder={t('tasks.notesPlaceholder')}
                    className="w-full h-40 px-5 py-4 bg-white border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-base"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4">
                  {selectedTask.status !== 'DONE' && (
                    <button
                      onClick={completeTask}
                      className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5 text-lg"
                    >
                      <CheckCircle className="w-7 h-7" />
                      {t('tasks.markAsCompleted')}
                    </button>
                  )}

                  {selectedTask.status === 'DONE' && (
                    <div className="flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-2xl">
                      <CheckCircle className="w-7 h-7 text-emerald-500" />
                      <span className="text-emerald-700 font-bold text-lg">{t('tasks.completed')}</span>
                    </div>
                  )}

                  <button
                    onClick={saveTaskNotes}
                    className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-0.5 text-lg"
                  >
                    <Save className="w-7 h-7" />
                    {t('tasks.saveNotes')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
