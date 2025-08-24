'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ErrorToast } from '@/components/ui/ErrorState';

interface Notification {
  id: string;
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: Notification['type'], message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const addNotification = useCallback((
    type: Notification['type'], 
    message: string, 
    duration = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification: Notification = { id, type, message, duration };
    
    setNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, [removeNotification]);

  const showError = useCallback((message: string) => {
    addNotification('error', message, 8000); // Longer duration for errors
  }, [addNotification]);

  const showSuccess = useCallback((message: string) => {
    addNotification('success', message, 4000);
  }, [addNotification]);

  const showWarning = useCallback((message: string) => {
    addNotification('warning', message, 6000);
  }, [addNotification]);

  const showInfo = useCallback((message: string) => {
    addNotification('info', message, 4000);
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    showError,
    showSuccess,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Render notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => {
          if (notification.type === 'error') {
            return (
              <ErrorToast
                key={notification.id}
                message={notification.message}
                onDismiss={() => removeNotification(notification.id)}
              />
            );
          }
          
          // For other notification types, render a simple toast
          const bgColor = {
            success: 'bg-success text-success-foreground',
            warning: 'bg-warning text-warning-foreground',
            info: 'bg-info text-info-foreground'
          }[notification.type] || 'bg-muted text-muted-foreground';
          
          return (
            <div key={notification.id} className={`rounded-lg p-4 shadow-lg max-w-md ${bgColor}`}>
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium">{notification.message}</p>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="ml-3 opacity-70 hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}