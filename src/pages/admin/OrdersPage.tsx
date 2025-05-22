import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  Ban
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import OrderDetails from '@/components/admin/OrderDetails';

const OrdersPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  const {
    data: orders = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: orderService.getAllOrders,  // Use getAllOrders instead of getOrders
    staleTime: 1000 * 60 * 5, // 5 minutes
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
        return 'text-green-600 bg-green-100 border-green-300';
      case 'processing':
        return 'text-blue-600 bg-blue-100 border-blue-300';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case 'cancelled':
        return 'text-red-600 bg-red-100 border-red-300';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <Ban className="h-4 w-4 text-red-600" />;
      default:
        return null;
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
  
  // تصفية الطلبات بناءً على مصطلح البحث وحالة الطلب
  const filteredOrders = searchTerm && orders
    ? orders.filter((order: any) =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : orders;

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
              <SelectItem value="pending">قيد الانتظار</SelectItem>
              <SelectItem value="processing">قيد المعالجة</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
              <SelectItem value="cancelled">ملغي</SelectItem>
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
                  <TableCell>{order.total_amount} ر.س</TableCell>
                  <TableCell>{order.payment_method}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {translateStatus(order.status)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
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
                        <SheetContent className="w-full sm:max-w-lg">
                          <SheetHeader>
                            <SheetTitle className="text-right">تفاصيل الطلب #{order.id.substring(0, 8)}</SheetTitle>
                          </SheetHeader>
                          <OrderDetails orderId={order.id} onStatusUpdate={refetch} />
                        </SheetContent>
                      </Sheet>
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
