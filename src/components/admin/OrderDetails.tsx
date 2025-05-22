import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/adminService';
import { Loader2, Package, MapPin, User, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderStatus } from '@/types/db';
import { toast } from 'sonner';
import { Check, Loader2, Package, Truck, X, ShoppingBag } from 'lucide-react';

interface OrderDetailsProps {
  orderId: string;
  onStatusUpdate: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ orderId, onStatusUpdate }) => {
  const { toast } = useToast();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  const {
    data: order,
    isLoading,
    error
  } = useQuery({
    queryKey: ['admin-order', orderId],
    queryFn: () => orderService.getOrderById(orderId)
  });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-50';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-50';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-50';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300 hover:bg-red-50';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-50';
    }
  };
  
  const translateStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'processing':
        return 'قيد المعالجة';
      case 'pending':
        return 'قيد الانتظار';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };
  
  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast({
        title: "تم تحديث الحالة",
        description: `تم تغيير حالة الطلب إلى "${translateStatus(newStatus)}"`
      });
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

  return (
    <div className="mt-6 space-y-6">
      {/* معلومات الطلب الأساسية */}
      <div>
        <h3 className="text-lg font-medium mb-2">معلومات الطلب</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">رقم الطلب:</span>
            <span className="font-medium">{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">تاريخ الطلب:</span>
            <span>{formatDate(order.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">المبلغ الإجمالي:</span>
            <span className="font-medium">{order.total_amount} ر.س</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">طريقة الدفع:</span>
            <span>{order.payment_method}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">الحالة:</span>
            <Badge variant="outline" className={getStatusColor(order.status)}>
              {translateStatus(order.status)}
            </Badge>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* تغيير حالة الطلب */}
      <div>
        <h3 className="text-lg font-medium mb-3">تغيير حالة الطلب</h3>
        <div className="flex gap-2">
          <Select
            value={order.status}
            onValueChange={handleStatusChange}
            disabled={updatingStatus}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">قيد الانتظار</SelectItem>
              <SelectItem value="processing">قيد المعالجة</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
              <SelectItem value="cancelled">ملغي</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Separator />
      
      {/* معلومات العميل */}
      <div>
        <h3 className="text-lg font-medium mb-3">معلومات العميل</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <User className="h-5 w-5 text-gray-500 ml-2" />
            <span className="text-gray-700">{order.customer?.name || 'غير متاح'}</span>
          </div>
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-gray-500 ml-2" />
            <span className="text-gray-700">{order.customer?.email || 'غير متاح'}</span>
          </div>
          <div className="flex items-center">
            <Phone className="h-5 w-5 text-gray-500 ml-2" />
            <span className="text-gray-700">{order.customer?.phone || 'غير متاح'}</span>
          </div>
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-gray-500 ml-2 mt-0.5" />
            <span className="text-gray-700">
              {order.shipping_address}، {order.shipping_city}
            </span>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* منتجات الطلب */}
      <div>
        <h3 className="text-lg font-medium mb-3">منتجات الطلب</h3>
        <div className="space-y-4">
          {order.order_items && order.order_items.length > 0 ? (
            order.order_items.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-gray-500 ml-2" />
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-gray-500">
                      {item.product_price} ر.س × {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-medium">
                  {item.product_price * item.quantity} ر.س
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">لا توجد منتجات في هذا الطلب</p>
          )}
          
          <div className="border-t pt-3">
            <div className="flex justify-between font-bold">
              <span>الإجمالي:</span>
              <span>{order.total_amount} ر.س</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* ملاحظات الطلب */}
      {order.notes && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-medium mb-2">ملاحظات</h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
              {order.notes}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderDetails;
