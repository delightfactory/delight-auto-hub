
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  user_id: string;
  type_id: string;
  title: string;
  message: string;
  data: any;
  read_at: string | null;
  is_read: boolean;
  priority: number;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  notification_types: {
    name: string;
    icon: string;
    color: string;
  };
}

export interface NotificationType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface BroadcastNotification {
  id: string;
  type_id: string;
  title: string;
  message: string;
  data: any;
  target_role: string;
  is_active: boolean;
  priority: number;
  expires_at: string | null;
  created_at: string;
  notification_types: {
    name: string;
    icon: string;
    color: string;
  };
}

export const notificationService = {
  // جلب إشعارات المستخدم
  async getUserNotifications(userId: string, limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        notification_types (
          name,
          icon,
          color
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data as Notification[];
  },

  // جلب الإشعارات العامة
  async getBroadcastNotifications(userRole: string = 'customer') {
    const { data, error } = await supabase
      .from('broadcast_notifications')
      .select(`
        *,
        notification_types (
          name,
          icon,
          color
        )
      `)
      .eq('is_active', true)
      .in('target_role', [userRole, 'all'])
      .gt('expires_at', new Date().toISOString())
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as BroadcastNotification[];
  },

  // تحديد إشعار كمقروء
  async markAsRead(notificationId: string) {
    const { error } = await supabase.rpc('mark_notification_as_read', {
      p_notification_id: notificationId
    });

    if (error) throw error;
    return true;
  },

  // تحديد جميع الإشعارات كمقروءة
  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return true;
  },

  // حساب عدد الإشعارات غير المقروءة
  async getUnreadCount(userId?: string) {
    const { data, error } = await supabase.rpc('get_unread_notifications_count', {
      p_user_id: userId || null
    });

    if (error) throw error;
    return data as number;
  },

  // إرسال إشعار (للأدمن)
  async sendNotification(
    userId: string,
    typeName: string,
    title: string,
    message: string,
    data: any = {},
    priority: number = 1
  ) {
    const { data, error } = await supabase.rpc('send_notification', {
      p_user_id: userId,
      p_type_name: typeName,
      p_title: title,
      p_message: message,
      p_data: data,
      p_priority: priority
    });

    if (error) throw error;
    return data;
  },

  // إرسال إشعار عام (للأدمن)
  async sendBroadcastNotification(
    typeName: string,
    title: string,
    message: string,
    targetRole: string = 'customer',
    data: any = {},
    priority: number = 1,
    expiresAt?: string
  ) {
    const { data, error } = await supabase.rpc('send_broadcast_notification', {
      p_type_name: typeName,
      p_title: title,
      p_message: message,
      p_target_role: targetRole,
      p_data: data,
      p_priority: priority,
      p_expires_at: expiresAt || null
    });

    if (error) throw error;
    return data;
  },

  // جلب أنواع الإشعارات
  async getNotificationTypes() {
    const { data, error } = await supabase
      .from('notification_types')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as NotificationType[];
  },

  // حذف إشعار
  async deleteNotification(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
    return true;
  }
};
