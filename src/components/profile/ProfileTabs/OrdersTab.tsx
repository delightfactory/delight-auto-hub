import React from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Calendar, Clock, TrendingUp, RefreshCw, CheckCircle, XCircle, AlertCircle, Truck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { cancelOrder } from "@/services/orderService";
import { ProductService } from "@/services/productService";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Constants } from '@/integrations/supabase/types';

interface OrdersTabProps {
  orders: any[];
  loadingOrders: boolean;
  refreshOrders: () => Promise<void>;
}

const { order_status_expanded_enum: ORDER_STATUSES } = Constants.public.Enums;
const [PENDING, PAID, PROCESSING, READY_FOR_SHIPPING, READY_FOR_PICKUP, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, FAILED_DELIVERY] = ORDER_STATUSES;

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
      return <CheckCircle className="h-6 w-6 text-green-600" />;
    case SHIPPED:
    case OUT_FOR_DELIVERY:
      return <Truck className="h-6 w-6 text-blue-600" />;
    case READY_FOR_SHIPPING:
    case READY_FOR_PICKUP:
    case PROCESSING:
      return <Clock className="h-6 w-6 text-orange-600" />;
    case PAID:
    case PENDING:
      return <Clock className="h-6 w-6 text-yellow-600" />;
    case CANCELLED:
    case FAILED_DELIVERY:
      return <XCircle className="h-6 w-6 text-red-600" />;
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

const OrdersTab: React.FC<OrdersTabProps> = ({ orders, loadingOrders, refreshOrders }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  return (
    <motion.div
      key="orders"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-4 flex items-center">
        <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg ml-3">
          <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">طلباتي</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">تتبع وإدارة طلباتك السابقة</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-auto hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center gap-1"
          onClick={refreshOrders}
        >
          <RefreshCw className="h-4 w-4" />
          <span>تحديث</span>
        </Button>
      </div>
      
      <Card className="border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-blue-600 dark:text-blue-400 ml-2" />
            <CardTitle className="text-lg">سجل الطلبات</CardTitle>
          </div>
          <CardDescription>استعرض وتتبع حالة جميع طلباتك السابقة</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingOrders ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400 animate-pulse">جاري تحميل الطلبات...</p>
            </div>
          ) : orders.length === 0 ? (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-blue-50 dark:bg-blue-900/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-12 w-12 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">لا توجد طلبات بعد</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">لم تقم بأي طلبات حتى الآن. يمكنك تصفح منتجاتنا وإضافة ما يناسبك إلى سلة التسوق.</p>
              <Button 
                variant="default" 
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                onClick={() => navigate('/products')}
              >
                <ShoppingBag className="h-4 w-4 ml-2" />
                تصفح المنتجات
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <motion.div 
                  key={order.id} 
                  className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex flex-wrap justify-between items-start mb-4">
                    <div className="flex items-start">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg ml-3">
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <div className="flex items-center mb-1">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            رقم الطلب: 
                          </h4>
                          <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-sm ml-1">
                            {order.id.substring(0, 8)}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3 w-3 ml-1" />
                          {new Date(order.created_at).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                          <span className="mx-1">•</span>
                          <Clock className="h-3 w-3 ml-1" />
                          {new Date(order.created_at).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span 
                        className={`inline-flex items-center px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        {translateStatus(order.status)}
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
                  
                  <div className="flex flex-wrap items-center mt-4 gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs flex items-center gap-1 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        >
                          <Package className="h-3 w-3" />
                          تفاصيل الطلب
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-xl">
                            <Package className="h-5 w-5 text-blue-600" />
                            تفاصيل الطلب
                          </DialogTitle>
                          <DialogDescription className="flex items-center">
                            <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-sm">
                              {order.id}
                            </span>
                            <span className="mx-2">•</span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              {new Date(order.created_at).toLocaleDateString('ar-EG', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="mt-4">
                          <div className="flex items-center mb-3">
                            <div className={`h-2 w-2 rounded-full mr-2 ${getStatusColor(order.status)}`}></div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300">
                              حالة الطلب: 
                              <span className="font-normal">
                                {translateStatus(order.status)}
                              </span>
                            </h4>
                          </div>
                          
                          <Separator className="my-4" />
                          
                          <h4 className="font-medium mb-3 text-gray-900 dark:text-white flex items-center">
                            <ShoppingBag className="h-4 w-4 ml-2 text-blue-600" />
                            عناصر الطلب
                          </h4>
                          
                          <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                                <tr>
                                  <th className="py-3 px-4 text-right font-medium text-gray-700 dark:text-gray-300">المنتج</th>
                                  <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">السعر</th>
                                  <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">الكمية</th>
                                  <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">الإجمالي</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.order_items?.map((item: any) => {
                                  const product = ProductService.getProductById(item.product_id);
                                  return (
                                    <tr key={item.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                      <td className="py-3 px-4 flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-md overflow-hidden border border-gray-200 dark:border-gray-800 flex-shrink-0">
                                          <img src={product?.image || 'https://placehold.co/40'} alt={product?.name} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">{product?.name || item.product_name}</span>
                                      </td>
                                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{item.product_price} ريال</td>
                                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{item.quantity}</td>
                                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{item.product_price * item.quantity} ريال</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                              <tfoot className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800">
                                <tr>
                                  <td colSpan={3} className="py-3 px-4 text-right font-medium text-gray-700 dark:text-gray-300">الإجمالي الكلي:</td>
                                  <td className="py-3 px-4 font-bold text-lg text-blue-600 dark:text-blue-400">{order.total_amount} ريال</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {order.status === PENDING && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="text-xs flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white"
                        onClick={async () => {
                          if (!confirm('هل أنت متأكد من إلغاء الطلب؟')) return;
                          try {
                            await cancelOrder(order.id);
                            toast({
                              title: "تم إلغاء الطلب",
                              description: "تم إلغاء طلبك بنجاح",
                            });
                            await refreshOrders();
                          } catch {
                            toast({
                              title: "خطأ",
                              description: "فشل في إلغاء الطلب",
                            });
                          }
                        }}
                      >
                        <XCircle className="h-3 w-3" />
                        إلغاء الطلب
                      </Button>
                    )}
                    
                    {order.status === DELIVERED && (
                      <Button
                        variant="default"
                        size="sm"
                        className="text-xs flex items-center gap-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
                        onClick={() => {
                          // Reorder
                          toast({
                            title: "قريباً",
                            description: "سيتم إضافة هذه الميزة قريباً",
                          });
                        }}
                      >
                        <RefreshCw className="h-3 w-3" />
                        إعادة الطلب
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OrdersTab;
