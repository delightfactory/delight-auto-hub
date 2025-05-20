
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ThemeOption = 'light' | 'dark' | 'system';
type LanguageOption = 'ar' | 'en';

interface Preferences {
  notifications?: boolean;
  marketing?: boolean;
  theme?: ThemeOption;
  language?: LanguageOption;
}

interface SettingsTabProps {
  preferences: Preferences;
  handlePreferenceChange: (key: keyof Preferences, value: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isUpdating: boolean;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ 
  preferences, 
  handlePreferenceChange, 
  handleSubmit,
  isUpdating 
}) => {
  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>إعدادات الحساب</CardTitle>
          <CardDescription>تخصيص إعدادات الحساب والتفضيلات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">المظهر</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'light', label: 'فاتح' },
                  { id: 'dark', label: 'داكن' },
                  { id: 'system', label: 'تلقائي' }
                ].map(theme => (
                  <div 
                    key={theme.id}
                    className={`border rounded-lg p-3 cursor-pointer hover:border-red-500 transition-colors ${
                      preferences.theme === theme.id ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => handlePreferenceChange('theme', theme.id)}
                  >
                    <div className={`w-full h-12 rounded mb-2 ${
                      theme.id === 'light' ? 'bg-gray-100' : 
                      theme.id === 'dark' ? 'bg-gray-800' : 
                      'bg-gradient-to-r from-gray-100 to-gray-800'
                    }`}></div>
                    <p className="text-center text-sm font-medium">{theme.label}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">اللغة</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'ar', label: 'العربية' },
                  { id: 'en', label: 'English' }
                ].map(lang => (
                  <div 
                    key={lang.id}
                    className={`border rounded-lg p-3 cursor-pointer hover:border-red-500 transition-colors ${
                      preferences.language === lang.id ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => handlePreferenceChange('language', lang.id)}
                  >
                    <p className="text-center text-sm font-medium">{lang.label}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <Button 
              className="mt-4 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleSubmit}
              disabled={isUpdating}
            >
              {isUpdating ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SettingsTab;
