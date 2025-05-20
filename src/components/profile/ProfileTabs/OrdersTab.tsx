
import React from 'react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

interface OrdersTabProps {
  orders: any[];
  loadingOrders: boolean;
}

const OrdersTab: React.FC<OrdersTabProps> = ({ orders, loadingOrders }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  return (
    <motion.div
      key="orders"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>طلباتي</CardTitle>
          <CardDescription>تتبع وإدارة طلباتك السابقة</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingOrders ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">لا توجد طلبات</h3>
              <p className="text-gray-500 mb-4">لم تقم بأي طلبات حتى الآن</p>
              <Button 
                variant="default" 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => navigate('/products')}
              >
                تصفح المنتجات
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-wrap justify-between items-start mb-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        رقم الطلب: <span className="font-mono">{order.id.substring(0, 8)}</span>
                      </h4>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <span 
                        className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status === 'pending' ? 'قيد الانتظار' :
                         order.status === 'processing' ? 'قيد التجهيز' :
                         order.status === 'completed' ? 'مكتمل' :
                         order.status === 'cancelled' ? 'ملغي' :
                         order.status}
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
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        // View order details
                        toast({
                          title: "قريباً",
                          description: "سيتم إضافة هذه الميزة قريباً",
                        });
                      }}
                    >
                      تفاصيل الطلب
                    </Button>
                    
                    {order.status === 'pending' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          // Cancel order
                          toast({
                            title: "قريباً",
                            description: "سيتم إضافة هذه الميزة قريباً",
                          });
                        }}
                      >
                        إلغاء الطلب
                      </Button>
                    )}
                    
                    {order.status === 'completed' && (
                      <Button
                        variant="default"
                        size="sm"
                        className="text-xs bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => {
                          // Reorder
                          toast({
                            title: "قريباً",
                            description: "سيتم إضافة هذه الميزة قريباً",
                          });
                        }}
                      >
                        إعادة الطلب
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OrdersTab;
