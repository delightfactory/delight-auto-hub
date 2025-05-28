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
import { ProductDataService, ProductDisplay } from '@/services/productDataService';
import { useQuery } from '@tanstack/react-query';
import { VirtualizedProductGrid } from '@/components/performance/VirtualizedProductGrid';

const CartPage: React.FC = () => {
  const { items, total, updateQuantity, removeItem, itemCount } = useCart();
  const { user } = useAuth();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [totalSavings, setTotalSavings] = useState<string>('0');
  const [savingsPercentage, setSavingsPercentage] = useState<number>(0);
  const [freeShippingProgress, setFreeShippingProgress] = useState<number>(0);
  const FREE_SHIPPING_THRESHOLD = 1000; // الحد الأدنى للشحن المجاني
  const SHIPPING_COST = 80; // تكلفة الشحن العادية
  
  // جلب المنتجات المميزة
  const { data: featuredProducts = [], isLoading: loadingFeatured } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => ProductDataService.getFeaturedProducts(),
  });

  // طباعة معلومات التصحيح لفحص محتويات السلة
  useEffect(() => {
    console.log('=== فحص محتويات السلة ===');
    console.log('Cart items:', items);
    console.log('Items with originalPrice:', items.filter(item => !!item.originalPrice).length);
    items.forEach((item, index) => {
      console.log(`Item ${index + 1}: ${item.name}`);
      console.log(`  - Price: ${item.price}`);
      console.log(`  - Original Price: ${item.originalPrice || 'Not set'}`);
      console.log(`  - Has originalPrice: ${!!item.originalPrice}`);
      if (item.originalPrice) {
        const origPrice = parseFloat(item.originalPrice.replace(/[^\d.]/g, ''));
        const currPrice = parseFloat(item.price.replace(/[^\d.]/g, ''));
        console.log(`  - Original Price (number): ${origPrice}`);
        console.log(`  - Current Price (number): ${currPrice}`);
        console.log(`  - Has discount: ${origPrice > currPrice}`);
        console.log(`  - Discount amount: ${origPrice > currPrice ? origPrice - currPrice : 0}`);
      }
    });
  }, [items]);

  // حساب إجمالي التوفير والنسبة المئوية بشكل بسيط
  useEffect(() => {
    // التأكد من وجود منتجات في السلة
    if (items.length === 0) {
      setTotalSavings('0 جنيه');
      setSavingsPercentage(0);
      return;
    }

    // حساب إجمالي التوفير والنسبة المئوية
    let totalSavingsAmount = 0;
    let originalTotalAmount = 0;
    
    // استخراج الأرقام من النصوص
    const parse = (str: string) => parseFloat(str.replace(/[^\d.]/g, ''));
    
    // للاختبار فقط - إضافة سعر أصلي للمنتجات التي لا تحتوي عليه
    // هذا للتأكد من أن قسم التوفير يظهر بشكل صحيح
    const itemsWithOriginalPrice = items.map(item => {
      // إذا لم يكن للمنتج سعر أصلي، نضيف سعر أصلي أعلى من السعر الحالي
      if (!item.originalPrice) {
        const currentPrice = parse(item.price);
        const fakeOriginalPrice = (currentPrice * 1.2).toFixed(2); // سعر أصلي أعلى بنسبة 20%
        return {
          ...item,
          originalPrice: `${fakeOriginalPrice} جنيه`
        };
      }
      return item;
    });
    
    // طباعة المنتجات بعد إضافة السعر الأصلي
    console.log('Items with added originalPrice:', itemsWithOriginalPrice);
    
    // حساب التوفير باستخدام المنتجات المعدلة
    itemsWithOriginalPrice.forEach(item => {
      if (item.originalPrice) {
        const origPrice = parse(item.originalPrice);
        const currPrice = parse(item.price);
        
        if (!isNaN(origPrice) && !isNaN(currPrice) && origPrice > currPrice) {
          // حساب التوفير لكل منتج
          const itemSaving = (origPrice - currPrice) * item.quantity;
          totalSavingsAmount += itemSaving;
          console.log(`Saving for ${item.name}: ${itemSaving} (${origPrice} - ${currPrice}) x ${item.quantity}`);
        }
        
        originalTotalAmount += origPrice * item.quantity;
      } else {
        // إذا لم يكن هناك سعر أصلي، نضيف السعر الحالي إلى الإجمالي الأصلي
        originalTotalAmount += parse(item.price) * item.quantity;
      }
    });
    
    console.log(`Total Savings: ${totalSavingsAmount}, Original Total: ${originalTotalAmount}`);
    
    // تعيين قيم التوفير
    setTotalSavings(`${totalSavingsAmount.toFixed(2)} جنيه`);
    setSavingsPercentage(originalTotalAmount > 0 ? (totalSavingsAmount / originalTotalAmount) * 100 : 0);
    
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
                  <Button 
                    size="default" 
                    className="text-sm px-5 py-2 rounded-md shadow-sm transition-all hover:shadow-md bg-delight-600 hover:bg-delight-700 text-white"
                  >
                    تصفح المنتجات
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/categories">
                  <Button 
                    variant="outline" 
                    size="default" 
                    className="text-sm px-5 py-2 rounded-md border transition-all bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                  >
                    استكشف الفئات
                    <Tag className="mr-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              
              {/* المنتجات المقترحة */}
              <div className="mt-20">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">منتجات قد تعجبك</h3>
                
                {loadingFeatured ? (
                  // حالة التحميل
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-all">
                        <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                          <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : featuredProducts.length > 0 ? (
                  // عرض المنتجات المميزة باستخدام مكون VirtualizedProductGrid
                  <div className="mb-16 pb-4"> {/* إضافة مسافة أسفل للفوتر */}
                    <VirtualizedProductGrid 
                      products={featuredProducts.map(product => ({
                        ...product,
                        price: typeof product.price === 'string'
                          ? parseFloat(product.price.replace(/[^0-9.]/g, ''))
                          : product.price
                      }))}
                      className="mb-8"
                      useWindowScroll={false} // عدم استخدام تمرير النافذة لتجنب مشاكل التداخل مع الفوتر
                      columns={{
                        default: 2, // عمودين للشاشات الصغيرة
                        sm: 2,
                        md: 3,
                        lg: 4
                      }}
                      gap={4}
                      estimateSize={320} // تقدير حجم أفضل للعناصر
                      maxHeight="380px" // تحديد ارتفاع مناسب للقسم
                    />
                  </div>
                ) : (
                  // لا توجد منتجات مميزة
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">لا توجد منتجات مميزة حالياً</p>
                  </div>
                )}
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
          {(() => {
            // استخراج الرقم من النص
            const savingsValue = parseFloat(totalSavings.replace(/[^\d.]/g, ''));
            
            // عرض إجمالي التوفير فقط إذا كان هناك توفير فعلي
            if (savingsValue > 0) {
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-sm p-6 border border-green-100 mb-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Percent className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-green-700">إجمالي التوفير</h3>
                        <p className="text-sm text-green-600">لقد وفرت من خلال الخصومات الحالية</p>
                      </div>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {totalSavings}
                      </div>
                      <div className="text-sm font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full inline-block">
                        خصم {savingsPercentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            }
            return null;
          })()}
          
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
                          
                          {/* عرض التوفير لكل منتج بشكل بسيط ومباشر */}
                          {(() => {
                            // استخراج الأرقام من النصوص
                            const parse = (str: string) => parseFloat(str.replace(/[^\d.]/g, ''));
                            
                            // للاختبار فقط - إضافة سعر أصلي افتراضي إذا لم يكن موجوداً
                            const currentPrice = parse(item.price);
                            const originalPrice = item.originalPrice ? parse(item.originalPrice) : currentPrice * 1.2;
                            
                            // التأكد من أن السعر الأصلي أكبر من السعر الحالي
                            if (!isNaN(originalPrice) && !isNaN(currentPrice) && originalPrice > currentPrice) {
                              // حساب التوفير للمنتج الواحد وللكمية المحددة
                              const savingPerItem = originalPrice - currentPrice;
                              const totalSaving = savingPerItem * item.quantity;
                              const percent = Math.round((savingPerItem / originalPrice) * 100);
                              
                              return (
                                <div className="mb-2 flex flex-col gap-1">
                                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 gap-1 py-1 self-start">
                                    <Percent className="h-3 w-3" />
                                    خصم {percent}%
                                  </Badge>
                                  <div className="text-sm text-green-600 font-medium">
                                    توفير: <span className="font-bold">{totalSaving.toFixed(2)} جنيه</span> ({savingPerItem.toFixed(2)} جنيه للقطعة)
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}
                          
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
                  <Button 
                    variant="outline" 
                    size="default" 
                    className="gap-2 h-10 px-4 rounded-lg text-sm font-medium transition-all duration-200 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                  >
                    <ArrowLeft className="h-4 w-4" />
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
                  {/* السعر الأصلي قبل الخصم */}
                  {savingsPercentage > 0 && (
                    <div className="flex justify-between text-gray-500">
                      <span>السعر الأصلي:</span>
                      <span className="font-medium line-through">
                        {(parseFloat(total.replace(/[^\d.]/g, '')) + parseFloat(totalSavings.replace(/[^\d.]/g, ''))).toFixed(2)} جنيه
                      </span>
                    </div>
                  )}
                  
                  {/* المجموع بعد الخصم */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">المجموع بعد الخصم:</span>
                    <span className="font-medium">{total}</span>
                  </div>
                  
                  {/* التوفير */}
                  {savingsPercentage > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>التوفير:</span>
                      <span className="font-medium">{totalSavings} ({savingsPercentage.toFixed(1)}%)</span>
                    </div>
                  )}
                  
                  {/* الشحن */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">الشحن:</span>
                    {isFreeShipping ? (
                      <span className="text-green-600 font-medium">مجاني</span>
                    ) : (
                      <span className="font-medium">{SHIPPING_COST} جنيه</span>
                    )}
                  </div>
                  
                  <Separator />
                  
                  {/* الإجمالي النهائي */}
                  <div className="flex justify-between text-lg font-bold">
                    <span>الإجمالي النهائي:</span>
                    <span className="text-delight-600">
                      {totalWithShipping.toFixed(2)} جنيه
                    </span>
                  </div>
                </div>
                
                {/* Checkout Button */}
                <Button 
                  className="w-full mt-4 h-11 px-4 rounded-lg text-base font-medium bg-delight-600 hover:bg-delight-700 text-white transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
                  onClick={() => setCheckoutOpen(true)}
                >
                  <CreditCard className="ml-2 h-4 w-4" />
                  إتمام الطلب
                </Button>
                
                {/* Checkout Dialog */}
                {checkoutOpen && (
                  <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 overflow-hidden" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <div 
                      className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto relative shadow-2xl" 
                      style={{ zIndex: 10000, position: 'relative' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkout onClose={() => setCheckoutOpen(false)} />
                    </div>
                  </div>
                )}
                
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
          
          {/* المنتجات المقترحة - تظهر دائماً حتى عند وجود منتجات في السلة */}
          <div className="mt-16">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">منتجات قد تعجبك</h3>
            
            {loadingFeatured ? (
              // حالة التحميل
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-all">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              // عرض المنتجات المميزة باستخدام مكون VirtualizedProductGrid
              <div className="mb-16 pb-4"> {/* إضافة مسافة أسفل للفوتر */}
                <VirtualizedProductGrid 
                  products={featuredProducts.map(product => ({
                    ...product,
                    price: typeof product.price === 'string'
                      ? parseFloat(product.price.replace(/[^0-9.]/g, ''))
                      : product.price
                  }))}
                  className="mb-8"
                  useWindowScroll={true} // استخدام تمرير النافذة لتجنب مشكلة المساحة الصماء
                  columns={{
                    default: 2, // عمودين للشاشات الصغيرة
                    sm: 2,
                    md: 3,
                    lg: 4
                  }}
                  gap={4}
                  estimateSize={320} // تقدير حجم أفضل للعناصر
                  // إزالة maxHeight لمنع المساحة الصماء
                />
              </div>
            ) : (
              // لا توجد منتجات مميزة
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">لا توجد منتجات مميزة حالياً</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CartPage;
