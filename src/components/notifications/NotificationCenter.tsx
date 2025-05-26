import React, { useState } from 'react';
import { Bell, X, Check, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationItem from './NotificationItem';
import BroadcastNotificationItem from './BroadcastNotificationItem';

const NotificationCenter: React.FC = () => {
  const {
    notifications,
    broadcasts,
    unreadCount,
    loading,
    markAllAsRead,
    refreshNotifications
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const allNotifications = [
    ...broadcasts.map(b => ({ ...b, type: 'broadcast' as const })),
    ...notifications.map(n => ({ ...n, type: 'user' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="p-2 relative hover:bg-gray-100 dark:hover:bg-gray-800">
          <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">الإشعارات</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                <Check className="h-4 w-4 ml-1" />
                تحديد الكل كمقروء
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-96">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : allNotifications.length > 0 ? (
            <div className="p-2">
              {allNotifications.map((notification, index) => (
                <div key={`${notification.type}-${notification.id}`}>
                  {notification.type === 'broadcast' ? (
                    <BroadcastNotificationItem
                      notification={notification}
                      onClose={() => setIsOpen(false)}
                    />
                  ) : (
                    <NotificationItem
                      notification={notification}
                      onClose={() => setIsOpen(false)}
                    />
                  )}
                  {index < allNotifications.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                لا توجد إشعارات جديدة
              </p>
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshNotifications}
            className="w-full justify-start"
          >
            <Settings className="h-4 w-4 ml-2" />
            تحديث الإشعارات
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
