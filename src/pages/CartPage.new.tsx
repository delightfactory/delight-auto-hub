import React, { useState, useEffect } from 'react';
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
  Shield,
  Wallet,
  Tag,
  Heart,
  Clock,
  Check,
  Percent,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Checkout from '@/components/Checkout';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

const CartPage: React.FC = () => {
  const { items, total, updateQuantity, removeItem, itemCount } = useCart();
  const { user } = useAuth();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [totalSavings, setTotalSavings] = useState<string>('0');
  const [savingsPercentage, setSavingsPercentage] = useState<number>(0);
  const [freeShippingProgress, setFreeShippingProgress] = useState<number>(0);
  const FREE_SHIPPING_THRESHOLD = 500; // الحد الأدنى للشحن المجاني
  const SHIPPING_COST = 15; // تكلفة الشحن العادية

  // حساب إجمالي التوفير والنسبة المئوية
  useEffect(() => {
    let savings = 0;
    let originalTotal = 0;
    
    items.forEach(item => {
      const currentPrice = parseFloat(item.price.replace(/[^\d.]/g, ''));
      const originalPrice = item.originalPrice ? parseFloat(item.originalPrice.replace(/[^\d.]/g, '')) : currentPrice;
      
      if (originalPrice > currentPrice) {
        savings += (originalPrice - currentPrice) * item.quantity;
      }
      
      originalTotal += originalPrice * item.quantity;
    });
    
    setTotalSavings(`${savings.toFixed(2)} جنيه`);
    setSavingsPercentage(originalTotal > 0 ? (savings / originalTotal) * 100 : 0);
    
    // حساب نسبة التقدم نحو الشحن المجاني
    const numericTotal = parseFloat(total.replace(/[^\d.]/g, '')) || 0;
    const progress = Math.min((numericTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
    setFreeShippingProgress(progress);
  }, [items, total]);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };
  
  // التحقق من استحقاق الشحن المجاني
  const isFreeShipping = parseFloat(total.replace(/[^\d.]/g, '')) >= FREE_SHIPPING_THRESHOLD;
  
  // حساب الإجمالي مع الشحن
  const totalWithShipping = parseFloat(total.replace(/[^\d.]/g, '')) + (isFreeShipping ? 0 : SHIPPING_COST);

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
        <section className="py-16">
          <div className="container-custom">
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-40 h-40 mx-auto mb-8 bg-gradient-to-br from-delight-50 to-delight-100 rounded-full flex items-center justify-center shadow-md">
                <ShoppingCart className="h-20 w-20 text-delight-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-delight-900">سلة التسوق فارغة</h2>
              <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                لم تقم بإضافة أي منتجات إلى سلة التسوق بعد. استكشف منتجاتنا واستمتع بعروضنا الحصرية!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/products">
                  <Button size="lg" className="text-lg px-8 py-6 rounded-xl shadow-md transition-all hover:shadow-lg">
                    تصفح المنتجات
                    <ArrowLeft className="mr-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/categories">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6 rounded-xl border-2 hover:bg-delight-50 transition-all">
                    استكشف الفئات
                    <Tag className="mr-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              
              {/* المنتجات المقترحة */}
              <div className="mt-20">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">منتجات قد تعجبك</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* هنا يمكن إضافة منتجات مقترحة من خلال API */}
                  <div className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-all cursor-pointer">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-all cursor-pointer">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-all cursor-pointer">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-all cursor-pointer">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <section className="py-12">
        <div className="container-custom">
          {/* شريط التنقل */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-delight-900 mb-2">سلة التسوق</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-delight-600 transition-colors flex items-center gap-1">
                <Home className="h-3.5 w-3.5" />
                <span>الرئيسية</span>
              </Link>
              <span>/</span>
              <span className="text-delight-600">سلة التسوق</span>
            </div>
          </div>
          
          {/* شريط التقدم نحو الشحن المجاني */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 border mb-8"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-delight-600" />
                <span className="font-medium">الشحن المجاني</span>
              </div>
              <div className="text-sm font-medium">
                {isFreeShipping ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    مؤهل للشحن المجاني
                  </span>
                ) : (
                  <span>
                    أضف <span className="text-delight-600 font-bold">{Math.max(0, FREE_SHIPPING_THRESHOLD - parseFloat(total.replace(/[^\d.]/g, ''))).toFixed(2)}</span> جنيه للحصول على شحن مجاني
                  </span>
                )}
              </div>
            </div>
            <Progress value={freeShippingProgress} className="h-2" />
          </motion.div>
          
          {/* إجمالي التوفير */}
          {savingsPercentage > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-red-50 rounded-xl shadow-sm p-6 border border-red-100 mb-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Percent className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-700">إجمالي التوفير</span>
                </div>
                <div className="text-red-600 font-bold text-lg">
                  {totalSavings} ({savingsPercentage.toFixed(1)}%)
                </div>
              </div>
            </motion.div>
          )}
          
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
                      className="bg-white rounded-xl shadow-sm p-6 border hover:border-delight-200 transition-colors"
                    >
                      <div className="flex items-center gap-6">
                        {/* Product Image */}
                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                            {/* Remove Button */}
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-full"
                              aria-label="إزالة من السلة"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          
                          {/* Mostrar ahorro si hay precio original */}
                          {item.originalPrice && parseFloat(item.originalPrice.replace(/[^\d.]/g, '')) > parseFloat(item.price.replace(/[^\d.]/g, '')) && (
                            <div className="mb-2">
                              <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 gap-1 py-1">
                                <Tag className="h-3 w-3" />
                                توفير {(parseFloat(item.originalPrice.replace(/[^\d.]/g, '')) - parseFloat(item.price.replace(/[^\d.]/g, ''))).toFixed(2)} جنيه
                              </Badge>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-end mt-4">
                            <div className="flex items-center space-x-1 space-x-reverse border rounded-lg overflow-hidden">
                              <button 
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="p-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                                aria-label="تقليل الكمية"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-10 text-center font-medium py-1.5">{item.quantity}</span>
                              <button 
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="p-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                                aria-label="زيادة الكمية"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-lg text-delight-900">
                                {(parseFloat(item.price.replace(/[^\d.]/g, '')) * item.quantity).toFixed(2)} جنيه
                              </div>
                              {item.originalPrice && parseFloat(item.originalPrice.replace(/[^\d.]/g, '')) > parseFloat(item.price.replace(/[^\d.]/g, '')) && (
                                <div className="text-sm text-gray-500 line-through">
                                  {(parseFloat(item.originalPrice.replace(/[^\d.]/g, '')) * item.quantity).toFixed(2)} جنيه
                                </div>
                              )}
                              <div className="text-xs text-gray-500 mt-1">
                                {item.price} / قطعة
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
              
              {/* Continue Shopping */}
              <div className="mt-8">
                <Link to="/products">
                  <Button variant="outline" size="lg" className="gap-2">
                    <ArrowLeft className="h-5 w-5" />
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
                        {(parseFloat(item.price.replace(/[^\d.]/g, '')) * item.quantity).toFixed(2)} جنيه
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
                  
                  {savingsPercentage > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>التوفير:</span>
                      <span className="font-medium">- {totalSavings}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">الشحن:</span>
                    {isFreeShipping ? (
                      <span className="text-green-600 font-medium">مجاني</span>
                    ) : (
                      <span className="font-medium">{SHIPPING_COST} جنيه</span>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>الإجمالي:</span>
                    <span className="text-delight-600">
                      {totalWithShipping.toFixed(2)} جنيه
                    </span>
                  </div>
                </div>
                
                {/* Checkout Button */}
                <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-6 py-6 text-lg" size="lg">
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
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="ml-2 h-4 w-4 text-purple-500" />
                    <span>دعم على مدار الساعة</span>
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
