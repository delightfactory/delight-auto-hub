
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { getCustomerOrders } from '@/services/orderService';
import { Bell, LogOut, User, ShoppingBag, Home, Phone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const ProfilePage = () => {
  const { user, loading, signOut, updateProfile } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || '');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Fetch orders for this user
  const { data: orderData, isLoading: ordersLoading, error: ordersError } = useQuery({
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
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-delight-600 border-r-transparent"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">جاري تحميل الملف الشخصي...</p>
        </div>
      </div>
    );
  }
  
  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      await updateProfile({ name, phone, address, city });
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من تحديث بياناتك",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid gap-8 md:grid-cols-3">
        {/* Profile Information */}
        <div className="md:col-span-1">
          <Card className="h-full border-2 border-delight-100">
            <CardHeader className="text-center border-b border-gray-100 pb-6">
              <div className="mx-auto mb-4">
                <Avatar className="h-24 w-24 mx-auto border-4 border-delight-100">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || user?.email}`} alt={user?.name} />
                  <AvatarFallback className="text-2xl bg-delight-100 text-delight-800">
                    {user?.name?.charAt(0) || user?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl font-bold">{user?.name || 'مستخدم ديلايت'}</CardTitle>
              <CardDescription className="text-delight-600">{user?.email}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-delight-600" />
                  <span>{user?.phone || 'لم يتم إضافة رقم هاتف'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Home className="h-5 w-5 text-delight-600" />
                  <span>{user?.address ? `${user.address}, ${user.city}` : 'لم يتم إضافة عنوان'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-delight-600" />
                  <span>
                    {orderData?.orders?.length || 0} طلبات
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-100 pt-4">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2 border-red-300 text-red-600 hover:bg-red-50"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                <span>تسجيل الخروج</span>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Edit Profile Form */}
        <div className="md:col-span-2">
          <Card className="border-2 border-delight-100">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5 text-delight-600" />
                تعديل الملف الشخصي
              </CardTitle>
              <CardDescription>
                قم بتحديث معلوماتك الشخصية وبيانات الاتصال الخاصة بك
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
                      className="text-right"
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
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">المدينة</Label>
                  <Input 
                    id="city" 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="المدينة" 
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter className="border-t border-gray-100 pt-4">
              <Button 
                className="w-full bg-delight-600 hover:bg-delight-700 text-white"
                onClick={handleUpdateProfile}
                disabled={isUpdating}
              >
                {isUpdating ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Recent Orders */}
          <Card className="mt-8 border-2 border-delight-100">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-delight-600" />
                الطلبات الأخيرة
              </CardTitle>
              <CardDescription>
                عرض وتتبع طلباتك الأخيرة
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {ordersLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-delight-600 border-r-transparent"></div>
                  <p className="mt-2">جاري تحميل الطلبات...</p>
                </div>
              ) : orderData?.orders?.length ? (
                <div className="space-y-4">
                  {orderData.orders.slice(0, 3).map((order: any) => (
                    <div key={order.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">طلب #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
                        </div>
                        <div>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                            'bg-blue-100 text-blue-800'
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
                        <p className="font-medium text-delight-700 mt-1">المبلغ: {order.total_amount} ج.م</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>لا توجد طلبات حتى الآن</p>
                  <Button 
                    variant="link" 
                    className="mt-2 text-delight-600"
                    onClick={() => window.location.href = "/products"}
                  >
                    تصفح المنتجات
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t border-gray-100 pt-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = "/orders"}
              >
                عرض جميع الطلبات
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Notifications Sheet */}
      <div className="fixed bottom-6 left-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button className="rounded-full h-14 w-14 bg-delight-600 hover:bg-delight-700 text-white shadow-lg">
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
              <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-md">
                <p className="font-medium">مرحباً بك في ديلايت!</p>
                <p className="text-sm text-gray-600 mt-1">شكراً لانضمامك إلينا. استمتع بتجربة تسوق مميزة.</p>
                <p className="text-xs text-gray-400 mt-2">منذ {user ? new Date(new Date().getTime() - 1000*60*60*24).toLocaleDateString('ar-EG') : 'يوم واحد'}</p>
              </div>
              
              <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded-md">
                <p className="font-medium">عروض خاصة</p>
                <p className="text-sm text-gray-600 mt-1">خصم 15% على جميع المنتجات لفترة محدودة! استخدم كود: DELIGHT15</p>
                <p className="text-xs text-gray-400 mt-2">منذ 3 أيام</p>
              </div>
              
              <div className="bg-yellow-50 border-r-4 border-yellow-500 p-4 rounded-md">
                <p className="font-medium">منتجات جديدة</p>
                <p className="text-sm text-gray-600 mt-1">تم إضافة منتجات جديدة للعناية بالسيارات. تصفحها الآن!</p>
                <p className="text-xs text-gray-400 mt-2">منذ أسبوع</p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default ProfilePage;
