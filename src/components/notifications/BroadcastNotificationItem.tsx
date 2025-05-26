import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Megaphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BroadcastNotification } from '@/services/notificationService';
import NotificationIcon from './NotificationIcon';

interface BroadcastNotificationItemProps {
  notification: BroadcastNotification;
  onClose?: () => void;
  onViewDetail?: (notification: BroadcastNotification) => void;
}

const BroadcastNotificationItem: React.FC<BroadcastNotificationItemProps> = ({
  notification,
  onClose,
  onViewDetail
}) => {
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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'المسؤولين';
      case 'customer': return 'العملاء';
      case 'all': return 'الجميع';
      default: return role;
    }
  };

  return (
    <div
      className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 cursor-pointer"
      onClick={() => { onClose?.(); onViewDetail?.(notification); }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
            <Megaphone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100">
              {notification.title}
            </h4>
            <div className="flex items-center gap-1">
              {notification.priority > 1 && (
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
              )}
              <Badge variant="outline" className="text-xs border-purple-300 text-purple-700 dark:text-purple-300">
                إعلان عام
              </Badge>
            </div>
          </div>
          
          <p className="text-xs text-purple-700 dark:text-purple-300 mt-1 line-clamp-2">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-purple-600 dark:text-purple-400">
              {timeAgo}
            </span>
            <Badge variant="secondary" className="text-xs">
              {getRoleLabel(notification.target_role)}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BroadcastNotificationItem;
