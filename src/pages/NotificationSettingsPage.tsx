
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Bell, Mail, Smartphone, Monitor } from 'lucide-react';

interface NotificationPreference {
  id: string;
  type_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  notification_types: {
    name: string;
    description: string;
  };
}

const NotificationSettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select(`
          *,
          notification_types (
            name,
            description
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      setPreferences(data || []);
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل إعدادات الإشعارات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (preferenceId: string, field: string, value: boolean) => {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', preferenceId);

      if (error) throw error;

      setPreferences(prev =>
        prev.map(pref =>
          pref.id === preferenceId ? { ...pref, [field]: value } : pref
        )
      );

      toast({
        title: 'تم الحفظ',
        description: 'تم تحديث إعدادات الإشعارات بنجاح'
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث الإعدادات',
        variant: 'destructive'
      });
    }
  };

  const createDefaultPreferences = async () => {
    setSaving(true);
    try {
      const { data: types, error: typesError } = await supabase
        .from('notification_types')
        .select('id, name, description');

      if (typesError) throw typesError;

      const defaultPreferences = types.map(type => ({
        user_id: user?.id,
        type_id: type.id,
        email_enabled: true,
        push_enabled: true,
        in_app_enabled: true
      }));

      const { error } = await supabase
        .from('notification_preferences')
        .insert(defaultPreferences);

      if (error) throw error;

      await loadPreferences();
      toast({
        title: 'تم الإنشاء',
        description: 'تم إنشاء إعدادات الإشعارات الافتراضية'
      });
    } catch (error) {
      console.error('Error creating preferences:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إنشاء الإعدادات',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">إعدادات الإشعارات</h1>
          <p className="text-gray-600 dark:text-gray-400">تحكم في كيفية تلقي الإشعارات والتنبيهات</p>
        </div>

        {preferences.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">لم يتم إعداد تفضيلات الإشعارات بعد</h3>
              <p className="text-gray-500 mb-4">انقر على الزر أدناه لإنشاء إعدادات الإشعارات الافتراضية</p>
              <Button onClick={createDefaultPreferences} disabled={saving}>
                {saving ? 'جاري الإنشاء...' : 'إنشاء الإعدادات الافتراضية'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {preferences.map((preference) => (
              <Card key={preference.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    {preference.notification_types.description}
                  </CardTitle>
                  <CardDescription>
                    تحكم في طريقة استلام إشعارات {preference.notification_types.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">البريد الإلكتروني</p>
                          <p className="text-sm text-gray-500">إشعارات عبر الإيميل</p>
                        </div>
                      </div>
                      <Switch
                        checked={preference.email_enabled}
                        onCheckedChange={(checked) =>
                          updatePreference(preference.id, 'email_enabled', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">إشعارات الدفع</p>
                          <p className="text-sm text-gray-500">إشعارات الهاتف</p>
                        </div>
                      </div>
                      <Switch
                        checked={preference.push_enabled}
                        onCheckedChange={(checked) =>
                          updatePreference(preference.id, 'push_enabled', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium">داخل التطبيق</p>
                          <p className="text-sm text-gray-500">إشعارات في الموقع</p>
                        </div>
                      </div>
                      <Switch
                        checked={preference.in_app_enabled}
                        onCheckedChange={(checked) =>
                          updatePreference(preference.id, 'in_app_enabled', checked)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
