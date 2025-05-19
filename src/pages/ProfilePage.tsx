
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Package, 
  Bell, 
  Settings, 
  LogOut, 
  Upload,
  Camera
} from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { IconButton } from '@/components/ui/icon-button';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const { user, loading, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
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
        preferences: user.preferences || {
          notifications: true,
          marketing: false,
          theme: 'system',
          language: 'ar'
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
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setOrders(data || []);
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
  
  const handlePreferenceChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
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
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // TODO: Create a storage bucket named 'avatars' in Supabase
      // For now, we'll just simulate an upload
      
      // Simulate a successful upload
      setTimeout(async () => {
        // In a real implementation, you would upload to Supabase
        // and then update the user profile with the URL
        
        // For now, just create an object URL
        const url = URL.createObjectURL(file);
        setAvatarUrl(url);
        
        // Update the user profile with the new URL
        const result = await updateProfile({
          avatar_url: url // In a real implementation, this would be the Supabase URL
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
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="sticky top-24">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center py-6">
                    <div className="relative group mb-4">
                      <div className={`w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-4 border-white shadow-md ${uploadingAvatar ? 'opacity-50' : ''}`}>
                        {avatarUrl ? (
                          <img 
                            src={avatarUrl} 
                            alt="صورة المستخدم" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-12 w-12 text-gray-400" />
                        )}
                      </div>
                      <label 
                        htmlFor="avatar-upload" 
                        className="absolute bottom-0 right-0 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full cursor-pointer shadow-md transition-all"
                      >
                        {uploadingAvatar ? (
                          <span className="animate-spin block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </label>
                      <input 
                        id="avatar-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={handleAvatarUpload} 
                        disabled={uploadingAvatar}
                      />
                    </div>
                    <h3 className="text-xl font-bold mb-1">{user?.name || 'المستخدم'}</h3>
                    <p className="text-sm text-gray-500 mb-3">{user?.email}</p>
                    <div className="w-full mt-2">
                      <Button 
                        variant="destructive" 
                        className="w-full flex items-center justify-center gap-2"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>تسجيل الخروج</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex flex-col space-y-1">
                      <TabsList className="grid grid-cols-1 h-auto bg-transparent mb-4">
                        {[
                          { id: "profile", icon: <User className="h-4 w-4 ml-2" />, label: "المعلومات الشخصية" },
                          { id: "orders", icon: <Package className="h-4 w-4 ml-2" />, label: "طلباتي" },
                          { id: "notifications", icon: <Bell className="h-4 w-4 ml-2" />, label: "الإشعارات" },
                          { id: "settings", icon: <Settings className="h-4 w-4 ml-2" />, label: "الإعدادات" }
                        ].map(item => (
                          <TabsTrigger 
                            key={item.id}
                            value={item.id} 
                            className={`flex items-center justify-start p-3 mb-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${activeTab === item.id ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          {/* Main content area */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Profile Tab */}
              <TabsContent value="profile" className="mt-0">
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>المعلومات الشخصية</CardTitle>
                      <CardDescription>قم بتحديث معلوماتك الشخصية وبيانات التواصل</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <Label htmlFor="name">الاسم</Label>
                            <div className="relative">
                              <User className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                              <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="pr-10"
                                placeholder="الاسم الكامل"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="email">البريد الإلكتروني</Label>
                            <div className="relative">
                              <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                              <Input
                                id="email"
                                name="email"
                                value={formData.email}
                                disabled
                                className="pr-10 bg-gray-50 cursor-not-allowed"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="phone">رقم الهاتف</Label>
                            <div className="relative">
                              <Phone className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                              <Input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="pr-10"
                                placeholder="01xxxxxxxxx"
                                dir="ltr"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="city">المدينة</Label>
                            <div className="relative">
                              <MapPin className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                              <Input
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="pr-10"
                                placeholder="المدينة"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">العنوان</Label>
                            <Textarea
                              id="address"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              placeholder="العنوان التفصيلي"
                              className="min-h-[80px]"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <Button 
                            type="submit" 
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <>
                                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                                جاري الحفظ...
                              </>
                            ) : (
                              'حفظ التغييرات'
                            )}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
              
              {/* Orders Tab */}
              <TabsContent value="orders" className="mt-0">
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>طلباتي</CardTitle>
                      <CardDescription>تتبع وإدارة طلباتك السابقة</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingOrders ? (
                        <div className="py-12 flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="text-center py-12">
                          <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">لا توجد طلبات</h3>
                          <p className="text-gray-500 mb-4">لم تقم بأي طلبات حتى الآن</p>
                          <Button 
                            variant="default" 
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => navigate('/products')}
                          >
                            تصفح المنتجات
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {orders.map((order) => (
                            <div 
                              key={order.id} 
                              className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex flex-wrap justify-between items-start mb-3">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">
                                    رقم الطلب: <span className="font-mono">{order.id.substring(0, 8)}</span>
                                  </h4>
                                  <p className="text-xs text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString('ar-EG', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                                <div>
                                  <span 
                                    className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                                      order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    {order.status === 'pending' ? 'قيد الانتظار' :
                                     order.status === 'processing' ? 'قيد التجهيز' :
                                     order.status === 'completed' ? 'مكتمل' :
                                     order.status === 'cancelled' ? 'ملغي' :
                                     order.status}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="mb-3">
                                <div className="text-sm font-medium mb-1">المنتجات:</div>
                                <div className="space-y-2">
                                  {order.order_items?.map((item: any) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                      <span>
                                        {item.product_name} × {item.quantity}
                                      </span>
                                      <span>
                                        {item.product_price * item.quantity} ريال
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="flex justify-between border-t pt-3 mt-3">
                                <span className="font-medium">الإجمالي:</span>
                                <span className="font-bold text-red-600">{order.total_amount} ريال</span>
                              </div>
                              
                              <div className="mt-4 flex flex-wrap gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => {
                                    // View order details
                                    toast({
                                      title: "قريباً",
                                      description: "سيتم إضافة هذه الميزة قريباً",
                                    });
                                  }}
                                >
                                  تفاصيل الطلب
                                </Button>
                                
                                {order.status === 'pending' && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => {
                                      // Cancel order
                                      toast({
                                        title: "قريباً",
                                        description: "سيتم إضافة هذه الميزة قريباً",
                                      });
                                    }}
                                  >
                                    إلغاء الطلب
                                  </Button>
                                )}
                                
                                {order.status === 'completed' && (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="text-xs bg-red-600 hover:bg-red-700 text-white"
                                    onClick={() => {
                                      // Reorder
                                      toast({
                                        title: "قريباً",
                                        description: "سيتم إضافة هذه الميزة قريباً",
                                      });
                                    }}
                                  >
                                    إعادة الطلب
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
              
              {/* Notifications Tab */}
              <TabsContent value="notifications" className="mt-0">
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
                            checked={formData.preferences.notifications}
                            onCheckedChange={(checked) => handlePreferenceChange('notifications', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-base font-medium">العروض والتخفيضات</h4>
                            <p className="text-sm text-gray-500">تلقي إشعارات بالعروض والتخفيضات الجديدة</p>
                          </div>
                          <Switch 
                            checked={formData.preferences.marketing}
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
              </TabsContent>
              
              {/* Settings Tab */}
              <TabsContent value="settings" className="mt-0">
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
                                  formData.preferences.theme === theme.id ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700'
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
                                  formData.preferences.language === lang.id ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700'
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
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
