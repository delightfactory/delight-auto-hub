
import React, { useState, useEffect } from 'react';
import { Plus, Send, Users, Bell, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { notificationService, NotificationType } from '@/services/notificationService';
import NotificationForm from './NotificationForm';
import BroadcastForm from './BroadcastForm';
import NotificationsList from './NotificationsList';

const NotificationManagement: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'send' | 'broadcast' | 'history'>('send');
  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([]);
  const [stats, setStats] = useState({
    totalNotifications: 0,
    unreadCount: 0,
    broadcastCount: 0
  });

  useEffect(() => {
    loadNotificationTypes();
    loadStats();
  }, []);

  const loadNotificationTypes = async () => {
    try {
      const types = await notificationService.getNotificationTypes();
      setNotificationTypes(types);
    } catch (error) {
      console.error('Error loading notification types:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل أنواع الإشعارات',
        variant: 'destructive'
      });
    }
  };

  const loadStats = async () => {
    // يمكن إضافة دالة لجلب الإحصائيات من قاعدة البيانات
    setStats({
      totalNotifications: 0,
      unreadCount: 0,
      broadcastCount: 0
    });
  };

  const tabs = [
    { id: 'send', label: 'إرسال إشعار', icon: Send },
    { id: 'broadcast', label: 'إشعار عام', icon: Users },
    { id: 'history', label: 'سجل الإشعارات', icon: Bell }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الإشعارات</p>
                <p className="text-2xl font-bold">{stats.totalNotifications}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">غير مقروءة</p>
                <p className="text-2xl font-bold">{stats.unreadCount}</p>
              </div>
              <Eye className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الإشعارات العامة</p>
                <p className="text-2xl font-bold">{stats.broadcastCount}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>إدارة الإشعارات</CardTitle>
          <CardDescription>
            إرسال وإدارة إشعارات المستخدمين والإعلانات العامة
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Tabs */}
          <div className="flex space-x-1 space-x-reverse mb-6 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-md transition-colors flex-1 justify-center ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {activeTab === 'send' && (
            <NotificationForm
              notificationTypes={notificationTypes}
              onSuccess={() => {
                toast({
                  title: 'تم الإرسال',
                  description: 'تم إرسال الإشعار بنجاح',
                });
                loadStats();
              }}
            />
          )}

          {activeTab === 'broadcast' && (
            <BroadcastForm
              notificationTypes={notificationTypes}
              onSuccess={() => {
                toast({
                  title: 'تم الإرسال',
                  description: 'تم إرسال الإشعار العام بنجاح',
                });
                loadStats();
              }}
            />
          )}

          {activeTab === 'history' && (
            <NotificationsList />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationManagement;
