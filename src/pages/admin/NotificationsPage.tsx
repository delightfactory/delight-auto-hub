
import React from 'react';
import { Bell, Settings, Users, Send } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import NotificationManagement from '@/components/admin/notifications/NotificationManagement';

const NotificationsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            إدارة الإشعارات
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            إرسال وإدارة إشعارات المستخدمين والإعلانات العامة
          </p>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Bell className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      {/* Main Content */}
      <NotificationManagement />
    </div>
  );
};

export default NotificationsPage;
