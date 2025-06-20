import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { notificationService, Notification, BroadcastNotification } from '@/services/notificationService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // جلب الإشعارات
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [userNotifications, broadcastNotifications, count] = await Promise.all([
        notificationService.getUserNotifications(user.id),
        notificationService.getBroadcastNotifications(user.role || 'customer'),
        notificationService.getUnreadCount(user.id)
      ]);

      setNotifications(userNotifications);
      setBroadcasts(broadcastNotifications);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // تحديد إشعار كمقروء
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // تحديد جميع الإشعارات كمقروءة
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // حذف إشعار
  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // تحديث العداد إذا كان الإشعار غير مقروء
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // الاستماع للإشعارات الجديدة
  useEffect(() => {
    if (!user) return;

    // قناة إشعارات المستخدم
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          fetchNotifications();
          toast({ title: payload.new.title, description: payload.new.message, variant: 'info' });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => fetchNotifications()
      )
      .subscribe();

    // قناة إشعارات البث
    const broadcastChannel = supabase
      .channel('broadcast-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'broadcast_notifications', filter: `target_role=eq.${user.role}` },
        (payload) => {
          fetchNotifications();
          toast({ title: payload.new.title, description: payload.new.message, variant: 'info' });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(broadcastChannel);
    };
  }, [user, toast, fetchNotifications]);

  // جلب الإشعارات عند تحميل المكون
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    broadcasts,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: fetchNotifications
  };
};
