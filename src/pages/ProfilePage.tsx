
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { getCustomerOrders } from '@/services/orderService';
import { Bell, LogOut, User, ShoppingBag, Home, Phone, Settings, Bookmark, CreditCard, Shield, HelpCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import PageTransition from '@/components/PageTransition';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const ProfilePage = () => {
  const { user, loading, signOut, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('ar');
  
  // Fetch orders for this user
  const { data: orderData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', user?.email],
    queryFn: () => user?.email ? getCustomerOrders(user.email) : { orders: [] },
    enabled: !!user?.email
  });
  
  // Redirect to login if not authenticated
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-r-transparent"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">جاري تحميل الملف الشخصي...</p>
        </div>
      </div>
    );
  }
  
  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      await updateProfile({ name, phone, address, city });
      toast.success("تم تحديث الملف الشخصي بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث الملف الشخصي");
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleSignOut = async () => {
    await signOut();
    toast.info("تم تسجيل الخروج بنجاح");
  };
  
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-10">
        <Tabs defaultValue="personal" className="w-full">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="md:w-1/4">
              <Card className="sticky top-20 border-2 border-red-100 dark:border-red-900/30">
                <CardHeader className="text-center border-b border-gray-100 dark:border-gray-800 pb-6">
                  <div className="mx-auto mb-4">
                    <Avatar className="h-24 w-24 mx-auto border-4 border-red-100 dark:border-red-900/30">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || user?.email}`} alt={user?.name} />
                      <AvatarFallback className="text-2xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                        {user?.name?.charAt(0) || user?.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl font-bold">{user?.name || 'مستخدم ديلايت'}</CardTitle>
                  <CardDescription className="text-red-600 dark:text-red-400">{user?.email}</CardDescription>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <TabsList className="flex flex-col w-full bg-transparent space-y-1">
                    <TabsTrigger 
                      value="personal" 
                      className="w-full justify-start gap-2 text-right hover:bg-red-50 dark:hover:bg-red-900/20 data-[state=active]:bg-red-100 dark:data-[state=active]:bg-red-900/30"
                    >
                      <User className="h-4 w-4" />
                      <span>البيانات الشخصية</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="orders" 
                      className="w-full justify-start gap-2 text-right hover:bg-red-50 dark:hover:bg-red-900/20 data-[state=active]:bg-red-100 dark:data-[state=active]:bg-red-900/30"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>الطلبات</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="notifications" 
                      className="w-full justify-start gap-2 text-right hover:bg-red-50 dark:hover:bg-red-900/20 data-[state=active]:bg-red-100 dark:data-[state=active]:bg-red-900/30"
                    >
                      <Bell className="h-4 w-4" />
                      <span>الإشعارات</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="favorites" 
                      className="w-full justify-start gap-2 text-right hover:bg-red-50 dark:hover:bg-red-900/20 data-[state=active]:bg-red-100 dark:data-[state=active]:bg-red-900/30"
                    >
                      <Bookmark className="h-4 w-4" />
                      <span>المفضلة</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="payments" 
                      className="w-full justify-start gap-2 text-right hover:bg-red-50 dark:hover:bg-red-900/20 data-[state=active]:bg-red-100 dark:data-[state=active]:bg-red-900/30"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>وسائل الدفع</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="security" 
                      className="w-full justify-start gap-2 text-right hover:bg-red-50 dark:hover:bg-red-900/20 data-[state=active]:bg-red-100 dark:data-[state=active]:bg-red-900/30"
                    >
                      <Shield className="h-4 w-4" />
                      <span>الأمان</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="preferences" 
                      className="w-full justify-start gap-2 text-right hover:bg-red-50 dark:hover:bg-red-900/20 data-[state=active]:bg-red-100 dark:data-[state=active]:bg-red-900/30"
                    >
                      <Settings className="h-4 w-4" />
                      <span>التفضيلات</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="help" 
                      className="w-full justify-start gap-2 text-right hover:bg-red-50 dark:hover:bg-red-900/20 data-[state=active]:bg-red-100 dark:data-[state=active]:bg-red-900/30"
                    >
                      <HelpCircle className="h-4 w-4" />
                      <span>المساعدة</span>
                    </TabsTrigger>
                  </TabsList>
                </CardContent>
                
                <CardFooter className="border-t border-gray-100 dark:border-gray-800 pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>تسجيل الخروج</span>
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Main Content */}
            <div className="md:w-3/4">
              <TabsContent value="personal">
                <Card className="border-2 border-red-100 dark:border-red-900/30">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <User className="h-5 w-5 text-red-600 dark:text-red-400" />
                      البيانات الشخصية
                    </CardTitle>
                    <CardDescription>
                      تحديث بياناتك الشخصية ومعلومات الاتصال
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <form className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">الاسم الكامل</Label>
                          <Input 
                            id="name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            placeholder="أدخل اسمك الكامل" 
                            className="border-gray-200 dark:border-gray-700 focus:border-red-300 dark:focus:border-red-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">رقم الهاتف</Label>
                          <Input 
                            id="phone" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="01xxxxxxxxx" 
                            dir="ltr"
                            className="text-right border-gray-200 dark:border-gray-700 focus:border-red-300 dark:focus:border-red-700"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address">العنوان</Label>
                        <Input 
                          id="address" 
                          value={address} 
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="العنوان التفصيلي" 
                          className="border-gray-200 dark:border-gray-700 focus:border-red-300 dark:focus:border-red-700"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="city">المدينة</Label>
                        <Select value={city} onValueChange={setCity}>
                          <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:border-red-300 dark:focus:border-red-700">
                            <SelectValue placeholder="اختر المدينة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="القاهرة">القاهرة</SelectItem>
                            <SelectItem value="الإسكندرية">الإسكندرية</SelectItem>
                            <SelectItem value="الجيزة">الجيزة</SelectItem>
                            <SelectItem value="المنصورة">المنصورة</SelectItem>
                            <SelectItem value="طنطا">طنطا</SelectItem>
                            <SelectItem value="الإسماعيلية">الإسماعيلية</SelectItem>
                            <SelectItem value="أسيوط">أسيوط</SelectItem>
                            <SelectItem value="بورسعيد">بورسعيد</SelectItem>
                            <SelectItem value="السويس">السويس</SelectItem>
                            <SelectItem value="الأقصر">الأقصر</SelectItem>
                            <SelectItem value="أسوان">أسوان</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="border-t border-gray-100 dark:border-gray-800 pt-4 flex justify-end">
                    <Button 
                      className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-800 dark:hover:bg-red-700"
                      onClick={handleUpdateProfile}
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="orders">
                <Card className="border-2 border-red-100 dark:border-red-900/30">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-red-600 dark:text-red-400" />
                      طلباتي
                    </CardTitle>
                    <CardDescription>
                      تتبع وإدارة طلباتك الحالية والسابقة
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {ordersLoading ? (
                      <div className="text-center py-8">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-r-transparent"></div>
                        <p className="mt-2">جاري تحميل الطلبات...</p>
                      </div>
                    ) : orderData?.orders?.length ? (
                      <div className="space-y-4">
                        {orderData.orders.map((order: any) => (
                          <div key={order.id} className="border rounded-md p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">طلب #{order.id.slice(0, 8)}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
                              </div>
                              <div>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                                  order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
                                  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>
                                  {order.status === 'pending' ? 'قيد الانتظار' : 
                                    order.status === 'completed' ? 'مكتمل' : 
                                    order.status === 'cancelled' ? 'ملغي' : 
                                    'قيد التنفيذ'}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <p className="text-sm">عدد المنتجات: {order.items?.length || 0}</p>
                              <p className="font-medium text-red-600 dark:text-red-400 mt-1">المبلغ: {order.total_amount} ج.م</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
                        <ShoppingBag className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                        <p className="text-gray-500 dark:text-gray-400">لا توجد طلبات حتى الآن</p>
                        <Button 
                          variant="link" 
                          className="mt-2 text-red-600 dark:text-red-400"
                          onClick={() => window.location.href = "/products"}
                        >
                          تصفح المنتجات
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications">
                <Card className="border-2 border-red-100 dark:border-red-900/30">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Bell className="h-5 w-5 text-red-600 dark:text-red-400" />
                      إعدادات الإشعارات
                    </CardTitle>
                    <CardDescription>
                      تخصيص إعدادات الإشعارات والتنبيهات
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">تفعيل الإشعارات</Label>
                        <p className="text-sm text-muted-foreground">استلام إشعارات حول الطلبات والعروض</p>
                      </div>
                      <Switch 
                        checked={notificationsEnabled} 
                        onCheckedChange={setNotificationsEnabled} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">رسائل بريدية تسويقية</Label>
                        <p className="text-sm text-muted-foreground">استلام عروض وتخفيضات خاصة على بريدك الإلكتروني</p>
                      </div>
                      <Switch 
                        checked={marketingEmails} 
                        onCheckedChange={setMarketingEmails}
                        disabled={!notificationsEnabled} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">تحديثات الطلبات</Label>
                        <p className="text-sm text-muted-foreground">استلام إشعارات عن حالة طلباتك وتتبعها</p>
                      </div>
                      <Switch 
                        checked={orderUpdates} 
                        onCheckedChange={setOrderUpdates}
                        disabled={!notificationsEnabled} 
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-gray-100 dark:border-gray-800 pt-4 flex justify-end">
                    <Button 
                      className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-800 dark:hover:bg-red-700"
                      onClick={() => toast.success("تم حفظ إعدادات الإشعارات")}
                    >
                      حفظ الإعدادات
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="preferences">
                <Card className="border-2 border-red-100 dark:border-red-900/30">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Settings className="h-5 w-5 text-red-600 dark:text-red-400" />
                      تفضيلات المستخدم
                    </CardTitle>
                    <CardDescription>
                      تخصيص إعدادات العرض واللغة
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="theme">المظهر</Label>
                      <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:border-red-300 dark:focus:border-red-700">
                          <SelectValue placeholder="اختر المظهر" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">فاتح</SelectItem>
                          <SelectItem value="dark">داكن</SelectItem>
                          <SelectItem value="system">حسب النظام</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="language">اللغة</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:border-red-300 dark:focus:border-red-700">
                          <SelectValue placeholder="اختر اللغة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ar">العربية</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-gray-100 dark:border-gray-800 pt-4 flex justify-end">
                    <Button 
                      className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-800 dark:hover:bg-red-700"
                      onClick={() => toast.success("تم حفظ التفضيلات بنجاح")}
                    >
                      حفظ التفضيلات
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="favorites">
                <Card className="border-2 border-red-100 dark:border-red-900/30 min-h-[400px] flex items-center justify-center">
                  <div className="text-center p-8">
                    <Bookmark className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <h3 className="text-lg font-medium mb-2">لا توجد منتجات مفضلة</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">قم بإضافة منتجات إلى المفضلة لتظهر هنا</p>
                    <Button 
                      variant="outline" 
                      className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                      onClick={() => window.location.href = "/products"}
                    >
                      استعرض المنتجات
                    </Button>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="payments">
                <Card className="border-2 border-red-100 dark:border-red-900/30 min-h-[400px] flex items-center justify-center">
                  <div className="text-center p-8">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <h3 className="text-lg font-medium mb-2">لا توجد وسائل دفع محفوظة</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">أضف بطاقات الدفع لتسهيل عملية الشراء</p>
                    <Button 
                      variant="outline" 
                      className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                      onClick={() => toast.info("هذه الميزة قيد التطوير حالياً")}
                    >
                      إضافة وسيلة دفع
                    </Button>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="security">
                <Card className="border-2 border-red-100 dark:border-red-900/30">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                      الأمان والخصوصية
                    </CardTitle>
                    <CardDescription>
                      إدارة إعدادات الأمان وحماية حسابك
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-right border-gray-200 dark:border-gray-700"
                        onClick={() => toast.info("هذه الميزة قيد التطوير حالياً")}
                      >
                        تغيير كلمة المرور
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-right border-gray-200 dark:border-gray-700"
                        onClick={() => toast.info("هذه الميزة قيد التطوير حالياً")}
                      >
                        تفعيل المصادقة الثنائية
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-right border-gray-200 dark:border-gray-700"
                        onClick={() => toast.info("هذه الميزة قيد التطوير حالياً")}
                      >
                        إدارة الأجهزة المتصلة
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-right text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                        onClick={() => toast.info("هذه الميزة قيد التطوير حالياً")}
                      >
                        حذف الحساب
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="help">
                <Card className="border-2 border-red-100 dark:border-red-900/30">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      المساعدة والدعم
                    </CardTitle>
                    <CardDescription>
                      الحصول على المساعدة والإجابة على الأسئلة الشائعة
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h3 className="font-medium mb-2">كيف يمكنني تتبع طلبي؟</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">يمكنك تتبع طلبك من خلال الانتقال إلى قسم "الطلبات" في حسابك الشخصي.</p>
                      </div>
                      
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h3 className="font-medium mb-2">ما هي سياسة الإرجاع؟</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">يمكنك إرجاع المنتج خلال 14 يوم من تاريخ الاستلام إذا كان بحالته الأصلية.</p>
                      </div>
                      
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h3 className="font-medium mb-2">كم تستغرق عملية التوصيل؟</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">يتم التوصيل عادة خلال 2-5 أيام عمل داخل القاهرة والجيزة، و5-7 أيام للمحافظات الأخرى.</p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button 
                        className="w-full bg-red-600 hover:bg-red-700 text-white dark:bg-red-800 dark:hover:bg-red-700"
                        onClick={() => window.location.href = "/contact"}
                      >
                        اتصل بنا للمساعدة
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
        
        {/* Notifications Sheet */}
        <div className="fixed bottom-6 left-6 z-40">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="rounded-full h-14 w-14 bg-red-600 hover:bg-red-700 text-white shadow-lg">
                <Bell className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] rounded-t-xl">
              <SheetHeader>
                <SheetTitle className="text-center text-xl">الإشعارات</SheetTitle>
                <SheetDescription className="text-center">
                  إشعارات حسابك وتحديثات طلباتك
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-md dark:bg-blue-900/20 dark:border-blue-500/50 dark:text-blue-100">
                  <p className="font-medium">مرحباً بك في ديلايت!</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">شكراً لانضمامك إلينا. استمتع بتجربة تسوق مميزة.</p>
                  <p className="text-xs text-gray-400 mt-2">منذ {user ? new Date(new Date().getTime() - 1000*60*60*24).toLocaleDateString('ar-EG') : 'يوم واحد'}</p>
                </div>
                
                <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded-md dark:bg-green-900/20 dark:border-green-500/50 dark:text-green-100">
                  <p className="font-medium">عروض خاصة</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">خصم 15% على جميع المنتجات لفترة محدودة! استخدم كود: DELIGHT15</p>
                  <p className="text-xs text-gray-400 mt-2">منذ 3 أيام</p>
                </div>
                
                <div className="bg-yellow-50 border-r-4 border-yellow-500 p-4 rounded-md dark:bg-yellow-900/20 dark:border-yellow-500/50 dark:text-yellow-100">
                  <p className="font-medium">منتجات جديدة</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">تم إضافة منتجات جديدة للعناية بالسيارات. تصفحها الآن!</p>
                  <p className="text-xs text-gray-400 mt-2">منذ أسبوع</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </PageTransition>
  );
};

export default ProfilePage;
