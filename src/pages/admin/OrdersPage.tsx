import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Loader2, 
  Eye, 
  FileX,
  ShoppingCart,
  Filter,
  X,
  Check,
  Clock,
  Ban,
  Truck
} from 'lucide-react';
import { orderService } from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import OrderDetails from '@/components/admin/OrderDetails';
import { Constants } from '@/integrations/supabase/types';

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

const OrdersPage = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get('customer') || undefined;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  const {
    data: orders = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['admin-orders', customerId],
    queryFn: () => orderService.getOrders(customerId)
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
      case DELIVERED:
        return 'text-green-600 bg-green-100 border-green-300';
      case SHIPPED:
      case OUT_FOR_DELIVERY:
        return 'text-blue-600 bg-blue-100 border-blue-300';
      case READY_FOR_SHIPPING:
      case READY_FOR_PICKUP:
      case PROCESSING:
        return 'text-orange-600 bg-orange-100 border-orange-300';
      case PAID:
      case PENDING:
        return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case CANCELLED:
      case FAILED_DELIVERY:
        return 'text-red-600 bg-red-100 border-red-300';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case DELIVERED:
        return <Check className="h-4 w-4 text-green-600" />;
      case SHIPPED:
        return <Truck className="h-4 w-4 text-blue-600" />;
      case OUT_FOR_DELIVERY:
        return <Truck className="h-4 w-4 text-blue-600" />;
      case READY_FOR_SHIPPING:
      case READY_FOR_PICKUP:
      case PROCESSING:
        return <Clock className="h-4 w-4 text-orange-600" />;
      case PAID:
      case PENDING:
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case CANCELLED:
        return <Ban className="h-4 w-4 text-red-600" />;
      case FAILED_DELIVERY:
        return <FileX className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };
  
  const translateStatus = (status: string) => {
    switch (status) {
      case DELIVERED:
        return 'مكتمل';
      case SHIPPED:
        return 'تم الشحن';
      case OUT_FOR_DELIVERY:
        return 'في الطريق للتسليم';
      case FAILED_DELIVERY:
        return 'فشل التسليم';
      case READY_FOR_SHIPPING:
        return 'جاهز للشحن';
      case READY_FOR_PICKUP:
        return 'جاهز للاستلام';
      case PROCESSING:
        return 'قيد المعالجة';
      case PAID:
        return 'تم الدفع';
      case PENDING:
        return 'قيد الانتظار';
      case CANCELLED:
        return 'ملغي';
      default:
        return status;
    }
  };
  
  // تغيير حالة الطلب مباشرة من الجدول
  const handleStatusChangeRow = async (id: string, newStatus: string) => {
    try {
      await orderService.updateOrderStatus(id, newStatus);
      toast({ title: 'تم التحديث', description: 'تم تغيير حالة الطلب بنجاح' });
      refetch();
    } catch (error) {
      console.error(error);
      toast({ title: 'خطأ', description: 'فشل في تغيير حالة الطلب', variant: 'destructive' });
    }
  };
  
  // تصفية الطلبات بناءً على مصطلح البحث وحالة الطلب
  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">الطلبات</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ابحث عن طلب..."
              className="pr-10 w-full sm:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="جميع الحالات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value={PENDING}>قيد الانتظار</SelectItem>
              <SelectItem value={PAID}>تم الدفع</SelectItem>
              <SelectItem value={PROCESSING}>قيد المعالجة</SelectItem>
              <SelectItem value={READY_FOR_SHIPPING}>جاهز للشحن</SelectItem>
              <SelectItem value={READY_FOR_PICKUP}>جاهز للاستلام</SelectItem>
              <SelectItem value={SHIPPED}>تم الشحن</SelectItem>
              <SelectItem value={OUT_FOR_DELIVERY}>في الطريق للتسليم</SelectItem>
              <SelectItem value={DELIVERED}>مكتمل</SelectItem>
              <SelectItem value={CANCELLED}>ملغي</SelectItem>
              <SelectItem value={FAILED_DELIVERY}>فشل التسليم</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mb-4" />
          <p className="text-lg font-medium">جارِ تحميل الطلبات...</p>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">رقم الطلب</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>طريقة الدفع</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
                  <TableCell>{order.customer?.name || 'غير متاح'}</TableCell>
                  <TableCell>{order.customer?.email || 'غير متاح'}</TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(order.total_amount)}</TableCell>
                  <TableCell>{order.payment_method}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      <Badge variant="outline" className={getStatusColor(order.status)}>
                        {translateStatus(order.status)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 items-center">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrderId(order.id)}
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-lg h-[80vh] overflow-y-auto">
                          <SheetHeader>
                            <SheetTitle className="text-right">تفاصيل الطلب #{order.id.substring(0, 8)}</SheetTitle>
                          </SheetHeader>
                          <OrderDetails orderId={order.id} onStatusUpdate={refetch} />
                        </SheetContent>
                      </Sheet>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChangeRow(order.id, value)}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue placeholder="الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={PENDING}>قيد الانتظار</SelectItem>
                          <SelectItem value={PAID}>تم الدفع</SelectItem>
                          <SelectItem value={PROCESSING}>قيد المعالجة</SelectItem>
                          <SelectItem value={READY_FOR_SHIPPING}>جاهز للشحن</SelectItem>
                          <SelectItem value={READY_FOR_PICKUP}>جاهز للاستلام</SelectItem>
                          <SelectItem value={SHIPPED}>تم الشحن</SelectItem>
                          <SelectItem value={OUT_FOR_DELIVERY}>في الطريق للتسليم</SelectItem>
                          <SelectItem value={DELIVERED}>مكتمل</SelectItem>
                          <SelectItem value={CANCELLED}>ملغي</SelectItem>
                          <SelectItem value={FAILED_DELIVERY}>فشل التسليم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="py-24 text-center">
          <FileX className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
            {searchTerm || statusFilter !== 'all' ? 
              "لا يوجد طلبات مطابقة" : 
              "لا يوجد طلبات"
            }
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchTerm || statusFilter !== 'all' ? 
              "لم نتمكن من العثور على طلبات تطابق عملية البحث أو الفلتر" : 
              "لم يتم استلام أي طلبات بعد"
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
