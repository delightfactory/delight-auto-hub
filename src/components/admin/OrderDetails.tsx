import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/adminService';
import { Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { locationService } from '@/services/locationService';
import { notificationService } from '@/services/notificationService';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Constants } from '@/integrations/supabase/types';
import { translateOrderStatus } from '@/utils/orderStatus';

const { order_status_expanded_enum: ORDER_STATUSES } = Constants.public.Enums;
const [
  PENDING,
  PAID,
  PROCESSING,
  READY_FOR_SHIPPING,
  READY_FOR_PICKUP,
  SHIPPED,
  OUT_FOR_DELIVERY,
  DELIVERED,
  CANCELLED,
  FAILED_DELIVERY
] = ORDER_STATUSES;

interface OrderDetailsProps {
  orderId: string;
  onStatusUpdate: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ orderId, onStatusUpdate }) => {
  const { toast } = useToast();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [cityName, setCityName] = useState<string>('');
  const [customerCityName, setCustomerCityName] = useState<string>('');

  const {
    data: order,
    isLoading,
    error
  } = useQuery({
    queryKey: ['admin-order', orderId],
    queryFn: () => orderService.getOrderById(orderId)
  });
  
  // جلب اسم المدينة إذا كان هناك معرف مدينة
  useEffect(() => {
    const fetchCityName = async () => {
      if (order?.shipping_city) {
        try {
          console.log('جاري جلب المدن...');
          const cities = await locationService.getCities();
          console.log('تم جلب المدن:', cities.length);
          console.log('معرف المدينة المطلوب:', order.shipping_city);
          console.log('نوع معرف المدينة:', typeof order.shipping_city);
          
          // محاولة العثور على المدينة بعدة طرق
          let city = null;
          
          // 1. محاولة المطابقة المباشرة
          city = cities.find(c => c.id === order.shipping_city);
          
          // 2. محاولة المطابقة بعد تحويل كلا المعرفين إلى نص
          if (!city) {
            city = cities.find(c => String(c.id) === String(order.shipping_city));
          }
          
          // 3. محاولة المطابقة بعد تحويل المعرفين إلى أرقام إذا كانا أرقاماً
          if (!city && !isNaN(Number(order.shipping_city))) {
            city = cities.find(c => Number(c.id) === Number(order.shipping_city));
          }
          
          if (city) {
            console.log('تم العثور على المدينة:', city.name_ar, 'بمعرف:', city.id);
            setCityName(city.name_ar);
          } else {
            console.log('لم يتم العثور على المدينة بالمعرف:', order.shipping_city);
            console.log('جميع معرفات المدن المتاحة:', cities.map(c => c.id).join(', '));
            
            // إذا لم يتم العثور على المدينة، نضع قيمة افتراضية
            setCityName('غير معروف');
          }
        } catch (error) {
          console.error('خطأ في جلب اسم المدينة:', error);
          setCityName('غير معروف');
        }
      }
    };
    
    fetchCityName();
  }, [order?.shipping_city]);

  // جلب اسم المدينة الخاصة بالعميل
  useEffect(() => {
    const fetchCustomerCityName = async () => {
      if (order?.customer?.city) {
        try {
          const cities = await locationService.getCities();
          let custCity = cities.find(c => c.id === order.customer.city);
          if (!custCity) {
            custCity = cities.find(c => String(c.id) === String(order.customer.city));
          }
          if (custCity) {
            setCustomerCityName(custCity.name_ar);
          } else {
            setCustomerCityName('غير معروف');
          }
        } catch (error) {
          console.error('خطأ في جلب اسم مدينة العميل:', error);
          setCustomerCityName('غير معروف');
        }
      }
    };
    fetchCustomerCityName();
  }, [order?.customer?.city]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-50';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-50';
      case 'paid':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-50';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300 hover:bg-red-50';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-50';
    }
  };
  
  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast({
        title: "تم تحديث الحالة",
        description: `تم تغيير حالة الطلب إلى "${translateOrderStatus(newStatus)}"`
      });
      // إرسال إشعار للمستخدم بتحديث الحالة
      try {
        const shortId = orderId.slice(0, 8);
        const statusAr = translateOrderStatus(newStatus);
        const targetUserId = order?.customer?.user_id || order?.customer?.id || '';
        // إشعار للعميل صاحب الطلب فقط
        await notificationService.sendNotification(
          targetUserId,
          'order_status_updated',
          'تحديث حالة الطلب',
          `تم تغيير حالة طلبك رقم ${shortId} إلى "${statusAr}".`,
          { orderId, status: newStatus },
          1
        );
        // تم إزالة إرسال الإشعارات للمستخدمين الذين لديهم دور 'admin'
      } catch (notifErr) {
        console.error('خطأ في إرسال إشعار تحديث الحالة:', notifErr);
      }
      onStatusUpdate();
    } catch (error) {
      console.error("خطأ في تحديث حالة الطلب:", error);
      toast({
        title: "خطأ في تحديث الحالة",
        description: "حدث خطأ أثناء محاولة تحديث حالة الطلب",
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // حساب المجموع الفرعي وتكلفة الشحن
  const itemsTotal = order?.order_items?.reduce((sum, item) => sum + item.product_price * item.quantity, 0) ?? 0;
  const shippingCost = order ? order.total_amount - itemsTotal : 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-red-600 mb-4" />
        <p className="text-gray-600">جارِ تحميل تفاصيل الطلب...</p>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-600 mb-2">حدث خطأ أثناء تحميل تفاصيل الطلب</p>
        <Button variant="outline" size="sm" onClick={onStatusUpdate}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  // تحديد طريقة التسليم بشكل صحيح
  const getDeliveryMethodText = () => {
    // التحقق من وجود delivery_method أولاً
    if (order.delivery_method) {
      switch (order.delivery_method) {
        case 'shipping': return 'توصيل للمنزل';
        case 'branch_pickup': return 'استلام من الفرع';
        case 'pickup_point': return 'استلام من نقطة استلام';
        default: return 'غير محدد';
      }
    }
    
    // إذا كان delivery_method غير موجود، نحاول تحديد الطريقة من البيانات الأخرى
    if (order.pickup_branch_id) return 'استلام من الفرع';
    if (order.pickup_point_id) return 'استلام من نقطة استلام';
    if (order.shipping_address) return 'توصيل للمنزل';
    
    // إذا لم نتمكن من تحديد الطريقة، نعرض "غير محدد"
    return 'غير محدد';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b">
        <h3 className="text-2xl font-semibold">تفاصيل الطلب #{order.id.substring(0, 8)}</h3>
        <Select value={order.status} onValueChange={handleStatusChange} disabled={updatingStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="اختر الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PENDING}>قيد الانتظار</SelectItem>
            <SelectItem value={PAID}>تم الدفع</SelectItem>
            <SelectItem value={PROCESSING}>قيد المعالجة</SelectItem>
            <SelectItem value={READY_FOR_SHIPPING}>جاهز للشحن</SelectItem>
            <SelectItem value={READY_FOR_PICKUP}>جاهز للاستلام</SelectItem>
            <SelectItem value={SHIPPED}>تم الشحن</SelectItem>
            <SelectItem value={OUT_FOR_DELIVERY}>في الطريق للتسليم</SelectItem>
            <SelectItem value={DELIVERED}>تم التسليم</SelectItem>
            <SelectItem value={CANCELLED}>ملغي</SelectItem>
            <SelectItem value={FAILED_DELIVERY}>فشل التسليم</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Content */}
      <div className="overflow-y-auto flex-1 px-6 py-4 w-full max-w-3xl lg:max-w-4xl space-y-8">
        {/* Order & Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Order Info */}
          <div className="space-y-4">
            <div>
              <p className="text-gray-500">رقم الطلب</p>
              <p className="font-medium">{order.id}</p>
            </div>
            <div>
              <p className="text-gray-500">التاريخ</p>
              <p className="font-medium">{formatDate(order.created_at)}</p>
            </div>
            <div>
              <p className="text-gray-500">حالة الطلب</p>
              <p className="font-medium inline-flex items-center">
                <span className={`px-2 py-1 rounded-md text-xs font-medium mr-2 ${getStatusColor(order.status)}`}>
                  {translateOrderStatus(order.status)}
                </span>
              </p>
            </div>
            <div>
              <p className="text-gray-500">آخر تحديث</p>
              <p className="font-medium">{formatDate(order.updated_at)}</p>
            </div>
            <div>
              <p className="text-gray-500">طريقة الدفع</p>
              <p className="font-medium">{order.payment_method === 'cod' ? 'الدفع عند الاستلام' : 'بطاقة ائتمان'}</p>
            </div>
            <div>
              <p className="text-gray-500">طريقة التسليم</p>
              <p className="font-medium">{getDeliveryMethodText()}</p>
            </div>
            {(order.delivery_method === 'shipping' || (!order.delivery_method && order.shipping_address)) && (
              <div>
                <p className="text-gray-500">العنوان</p>
                <p className="font-medium">
                  {order.shipping_address}
                  {cityName ? `, ${cityName}` : order.shipping_city ? `, ${order.shipping_city}` : ''}
                </p>
              </div>
            )}
            {(order.delivery_method === 'branch_pickup' || (!order.delivery_method && order.pickup_branch_id)) && order.pickup_branch_id && (
              <div>
                <p className="text-gray-500">فرع الاستلام</p>
                <p className="font-medium">{order.branch?.name || 'غير محدد'}</p>
                <p className="text-sm text-gray-500">{order.branch?.address || ''}</p>
              </div>
            )}
            {(order.delivery_method === 'pickup_point' || (!order.delivery_method && order.pickup_point_id)) && order.pickup_point_id && (
              <div>
                <p className="text-gray-500">نقطة الاستلام</p>
                <p className="font-medium">{order.pickup_point?.name || 'غير محدد'}</p>
                <p className="text-sm text-gray-500">{order.pickup_point?.address || ''}</p>
                <p className="text-sm text-gray-500">النوع: {
                  order.pickup_point?.type === 'locker' ? 'خزانة' :
                  order.pickup_point?.type === 'partner' ? 'شريك' :
                  order.pickup_point?.type === 'standard' ? 'قياسي' :
                  order.pickup_point?.type === 'express' ? 'سريع' :
                  order.pickup_point?.type === 'premium' ? 'مميز' :
                  order.pickup_point?.type
                }</p>
              </div>
            )}
            {order.shipping_cost !== undefined && (
              <div>
                <p className="text-gray-500">تكلفة الشحن</p>
                <p className="font-medium">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(order.shipping_cost)}</p>
              </div>
            )}
            {order.created_at !== order.updated_at && (
              <div>
                <p className="text-gray-500">آخر تحديث</p>
                <p className="font-medium">{formatDate(order.updated_at)}</p>
              </div>
            )}
          </div>
          {/* Customer Info */}
          <div className="space-y-4">
            <div>
              <p className="text-gray-500">اسم العميل</p>
              <p className="font-medium">{order.customer?.name || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">البريد الإلكتروني</p>
              <p className="font-medium">{order.customer?.email || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">الهاتف</p>
              <p className="font-medium">{order.customer?.phone || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">عنوان العميل</p>
              <p className="font-medium">{order.customer?.address || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">المدينة</p>
              <p className="font-medium">{customerCityName || '-'}</p>
            </div>
            {order.notes && (
              <div>
                <p className="text-gray-500">ملاحظات</p>
                <p className="font-medium">{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto mb-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>صورة</TableHead>
                <TableHead>رمز المنتج</TableHead>
                <TableHead>اسم المنتج</TableHead>
                <TableHead>سعر الوحدة</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>الإجمالي</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.order_items?.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="p-2">
                    {item.product?.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      <Package className="h-10 w-10 text-gray-400" />
                    )}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      // طباعة معلومات المنتج للتصحيح
                      console.log(`عرض منتج: ${item.product_id}`, item.product);
                      if (item.product?.product_code) {
                        console.log(`كود المنتج: ${item.product.product_code}`);
                        return item.product.product_code;
                      } else if (item.temp_product_code) {
                        return item.temp_product_code;
                      } else {
                        return item.product_id;
                      }
                    })()
                    }
                  </TableCell>
                  <TableCell>{item.product?.name || item.product_name}</TableCell>
                  <TableCell>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(item.product_price)}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(item.product_price * item.quantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Cost Summary */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-gray-800 font-medium">
          <div>
            <p className="text-gray-500">المجموع الفرعي</p>
            <p>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(itemsTotal)}</p>
          </div>
          <div>
            <p className="text-gray-500">تكلفة الشحن</p>
            <p>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(order.shipping_cost !== undefined ? order.shipping_cost : shippingCost)}</p>
          </div>
          <div>
            <p className="text-gray-500">الإجمالي الكلي</p>
            <p className="font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(order.total_amount)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
