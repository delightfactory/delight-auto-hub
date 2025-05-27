
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, Smartphone, Monitor, ArrowLeft, Info, Settings, AlertCircle, CheckCircle, Tag, Clock } from 'lucide-react';

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
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-4 border-gray-200 border-t-purple-600 dark:border-gray-700 dark:border-t-purple-500"
        />
        <span className="sr-only">جاري التحميل...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/profile" className="mr-4">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                <ArrowLeft className="h-5 w-5 ml-1" />
                <span>العودة للملف الشخصي</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إعدادات الإشعارات المتقدمة</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">تحكم بشكل دقيق في كيفية استلام الإشعارات من مختلف الأقسام</p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/30 flex items-center gap-1">
              <Settings className="h-3 w-3" />
              <span>إعدادات متقدمة</span>
            </Badge>
          </div>
        </div>

        {/* Main content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-full">
                <Bell className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">إعدادات الإشعارات المتقدمة</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">تخصيص طريقة استلام الإشعارات لكل نوع من أنواع الإشعارات</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {preferences.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-16 px-4"
              >
                <div className="bg-purple-50 dark:bg-purple-900/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bell className="h-10 w-10 text-purple-500 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">لم يتم إعداد تفضيلات الإشعارات بعد</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">يمكنك إنشاء إعدادات الإشعارات الافتراضية لتبدأ في تخصيص طريقة استلام الإشعارات</p>
                <Button 
                  onClick={createDefaultPreferences} 
                  disabled={saving}
                  className="bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                      <span>جاري الإنشاء...</span>
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4" />
                      <span>إنشاء الإعدادات الافتراضية</span>
                    </>
                  )}
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">أنواع الإشعارات</h3>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/30">
                    {preferences.length} نوع
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {preferences.map((preference, index) => (
                    <motion.div
                      key={preference.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300 overflow-hidden">
                        <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-2">
                            <div className="bg-purple-100 dark:bg-purple-900/20 p-1.5 rounded-md">
                              <Bell className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{preference.notification_types.description}</CardTitle>
                              <CardDescription className="text-xs">
                                تحكم في طريقة استلام إشعارات {preference.notification_types.name}
                              </CardDescription>
                            </div>
                            <Badge className="mr-auto text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                              <Clock className="h-3 w-3 ml-1" />
                              <span className="text-[10px]">تم التحديث {new Date().toLocaleDateString('ar-EG')}</span>
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800/30 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="bg-blue-100 dark:bg-blue-900/20 p-1.5 rounded-full">
                                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">البريد الإلكتروني</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">إشعارات عبر الإيميل</p>
                                </div>
                              </div>
                              <Switch
                                checked={preference.email_enabled}
                                onCheckedChange={(checked) =>
                                  updatePreference(preference.id, 'email_enabled', checked)
                                }
                                className="data-[state=checked]:bg-purple-600"
                              />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-800/30 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="bg-green-100 dark:bg-green-900/20 p-1.5 rounded-full">
                                  <Smartphone className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">إشعارات الدفع</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">إشعارات الهاتف</p>
                                </div>
                              </div>
                              <Switch
                                checked={preference.push_enabled}
                                onCheckedChange={(checked) =>
                                  updatePreference(preference.id, 'push_enabled', checked)
                                }
                                className="data-[state=checked]:bg-purple-600"
                              />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-800/30 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="bg-purple-100 dark:bg-purple-900/20 p-1.5 rounded-full">
                                  <Monitor className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">داخل التطبيق</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">إشعارات في الموقع</p>
                                </div>
                              </div>
                              <Switch
                                checked={preference.in_app_enabled}
                                onCheckedChange={(checked) =>
                                  updatePreference(preference.id, 'in_app_enabled', checked)
                                }
                                className="data-[state=checked]:bg-purple-600"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Info className="h-3.5 w-3.5 ml-1" />
                    <span>يتم حفظ التغييرات تلقائياً</span>
                  </div>
                  
                  <Link to="/profile">
                    <Button variant="outline" size="sm" className="text-sm">
                      <ArrowLeft className="h-4 w-4 ml-1" />
                      <span>العودة للملف الشخصي</span>
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotificationSettingsPage;
