import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/adminService';
import { Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
  
  const translateStatus = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'مكتمل';
      case 'shipped':
        return 'تم الشحن';
      case 'paid':
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
            <SelectItem value="pending">قيد الانتظار</SelectItem>
            <SelectItem value="paid">قيد المعالجة</SelectItem>
            <SelectItem value="shipped">تم الشحن</SelectItem>
            <SelectItem value="delivered">مكتمل</SelectItem>
            <SelectItem value="cancelled">ملغي</SelectItem>
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
              <p className="text-gray-500">طريقة الدفع</p>
              <p className="font-medium">{order.payment_method}</p>
            </div>
            <div>
              <p className="text-gray-500">العنوان</p>
              <p className="font-medium">{order.shipping_address}, {order.shipping_city}</p>
            </div>
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
                  <TableCell>{item.product_id || item.temp_product_code}</TableCell>
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
            <p>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(shippingCost)}</p>
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
