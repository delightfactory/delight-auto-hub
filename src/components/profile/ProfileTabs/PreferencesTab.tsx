
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

type ThemeOption = 'light' | 'dark' | 'system';
type LanguageOption = 'ar' | 'en';

interface Preferences {
  notifications?: boolean;
  marketing?: boolean;
  theme?: ThemeOption;
  language?: LanguageOption;
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
  return (
    <motion.div
      key="notifications"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>إعدادات الإشعارات</CardTitle>
          <CardDescription>تحكم في كيفية تلقي الإشعارات والتنبيهات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-medium">إشعارات الطلبات</h4>
                <p className="text-sm text-gray-500">تلقي إشعارات عند تغيير حالة طلباتك</p>
              </div>
              <Switch 
                checked={preferences.notifications}
                onCheckedChange={(checked) => handlePreferenceChange('notifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-medium">العروض والتخفيضات</h4>
                <p className="text-sm text-gray-500">تلقي إشعارات بالعروض والتخفيضات الجديدة</p>
              </div>
              <Switch 
                checked={preferences.marketing}
                onCheckedChange={(checked) => handlePreferenceChange('marketing', checked)}
              />
            </div>
            
            <Button 
              className="mt-4 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleSubmit}
              disabled={isUpdating}
            >
              {isUpdating ? 'جاري الحفظ...' : 'حفظ التفضيلات'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PreferencesTab;
