import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { getCustomerOrders } from '@/services/orderService';
import { useToast } from "@/hooks/use-toast";

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
  city: string;
  location_coordinates: { lat: number; lng: number } | null;
  preferences: Preferences;
}

const ProfilePage = () => {
  const { user, loading, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    location_coordinates: null,
    preferences: {
      notifications: true,
      marketing: false,
      theme: 'system',
      language: 'ar'
    }
  });
  
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
        city: user.city || '',
        location_coordinates: user.location_coordinates || null,
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
  
  const fetchOrders = async () => {
    if (!user) return;
    
    setLoadingOrders(true);
    try {
      const { orders } = await getCustomerOrders(user.email);
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

  const handleLocationSelected = (location: { lat: number; lng: number } | null) => {
    setFormData(prev => ({
      ...prev,
      location_coordinates: location
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
        location_coordinates: formData.location_coordinates,
        preferences: formData.preferences
      });
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: "تم تحديث الملف الشخصي",
        description: "تم حفظ التغييرات بنجاح",
      });

      // Close location picker after successful update
      if (showLocationPicker) {
        setShowLocationPicker(false);
      }
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">حسابي</h1>
          <p className="text-gray-600 dark:text-gray-400">إدارة حسابك الشخصي ومتابعة طلباتك وتفضيلاتك</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile sidebar */}
          <div className="lg:col-span-1">
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
          
          {/* Main content area */}
          <div className="lg:col-span-3">
            <TabsContent value="profile" className="mt-0">
              <ProfileTab 
                formData={formData}
                handleInputChange={handleInputChange}
                handleLocationSelected={handleLocationSelected}
                handleSubmit={handleSubmit}
                isUpdating={isUpdating}
                showLocationPicker={showLocationPicker}
                setShowLocationPicker={setShowLocationPicker}
              />
            </TabsContent>
            
            {/* Orders Tab */}
            <TabsContent value="orders" className="mt-0">
              <OrdersTab orders={orders} loadingOrders={loadingOrders} refreshOrders={fetchOrders} />
            </TabsContent>
            
            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-0">
              <PreferencesTab 
                preferences={formData.preferences}
                handlePreferenceChange={handlePreferenceChange}
                handleSubmit={handleSubmit}
                isUpdating={isUpdating}
              />
            </TabsContent>
            
            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-0">
              <SettingsTab 
                preferences={formData.preferences}
                handlePreferenceChange={handlePreferenceChange}
                handleSubmit={handleSubmit}
                isUpdating={isUpdating}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
