'use client';

import { useEffect, useState } from 'react';
import useSocketStore from '@/stores/socketStore';

export default function NotificationBell() {
  const { 
    notifications, 
    unreadCount, 
    isConnected, 
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    requestNotificationPermission
  } = useSocketStore();
  
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notification) => {
    // Request permission only when user clicks (user gesture required)
    requestNotificationPermission();
    markNotificationAsRead(notification.id);
    console.log('Notification clicked:', notification);
  };

  const getNotificationIcon = (type) => {
    const icons = {
      TASK_CREATED: '📋',
      TASK_UPDATED: '✏️',
      TASK_COMPLETED: '✅',
      MEETING_INVITATION: '📅',
      MEETING_REMINDER: '⏰',
      MEETING_STARTED: '🎥',
      DOCUMENT_SHARED: '📄',
      COMMENT_ADDED: '💬',
      USER_JOINED: '👤',
      USER_LEFT: '🚪',
      SYSTEM: '🔔'
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (type) => {
    const colors = {
      TASK_CREATED: 'bg-blue-100 text-blue-800',
      TASK_UPDATED: 'bg-yellow-100 text-yellow-800',
      TASK_COMPLETED: 'bg-green-100 text-green-800',
      MEETING_INVITATION: 'bg-purple-100 text-purple-800',
      MEETING_REMINDER: 'bg-orange-100 text-orange-800',
      MEETING_STARTED: 'bg-red-100 text-red-800',
      DOCUMENT_SHARED: 'bg-gray-100 text-gray-800',
      COMMENT_ADDED: 'bg-cyan-100 text-cyan-800',
      USER_JOINED: 'bg-green-100 text-green-800',
      USER_LEFT: 'bg-gray-100 text-gray-800',
      SYSTEM: 'bg-blue-100 text-blue-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Connection Status */}
        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800 ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`}></span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isConnected ? '🟢 Real-time' : '🔴 Disconnected'}
              </p>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs mt-1">Notifications will appear here when you receive them</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{notification.message}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
