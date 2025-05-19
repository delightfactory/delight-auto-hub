
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Search, Calendar, Package, Truck, Check, ArrowRight } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { getCustomerOrders } from '@/services/orderService';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import PageHeader from '@/components/PageHeader';

const OrdersPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "بريد إلكتروني مطلوب",
        description: "الرجاء إدخال البريد الإلكتروني المرتبط بالطلبات",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const { orders: customerOrders } = await getCustomerOrders(email);
      setOrders(customerOrders);
      setSearched(true);
      
      if (customerOrders.length === 0) {
        toast({
          title: "لم يتم العثور على طلبات",
          description: "لا توجد طلبات مرتبطة بهذا البريد الإلكتروني",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "خطأ في النظام",
        description: "حدث خطأ أثناء البحث عن الطلبات. الرجاء المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // تحويل حالة الطلب إلى العربية
  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'قيد المراجعة',
      'processing': 'قيد التجهيز',
      'shipped': 'تم الشحن',
      'delivered': 'تم التوصيل',
      'cancelled': 'ملغي'
    };
    return statusMap[status] || status;
  };

  // عرض رمز حالة الطلب
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Calendar className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <Check className="h-5 w-5 text-green-500" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />;
    }
  };

  // تنسيق التاريخ بالعربية
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: ar
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="تتبع الطلبات" 
        description="تتبع طلباتك السابقة والحالية وتفقد حالتها"
      />
      
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">البحث عن طلباتك</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  البريد الإلكتروني المستخدم في الطلب
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="أدخل البريد الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? 'جاري البحث...' : 'البحث عن الطلبات'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {searched && (
          <div className="mt-8 space-y-6">
            <h2 className="text-xl font-bold">نتائج البحث</h2>
            
            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-gray-500">لم يتم العثور على طلبات مرتبطة بهذا البريد الإلكتروني</p>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="border-gray-200 hover:border-gray-300 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-medium">
                        طلب #{order.id.substring(0, 8)}
                      </CardTitle>
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-xs">
                        {getStatusIcon(order.status)}
                        <span>{getStatusText(order.status)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </p>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">المنتجات</h4>
                        <ul className="space-y-2">
                          {order.items.map((item: any) => (
                            <li key={item.id} className="flex justify-between text-sm">
                              <div>
                                {item.product_name}
                                <span className="text-gray-500"> × {item.quantity}</span>
                              </div>
                              <div>{item.product_price} ريال</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between font-medium">
                        <span>المجموع</span>
                        <span>{order.total_amount} ريال</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-0">
                    <div className="w-full flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                      >
                        تفاصيل الطلب
                        <ArrowRight className="mr-1 h-3 w-3 rtl:rotate-180" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
