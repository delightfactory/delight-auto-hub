
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'react-router-dom';

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
  const { user, resetPassword, updatePassword } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // تحقق مما إذا كان المستخدم قد وصل من رابط إعادة تعيين كلمة المرور
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('reset') === 'true') {
      setShowResetForm(true);
    }
  }, [location]);
  
  useEffect(() => {
    if (user) {
      setEmail(user.email);
    }
  }, [user]);
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    
    try {
      await resetPassword(email);
    } finally {
      setIsResetting(false);
    }
  };
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من تطابق كلمات المرور
    if (password !== confirmPassword) {
      setPasswordError('كلمات المرور غير متطابقة');
      return;
    }
    
    // التحقق من طول كلمة المرور
    if (password.length < 6) {
      setPasswordError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
      return;
    }
    
    setPasswordError('');
    setIsUpdatingPassword(true);
    
    try {
      await updatePassword(password);
      // إعادة تعيين الحقول بعد التحديث الناجح
      setPassword('');
      setConfirmPassword('');
      setShowResetForm(false);
    } finally {
      setIsUpdatingPassword(false);
    }
  };
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
            
            <div>
              <h3 className="text-lg font-medium mb-3">كلمة المرور</h3>
              <Card className="border-gray-200 dark:border-gray-700 p-4">
                {showResetForm ? (
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium mb-1">كلمة المرور الجديدة</label>
                      <Input 
                        id="password" 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="أدخل كلمة المرور الجديدة"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">تأكيد كلمة المرور</label>
                      <Input 
                        id="confirmPassword" 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        placeholder="أدخل كلمة المرور مرة أخرى"
                        className="w-full"
                      />
                    </div>
                    {passwordError && (
                      <p className="text-red-500 text-sm">{passwordError}</p>
                    )}
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        disabled={isUpdatingPassword}
                        size="sm"
                      >
                        {isUpdatingPassword ? (
                          <>
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-1"></span>
                            <span>جاري التحديث...</span>
                          </>
                        ) : (
                          <span>تحديث كلمة المرور</span>
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">يمكنك إعادة تعيين كلمة المرور الخاصة بك عن طريق إرسال رابط إعادة تعيين إلى بريدك الإلكتروني.</p>
                    <form onSubmit={handleResetPassword} className="flex flex-col space-y-3">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          placeholder="أدخل بريدك الإلكتروني"
                          className="w-full"
                          disabled={!!user}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          variant="outline" 
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                          disabled={isResetting}
                          size="sm"
                        >
                          {isResetting ? (
                            <>
                              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-1"></span>
                              <span>جاري الإرسال...</span>
                            </>
                          ) : (
                            <span>إرسال رابط إعادة تعيين كلمة المرور</span>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </Card>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="mt-4 flex justify-end"
            >
              <Button 
                className="bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 rounded-md shadow-sm hover:shadow text-sm py-1 px-3 flex items-center gap-1.5"
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
                    <span className="text-xs">حفظ الإعدادات</span>
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SettingsTab;
