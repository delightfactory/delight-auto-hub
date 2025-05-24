
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/services/notificationService';
import NotificationIcon from './NotificationIcon';

interface NotificationItemProps {
  notification: Notification;
  onClose?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClose
}) => {
  const { markAsRead, deleteNotification } = useNotifications();

  const handleClick = async () => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    onClose?.();
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(notification.id);
  };

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: ar
  });

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5: return 'bg-red-500';
      case 4: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 2: return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
        !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <NotificationIcon
            type={notification.notification_types}
            isRead={notification.is_read}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
              {notification.title}
            </h4>
            <div className="flex items-center gap-1">
              {notification.priority > 1 && (
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="p-1 h-6 w-6 hover:bg-red-100 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-3 w-3 text-red-500" />
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {timeAgo}
            </span>
            {!notification.is_read && (
              <Badge variant="secondary" className="text-xs">
                جديد
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
