import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCustomerOrders } from '@/services/orderService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Package } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Constants } from '@/integrations/supabase/types';

const { order_status_expanded_enum: ORDER_STATUSES } = Constants.public.Enums;
const [PENDING, PAID, PROCESSING, READY_FOR_SHIPPING, READY_FOR_PICKUP, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, FAILED_DELIVERY] = ORDER_STATUSES;

// تم إزالة PageHeader لتوفير مساحة عرض

const OrdersPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const { toast } = useToast();

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['customerOrders', email],
    queryFn: () => getCustomerOrders(email),
    enabled: searchSubmitted && email.trim() !== '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال البريد الإلكتروني",
        variant: "destructive",
      });
      return;
    }
    
    setSearchSubmitted(true);
    refetch();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy-MM-dd HH:mm'); 
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case DELIVERED:
        return 'text-green-600 bg-green-100 border-green-300';
      case SHIPPED:
        return 'text-blue-600 bg-blue-100 border-blue-300';
      case PAID:
      case PENDING:
        return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case CANCELLED:
        return 'text-red-600 bg-red-100 border-red-300';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case DELIVERED:
        return 'مكتمل';
      case SHIPPED:
        return 'تم الشحن';
      case PAID:
        return 'قيد المعالجة';
      case PENDING:
        return 'قيد الانتظار';
      case CANCELLED:
        return 'ملغي';
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-screen-xl">
      <div className="my-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">ابحث عن طلباتك</CardTitle>
            <CardDescription>أدخل البريد الإلكتروني الذي استخدمته عند تقديم الطلب</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-grow"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'بحث'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {searchSubmitted && (
        <div className="my-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-amazon-primary" />
            </div>
          ) : error ? (
            <Card className="border-red-300 bg-red-50">
              <CardContent className="pt-6 text-center text-red-600">
                حدث خطأ أثناء البحث عن طلباتك. الرجاء المحاولة مرة أخرى.
              </CardContent>
            </Card>
          ) : data?.orders.length === 0 ? (
            <Card className="border-yellow-300 bg-yellow-50">
              <CardContent className="pt-6 text-center text-yellow-800">
                لم يتم العثور على طلبات مرتبطة بهذا البريد الإلكتروني.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">طلباتك</h2>
              {data?.orders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">طلب #{order.id.substring(0, 8)}</CardTitle>
                        <CardDescription>{formatDate(order.created_at)}</CardDescription>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {translateStatus(order.status)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">طريقة التسليم</h3>
                        <p className="mt-1">
                          {order.delivery_method === 'shipping' && 'توصيل للمنزل'}
                          {order.delivery_method === 'branch_pickup' && 'استلام من الفرع'}
                          {order.delivery_method === 'pickup_point' && 'استلام من نقطة استلام'}
                          {!order.delivery_method && 'توصيل للمنزل'}
                        </p>
                      </div>

                      {order.delivery_method === 'shipping' && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">عنوان التوصيل</h3>
                          <p className="mt-1">{order.shipping_address}، {order.shipping_city}</p>
                        </div>
                      )}
                      
                      {order.delivery_method === 'branch_pickup' && order.branch_id && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">فرع الاستلام</h3>
                          <p className="mt-1">{order.branch?.name || 'غير محدد'}</p>
                          <p className="text-sm text-gray-500">{order.branch?.address || ''}</p>
                        </div>
                      )}
                      
                      {order.delivery_method === 'pickup_point' && order.pickup_point_id && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">نقطة الاستلام</h3>
                          <p className="mt-1">{order.pickup_point?.name || 'غير محدد'}</p>
                          <p className="text-sm text-gray-500">{order.pickup_point?.address || ''}</p>
                        </div>
                      )}
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">طريقة الدفع</h3>
                        <p className="mt-1">{order.payment_method}</p>
                      </div>

                      <Separator />
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">المنتجات</h3>
                        <ul className="space-y-2">
                          {order.order_items?.map((item) => (
                            <li key={item.id} className="flex justify-between">
                              <div className="flex items-center">
                                <Package className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{item.product_name}</span>
                                <span className="text-gray-500 mx-2">×</span>
                                <span>{item.quantity}</span>
                              </div>
                              <span>{item.product_price} ريال</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between bg-gray-50 border-t">
                    {order.notes && (
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">ملاحظات:</span> {order.notes}
                      </div>
                    )}
                    <div className="text-lg font-bold">
                      الإجمالي: {order.total_amount} ريال
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
