
import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Eye, Trash2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface NotificationHistory {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  priority: number;
  created_at: string;
  user: {
    name: string;
    email: string;
  } | null;
  notification_types: {
    name: string;
    description: string;
    color: string;
  };
}

const NotificationsList: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          title,
          message,
          is_read,
          priority,
          created_at,
          customers!user_id (
            name,
            email
          ),
          notification_types (
            name,
            description,
            color
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      const formattedData = data?.map(item => ({
        ...item,
        user: item.customers ? {
          name: item.customers.name,
          email: item.customers.email
        } : null
      })) || [];
      
      setNotifications(formattedData);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getPriorityLabel = (priority: number) => {
    const labels = {
      1: { label: 'منخفضة', color: 'bg-gray-500' },
      2: { label: 'عادية', color: 'bg-blue-500' },
      3: { label: 'متوسطة', color: 'bg-yellow-500' },
      4: { label: 'عالية', color: 'bg-orange-500' },
      5: { label: 'عاجلة', color: 'bg-red-500' }
    };
    return labels[priority as keyof typeof labels] || labels[1];
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || notification.notification_types.name === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'read' && notification.is_read) ||
                         (filterStatus === 'unread' && !notification.is_read);

    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="البحث في الإشعارات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="read">مقروءة</SelectItem>
            <SelectItem value="unread">غير مقروءة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => {
            const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true,
              locale: ar
            });
            const priority = getPriorityLabel(notification.priority);

            return (
              <Card key={notification.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {notification.title}
                      </h3>
                      <Badge
                        variant={notification.is_read ? 'secondary' : 'default'}
                        className="text-xs"
                      >
                        {notification.is_read ? 'مقروء' : 'غير مقروء'}
                      </Badge>
                      <div className={`w-2 h-2 rounded-full ${priority.color}`} />
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>إلى: {notification.user?.name || 'غير محدد'}</span>
                      <span>النوع: {notification.notification_types.description}</span>
                      <span>{timeAgo}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد إشعارات تطابق المعايير المحددة</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsList;
