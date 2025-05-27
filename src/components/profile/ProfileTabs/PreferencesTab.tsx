
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, Tag, ShoppingBag, Truck, Star, AlertCircle, Info, Settings, ExternalLink } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type ThemeOption = 'light' | 'dark' | 'system';
type LanguageOption = 'ar' | 'en';

interface Preferences {
  notifications?: boolean;
  marketing?: boolean;
  theme?: ThemeOption;
  language?: LanguageOption;
  order_updates?: boolean;
  promotional?: boolean;
  security?: boolean;
  newsletter?: boolean;
}

interface PreferencesTabProps {
  preferences: Preferences;
  handlePreferenceChange: (key: keyof Preferences, value: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isUpdating: boolean;
}

const PreferencesTab: React.FC<PreferencesTabProps> = ({ 
  preferences, 
  handlePreferenceChange, 
  handleSubmit,
  isUpdating 
}) => {
  // تهيئة القيم الافتراضية للإشعارات الجديدة
  const prefs = {
    notifications: preferences.notifications ?? true,
    marketing: preferences.marketing ?? false,
    order_updates: preferences.order_updates ?? true,
    promotional: preferences.promotional ?? false,
    security: preferences.security ?? true,
    newsletter: preferences.newsletter ?? false
  };

  return (
    <motion.div
      key="notifications"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-4 flex items-center">
        <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg ml-3">
          <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">إعدادات الإشعارات</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">تحكم في كيفية تلقي الإشعارات والتنبيهات</p>
        </div>
      </div>

      <Card className="border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
        <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400 ml-2" />
            <CardTitle className="text-lg">إعدادات الإشعارات</CardTitle>
          </div>
          <CardDescription>تحكم في كيفية تلقي الإشعارات والتنبيهات</CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="space-y-5">
            <div>
              <div className="flex items-center mb-3">
                <ShoppingBag className="h-4 w-4 text-purple-500 ml-2" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">إشعارات الطلبات</h3>
                <Badge variant="outline" className="mr-auto text-xs bg-purple-50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/30">
                  موصى به
                </Badge>
              </div>

              <div className="space-y-3 bg-gray-50/50 dark:bg-gray-800/20 p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">تحديثات الطلبات</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">إشعارات عند تغيير حالة طلباتك</p>
                  </div>
                  <Switch 
                    checked={prefs.order_updates}
                    onCheckedChange={(checked) => handlePreferenceChange('order_updates', checked)}
                    className="data-[state=checked]:bg-purple-600"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">إشعارات عامة</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">إشعارات حول نشاط حسابك</p>
                  </div>
                  <Switch 
                    checked={prefs.notifications}
                    onCheckedChange={(checked) => handlePreferenceChange('notifications', checked)}
                    className="data-[state=checked]:bg-purple-600"
                  />
                </div>
              </div>
            </div>

            <Separator className="my-3" />
            
            <div>
              <div className="flex items-center mb-3">
                <Tag className="h-4 w-4 text-green-500 ml-2" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">العروض والتسويق</h3>
              </div>

              <div className="space-y-3 bg-gray-50/50 dark:bg-gray-800/20 p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">العروض والتخفيضات</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">إشعارات بالعروض والتخفيضات الجديدة</p>
                  </div>
                  <Switch 
                    checked={prefs.marketing}
                    onCheckedChange={(checked) => handlePreferenceChange('marketing', checked)}
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">النشرة الإخبارية</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">آخر الأخبار والمنتجات الجديدة</p>
                  </div>
                  <Switch 
                    checked={prefs.newsletter}
                    onCheckedChange={(checked) => handlePreferenceChange('newsletter', checked)}
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>
              </div>
            </div>

            <Separator className="my-3" />

            <div>
              <div className="flex items-center mb-3">
                <AlertCircle className="h-4 w-4 text-blue-500 ml-2" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">الأمان والحماية</h3>
                <Badge variant="outline" className="mr-auto text-xs bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/30">
                  مهم
                </Badge>
              </div>

              <div className="space-y-3 bg-gray-50/50 dark:bg-gray-800/20 p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">تنبيهات الأمان</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">إشعارات حول تسجيل الدخول وتغييرات الحساب</p>
                  </div>
                  <Switch 
                    checked={prefs.security}
                    onCheckedChange={(checked) => handlePreferenceChange('security', checked)}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between border-t border-gray-100 dark:border-gray-800 pt-4 pb-3 gap-3">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Info className="h-3 w-3 ml-1" />
            <span>يمكنك تغيير هذه الإعدادات في أي وقت</span>
          </div>

          <div className="flex items-center gap-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Button 
                className="bg-purple-500 hover:bg-purple-600 text-white transition-all duration-200 rounded-md shadow-sm hover:shadow text-sm py-1 px-3 flex items-center gap-1.5"
                onClick={handleSubmit}
                disabled={isUpdating}
                size="sm"
              >
                {isUpdating ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    <span className="text-xs">جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs">حفظ التفضيلات</span>
                  </>
                )}
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Link to="/settings/notifications">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-purple-200 dark:border-purple-800/30 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 text-xs py-1 px-3 flex items-center gap-1.5"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>إعدادات متقدمة</span>
                  <ExternalLink className="h-3 w-3 mr-1" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default PreferencesTab;
