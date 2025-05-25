import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  ArrowLeft, 
  Package, 
  CreditCard,
  Truck,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Checkout from '@/components/Checkout';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

// PageHeader تمت إزالته لتوفير مساحة عرض

const CartPage: React.FC = () => {
  const { items, total, updateQuantity, removeItem, itemCount } = useCart();
  const { user } = useAuth();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -100, transition: { duration: 0.3 } }
  };

  if (items.length === 0) {
    return (
      <div>
        {/* PageHeader تمت إزالته */}
        
        <section className="py-16">
          <div className="container-custom">
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-32 h-32 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-16 w-16 text-gray-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4">سلة التسوق فارغة</h2>
              <p className="text-gray-600 mb-8 text-lg">
                لم تقم بإضافة أي منتجات إلى سلة التسوق بعد
              </p>
              <Link to="/products">
                <Button size="lg" className="text-lg">
                  تصفح المنتجات
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      {/* PageHeader تمت إزالته */}
      
      <section className="py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      className="bg-white rounded-xl shadow-sm p-6 border"
                    >
                      <div className="flex items-center gap-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-1 truncate">
                            {item.name}
                          </h3>
                          <p className="text-delight-600 font-bold text-lg">
                            {item.price}
                          </p>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border rounded-lg">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="px-3 py-1 font-medium min-w-[40px] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Item Total */}
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">المجموع الفرعي:</span>
                          <span className="font-bold text-lg">
                            {parseInt(item.price.replace(/\D/g, '')) * item.quantity} جنيه
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
              
              {/* Continue Shopping */}
              <div className="mt-8">
                <Link to="/products">
                  <Button variant="outline" size="lg">
                    <ArrowLeft className="ml-2 h-5 w-5" />
                    متابعة التسوق
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6 border sticky top-4"
              >
                <h3 className="text-xl font-bold mb-6">ملخص الطلب</h3>
                
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="truncate ml-2">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        {parseInt(item.price.replace(/\D/g, '')) * item.quantity} جنيه
                      </span>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">المجموع الفرعي:</span>
                    <span className="font-medium">{total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الشحن:</span>
                    <span className="font-medium">15 جنيه</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>الإجمالي:</span>
                    <span className="text-delight-600">
                      {parseInt(total.replace(/\D/g, '')) + 15} جنيه
                    </span>
                  </div>
                </div>
                
                {/* Checkout Button */}
                <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-6" size="lg">
                      <CreditCard className="ml-2 h-5 w-5" />
                      إتمام الطلب
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
                    <Checkout onClose={() => setCheckoutOpen(false)} />
                  </DialogContent>
                </Dialog>
                
                {/* Security Features */}
                <div className="mt-6 pt-6 border-t space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="ml-2 h-4 w-4 text-green-500" />
                    <span>دفع آمن ومحمي</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Truck className="ml-2 h-4 w-4 text-blue-500" />
                    <span>شحن سريع لجميع المحافظات</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="ml-2 h-4 w-4 text-orange-500" />
                    <span>ضمان جودة المنتجات</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CartPage;
