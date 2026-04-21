'use client';

import { useState } from 'react';
import { useDocumentStore } from '@/stores/documentStore';

export default function DocumentDetailModal({ document, isOpen, onClose, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: document?.title || '',
    content: document?.content || '',
    tags: document?.tags?.map(t => t.tag) || []
  });

  if (!isOpen || !document) return null;

  const handleUpdate = async () => {
    const result = await onUpdate(document.id, editData);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this document?')) {
      const result = await onDelete(document.id);
      if (result.success) {
        onClose();
      }
    }
  };

  const addTag = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      setEditData({
        ...editData,
        tags: [...editData.tags, e.target.value.trim()]
      });
      e.target.value = '';
    }
  };

  const removeTag = (tagToRemove) => {
    setEditData({
      ...editData,
      tags: editData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const getDocumentTypeColor = (type) => {
    switch (type) {
      case 'FILE': return 'bg-blue-100 text-blue-800';
      case 'NOTE': return 'bg-green-100 text-green-800';
      case 'MEETING_NOTES': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderContent = (content) => {
    if (!content) return null;
    
    // Simple markdown rendering
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-semibold mt-3 mb-2">{line.substring(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-medium mt-2 mb-1">{line.substring(4)}</h3>;
      } else if (line.startsWith('- ')) {
        return <li key={index} className="ml-4">{line.substring(2)}</li>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return <p key={index} className="mb-2">{line}</p>;
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Document Details</h2>
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
                  Content (Markdown supported)
                </label>
                <textarea
                  value={editData.content}
                  onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono"
                  rows={12}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {editData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                      >
                        #{tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add tag and press Enter"
                    onKeyDown={addTag}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
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
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">
                    {document.type === 'FILE' ? '📎' : document.type === 'NOTE' ? '📝' : '📋'}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900 flex-1">{document.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getDocumentTypeColor(document.type)}`}>
                    {document.type.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {document.content && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Content</h4>
                  <div className="bg-gray-50 p-4 rounded-md text-gray-700">
                    {renderContent(document.content)}
                  </div>
                </div>
              )}

              {document.filePath && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">File Information</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-600">
                      <strong>File Size:</strong> {formatFileSize(document.fileSize)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Type:</strong> {document.mimeType}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Created</h4>
                  <p className="text-gray-600">
                    {new Date(document.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Last Updated</h4>
                  <p className="text-gray-600">
                    {new Date(document.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-1">Created By</h4>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">
                      {document.creator?.firstName[0]}{document.creator?.lastName[0]}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {document.creator?.firstName} {document.creator?.lastName}
                  </span>
                </div>
              </div>

              {document.tags && document.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {document.tags.map((tag, index) => (
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

              {document._count?.tasks > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Related Tasks</h4>
                  <p className="text-sm text-gray-600">
                    This document is linked to {document._count.tasks} task(s)
                  </p>
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
