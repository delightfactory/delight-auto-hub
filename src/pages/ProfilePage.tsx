import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent } from "@/components/ui/tabs";
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
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
    }
  }, [user]);

  // تحديث قائمة المدن عند تغيير المحافظة
  useEffect(() => {
    if (formData.governorate) {
      const selected = egyptianGovernorates.find(g => g.id === formData.governorate);
      setAvailableCities(selected ? selected.cities : []);
      if (selected && !selected.cities.find(c => c.name_en === formData.city)) {
        setFormData(prev => ({ ...prev, city: '' }));
      }
    } else {
      setAvailableCities([]);
      setFormData(prev => ({ ...prev, city: '' }));
    }
  }, [formData.governorate]);
  
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
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4 mb-16">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">حسابي</h1>
          <p className="text-gray-600 dark:text-gray-400">إدارة حسابك الشخصي ومتابعة طلباتك وتفضيلاتك</p>
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="flex flex-col lg:flex-row gap-6"
          orientation="vertical"
        >
          {/* Profile sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <ProfileSidebar 
              user={user} 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              avatarUrl={avatarUrl}
              uploadingAvatar={uploadingAvatar}
              handleAvatarUpload={handleAvatarUpload}
              handleLogout={handleLogout}
            />
          </div>
          
          {/* Main content */}
          <div className="flex-1">
            <Card className="min-h-[500px] transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <TabsContent value="profile" className="m-0 animate-fade-in">
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
                </TabsContent>
                
                <TabsContent value="orders" className="m-0 animate-fade-in">
                  <OrdersTab orders={orders} loadingOrders={loadingOrders} refreshOrders={fetchOrders} />
                </TabsContent>
                
                <TabsContent value="notifications" className="m-0 animate-fade-in">
                  <PreferencesTab 
                    preferences={formData.preferences}
                    handlePreferenceChange={handlePreferenceChange}
                    handleSubmit={handleSubmit}
                    isUpdating={isUpdating}
                  />
                </TabsContent>
                
                <TabsContent value="settings" className="m-0 animate-fade-in">
                  <SettingsTab 
                    preferences={formData.preferences}
                    handlePreferenceChange={handlePreferenceChange}
                    handleSubmit={handleSubmit}
                    isUpdating={isUpdating}
                  />
                </TabsContent>
              </CardContent>
            </Card>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
