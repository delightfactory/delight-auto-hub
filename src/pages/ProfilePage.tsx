import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { SmoothPageTransition } from '@/components/performance/SmoothPageTransition';
import { Card, CardContent } from "@/components/ui/card";
import { getCustomerOrders } from '@/services/orderService';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { egyptianGovernorates, City } from '@/lib/egyptian-locations';

// Import refactored components
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import ProfileTab from '@/components/profile/ProfileTabs/ProfileTab';
import OrdersTab from '@/components/profile/ProfileTabs/OrdersTab';
import PreferencesTab from '@/components/profile/ProfileTabs/PreferencesTab';
import SettingsTab from '@/components/profile/ProfileTabs/SettingsTab';

// Define preference types compatible with supabase customers table
type ThemeOption = 'light' | 'dark' | 'system';
type LanguageOption = 'ar' | 'en';

interface Preferences {
  notifications?: boolean;
  marketing?: boolean;
  theme?: ThemeOption;
  language?: LanguageOption;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  governorate?: string;
  city: string;
  location_coordinates: { lat: number; lng: number } | null;
  location_description?: string;
  preferences: Preferences;
}

const ProfilePage = () => {
  const { user, loading, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  // إضافة متغير حالة لتتبع ما إذا كانت التبويبات جاهزة للعرض
  const [tabsReady, setTabsReady] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    governorate: '',
    city: '',
    location_coordinates: null,
    location_description: '',
    preferences: {
      notifications: true,
      marketing: false,
      theme: 'system',
      language: 'ar'
    }
  });
  
  const [availableCities, setAvailableCities] = useState<City[]>([]);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);
  
  // Initialize form data from user object
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        governorate: user.governorate || '',
        city: user.city || '',
        location_coordinates: user.location_coordinates || null,
        location_description: user.location_description || '',
        preferences: {
          notifications: user.preferences?.notifications ?? true,
          marketing: user.preferences?.marketing ?? false,
          theme: user.preferences?.theme ?? 'system',
          language: user.preferences?.language ?? 'ar'
        }
      });
      
      setAvatarUrl(user.avatar_url || null);
      
      // Fetch user orders
      fetchOrders();
      
      // Set page as loaded after a small delay for animation
      setTimeout(() => setPageLoaded(true), 300);
    }
  }, [user]);

  // تحديث قائمة المدن عند تغيير المحافظة
  useEffect(() => {
    if (formData.governorate) {
      const selected = egyptianGovernorates.find(g => g.id === formData.governorate);
      setAvailableCities(selected ? selected.cities : []);
      
      // تحقق فقط إذا كانت المدينة غير موجودة في المحافظة المحددة وليست فارغة بالفعل
      if (formData.city && selected && !selected.cities.find(c => c.name_en === formData.city || c.name_ar === formData.city)) {
        // احتفظ بالمدينة الحالية في متغير مؤقت للتحقق لاحقاً
        const currentCity = formData.city;
        
        // تحقق مما إذا كانت المدينة موجودة في قاعدة البيانات
        if (user && user.city === currentCity) {
          // المدينة موجودة في قاعدة البيانات، لا تقم بإعادة تعيينها
          console.log('المدينة موجودة في قاعدة البيانات، لا يتم إعادة تعيينها');
        } else {
          // المدينة غير موجودة في قاعدة البيانات أو المحافظة المحددة، قم بإعادة تعيينها
          setFormData(prev => ({ ...prev, city: '' }));
        }
      }
    } else {
      setAvailableCities([]);
      // لا تقم بإعادة تعيين المدينة إذا كانت موجودة في قاعدة البيانات
      if (!(user && user.city)) {
        setFormData(prev => ({ ...prev, city: '' }));
      }
    }
  }, [formData.governorate, user]);
  
  const fetchOrders = async () => {
    if (!user) return;
    
    setLoadingOrders(true);
    try {
      const { orders } = await getCustomerOrders(user.id);
      setOrders(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "خطأ في تحميل الطلبات",
        description: "لم نتمكن من تحميل سجل طلباتك. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setLoadingOrders(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePreferenceChange = (key: keyof Preferences, value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value as Preferences[typeof key]
      }
    }));
  };

  // معالجات تغيير المحافظة والمدينة
  const handleGovernorateChange = (gov: string) => {
    setFormData(prev => ({ ...prev, governorate: gov }));
  };

  const handleCityChange = (city: string) => {
    setFormData(prev => ({ ...prev, city }));
  };

  // معالجة تغيير الموقع
  const handleLocationChange = (location: { lat: number; lng: number; address?: string }) => {
    setFormData(prev => ({
      ...prev,
      location_coordinates: location.lat !== 0 ? { lat: location.lat, lng: location.lng } : null,
      location_description: location.address || ''
    }));
  };

  // معالجة مسح الموقع
  const handleLocationClear = () => {
    setFormData(prev => ({
      ...prev,
      location_coordinates: null,
      location_description: ''
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const result = await updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        governorate: formData.governorate,
        location_coordinates: formData.location_coordinates,
        location_description: formData.location_description,
        preferences: formData.preferences
      });
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: "تم تحديث الملف الشخصي",
        description: "تم حفظ التغييرات بنجاح",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "خطأ في التحديث",
        description: "لم نتمكن من تحديث ملفك الشخصي. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length) {
      return;
    }
    
    const file = e.target.files[0];
    setUploadingAvatar(true);
    
    try {
      // Create object URL for immediate preview
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);

      // Simulate a successful upload
      setTimeout(async () => {
        // Update the user profile with the new URL
        const result = await updateProfile({
          avatar_url: objectUrl // In a real implementation, this would be the Supabase URL
        });
        
        if (result.error) {
          throw result.error;
        }
        
        toast({
          title: "تم تحديث الصورة الشخصية",
          description: "تم رفع الصورة بنجاح",
        });
        
        setUploadingAvatar(false);
      }, 1500);
      
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "خطأ في رفع الصورة",
        description: "لم نتمكن من تحديث صورتك الشخصية. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
      setUploadingAvatar(false);
    }
  };
  
  const handleLogout = async () => {
    await signOut();
  };
  
  // ربط real-time لتحديث حالة الطلب وإشعار المستخدم
  useEffect(() => {
    if (!user) return;
    // إنشاء قناة للطلبات الخاصة بالمستخدم
    const subscription = supabase
      .channel('order-status')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `customer_id=eq.${user.id}` }, (payload) => {
        const newStatus = payload.new.status;
        const orderId = payload.new.id;
        toast({
          title: 'تحديث حالة الطلب',
          description: `تم تغيير حالة طلبك رقم ${orderId.substring(0, 8)} إلى ${newStatus}`,
          variant: 'info'
        });
        fetchOrders();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);
  
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-red-600"></div>
        <p className="text-gray-500 dark:text-gray-400 animate-pulse">جاري تحميل الملف الشخصي...</p>
      </div>
    );
  }
  
  return (
    <SmoothPageTransition transitionType="fade" duration={0.5}>
      <div className="container mx-auto py-8 px-4 mb-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-l from-red-600 to-red-500 bg-clip-text text-transparent mb-2">حسابي</h1>
            <p className="text-gray-600 dark:text-gray-400">إدارة حسابك الشخصي ومتابعة طلباتك وتفضيلاتك</p>
          </motion.div>
        </div>
        
        <div className="flex flex-col gap-6">
          {/* معلومات المستخدم وزر تسجيل الخروج */}
          <div className="flex justify-between items-center mb-6">
            {/* صورة المستخدم والمعلومات */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow-md">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={user?.name || 'المستخدم'} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 flex items-center justify-center">
                      <span className="text-2xl text-blue-500 dark:text-blue-400">
                        {user?.name?.charAt(0) || 'م'}
                      </span>
                    </div>
                  )}
                </div>
                <label htmlFor="avatar-upload" className="absolute -bottom-1 -left-1 h-6 w-6 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center cursor-pointer shadow-sm transition-all duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarUpload} 
                  className="hidden" 
                  disabled={uploadingAvatar}
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{user?.name || 'مستخدم جديد'}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || ''}</p>
              </div>
            </div>
            
            {/* زر تسجيل الخروج */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-800/30 dark:hover:bg-red-900/10 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-xs">تسجيل الخروج</span>
            </Button>
          </div>
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="flex flex-col gap-6"
            orientation="horizontal"
          >
          {/* تابات أفقية في الأعلى */}
          <motion.div 
            className="w-full"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-center mb-6 overflow-x-auto pb-2 px-1 -mx-1 scrollbar-hide">
              <div className="inline-flex flex-wrap sm:flex-nowrap gap-2 p-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-xl shadow-sm border border-purple-100/50 dark:border-purple-800/10 w-full max-w-full justify-center">
                {[
                  { id: 'profile', label: 'الملف الشخصي', icon: 'user', color: 'purple' },
                  { id: 'orders', label: 'الطلبات', icon: 'shopping-bag', color: 'blue' },
                  { id: 'notifications', label: 'الإشعارات', icon: 'bell', color: 'pink' },
                  { id: 'settings', label: 'الإعدادات', icon: 'settings', color: 'teal' }
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  const getTabColor = () => {
                    switch(tab.color) {
                      case 'purple': return isActive ? 'bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-800/10 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-800/20' : 'hover:bg-purple-50/50 dark:hover:bg-purple-900/10 text-purple-500/70 dark:text-purple-400/70';
                      case 'blue': return isActive ? 'bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-800/10 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800/20' : 'hover:bg-blue-50/50 dark:hover:bg-blue-900/10 text-blue-500/70 dark:text-blue-400/70';
                      case 'pink': return isActive ? 'bg-gradient-to-r from-pink-100 to-pink-50 dark:from-pink-900/20 dark:to-pink-800/10 text-pink-600 dark:text-pink-300 border-pink-200 dark:border-pink-800/20' : 'hover:bg-pink-50/50 dark:hover:bg-pink-900/10 text-pink-500/70 dark:text-pink-400/70';
                      case 'teal': return isActive ? 'bg-gradient-to-r from-teal-100 to-teal-50 dark:from-teal-900/20 dark:to-teal-800/10 text-teal-600 dark:text-teal-300 border-teal-200 dark:border-teal-800/20' : 'hover:bg-teal-50/50 dark:hover:bg-teal-900/10 text-teal-500/70 dark:text-teal-400/70';
                      default: return isActive ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400';
                    }
                  };
                  
                  return (
                    <Button
                      key={tab.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab(tab.id)}
                      className={`rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm transition-all duration-300 flex-grow sm:flex-grow-0 ${isActive ? 'shadow-sm border' : 'border border-transparent'} ${getTabColor()}`}
                    >
                      <span className="flex items-center justify-center sm:justify-start gap-1.5">
                        {tab.icon === 'user' && <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                        {tab.icon === 'shopping-bag' && <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
                        {tab.icon === 'bell' && <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
                        {tab.icon === 'settings' && <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                        <span className="hidden sm:inline">{tab.label}</span>
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </motion.div>
          
          {/* Main content */}
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: pageLoaded ? 1 : 0, x: pageLoaded ? 0 : 30 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="min-h-[500px] transition-all duration-300 hover:shadow-lg border-gray-200 dark:border-gray-800 overflow-hidden">
              <CardContent className="p-6 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-600"></div>
                <TabsContent value="profile" className="m-0 animate-fade-in">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProfileTab 
                      formData={formData}
                      handleInputChange={handleInputChange}
                      onGovernorateChange={handleGovernorateChange}
                      onCityChange={handleCityChange}
                      availableCities={availableCities}
                      handleSubmit={handleSubmit}
                      setFormData={setFormData}
                      isUpdating={isUpdating}
                      egyptianGovernorates={egyptianGovernorates}
                      onLocationChange={handleLocationChange}
                      onLocationClear={handleLocationClear}
                    />
                  </motion.div>
                </TabsContent>
                
                <TabsContent value="orders" className="m-0 animate-fade-in">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <OrdersTab orders={orders} loadingOrders={loadingOrders} refreshOrders={fetchOrders} />
                  </motion.div>
                </TabsContent>
                
                <TabsContent value="notifications" className="m-0 animate-fade-in">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PreferencesTab 
                      preferences={formData.preferences}
                      handlePreferenceChange={handlePreferenceChange}
                      handleSubmit={handleSubmit}
                      isUpdating={isUpdating}
                    />
                  </motion.div>
                </TabsContent>
                
                <TabsContent value="settings" className="m-0 animate-fade-in">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SettingsTab 
                      preferences={formData.preferences}
                      handlePreferenceChange={handlePreferenceChange}
                      handleSubmit={handleSubmit}
                      isUpdating={isUpdating}
                    />
                  </motion.div>
                </TabsContent>
              </CardContent>
            </Card>
          </motion.div>
        </Tabs>
        </div>
        </div>
      </div>
    </SmoothPageTransition>
  );
};

export default ProfilePage;
