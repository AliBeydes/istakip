'use client';

import { useState } from 'react';
import { useTaskStore } from '@/stores/taskStore';

export default function TaskDetailModal({ task, isOpen, onClose, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'TODO',
    priority: task?.priority || 'MEDIUM',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  });

  if (!isOpen || !task) return null;

  const handleUpdate = async () => {
    const result = await onUpdate(task.id, editData);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      const result = await onDelete(task.id);
      if (result.success) {
        onClose();
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO': return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'IN_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'DONE': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Task Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="DONE">Done</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={editData.priority}
                    onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editData.dueDate}
                  onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{task.title}</h3>
                <div className="flex gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {task.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                  <p className="text-gray-600">{task.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Due Date</h4>
                  <p className="text-gray-600">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Created</h4>
                  <p className="text-gray-600">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {task.assignees && task.assignees.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Assignees</h4>
                  <div className="flex gap-2">
                    {task.assignees.map(assignee => (
                      <div key={assignee.id} className="flex items-center gap-1">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">
                            {assignee.firstName[0]}{assignee.lastName[0]}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {assignee.firstName} {assignee.lastName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {task.tags && task.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        #{tag.tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
