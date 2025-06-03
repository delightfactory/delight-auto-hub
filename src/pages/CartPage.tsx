/** @jsxImportSource react */
import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  ArrowLeft,
  Badge as LucideBadge,
  Check,
  Home,
  CreditCard as CreditCardIcon,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
// Removed Radix Dialog - using built-in Checkout modal
// import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { useCart } from '@/context/CartContext';
import { useQuery } from '@tanstack/react-query';
import { ProductDataService, ProductDisplay } from '@/services/productDataService';
import FreeShippingIndicator from '@/components/shipping/FreeShippingIndicator';

const FREE_SHIPPING_THRESHOLD = 1000;
// تم إزالة تكلفة الشحن الثابتة واستبدالها بنظام ديناميكي

// تنسيق العملة مع ضمان ظهور الأرقام باللغة الإنجليزية
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(value);

const CartPage: React.FC = () => {
  const { items, total: totalString, updateQuantity, removeItem } = useCart();
  const total = useMemo(() => parseFloat(totalString.replace(/[^\d.]/g, '')) || 0, [totalString]);
  const navigate = useNavigate();

  const { data: featured = [], isLoading: loadingFeatured } = useQuery<ProductDisplay[], Error>({
    queryKey: ['featuredProducts'],
    queryFn: () => ProductDataService.getFeaturedProducts(),
  });

  const freeShipping = useMemo(() => total >= FREE_SHIPPING_THRESHOLD, [total]);
  const freeShippingProgress = useMemo(
    () => Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100),
    [total]
  );

  // حساب التوفير والخصم لكل منتج والإجمالي
  const { savingsAmount, savingsPercent, itemSavings } = useMemo(() => {
    let totalSavings = 0;
    let originalTotal = 0;
    const parse = (s: string) => parseFloat(s.replace(/[^\d.]/g, '')) || 0;
    
    // حساب التوفير لكل منتج
    const itemSavingsMap = items.map(item => {
      const curr = parse(item.price);
      const orig = item.originalPrice ? parse(item.originalPrice) : curr;
      const itemOriginalTotal = orig * item.quantity;
      originalTotal += itemOriginalTotal;
      
      let itemSaving = 0;
      let itemSavingPercent = 0;
      
      if (orig > curr) {
        itemSaving = (orig - curr) * item.quantity;
        itemSavingPercent = (orig - curr) / orig * 100;
        totalSavings += itemSaving;
      }
      
      return {
        id: item.id,
        saving: itemSaving,
        savingPercent: itemSavingPercent,
        originalPrice: orig,
        currentPrice: curr,
        originalTotal: itemOriginalTotal,
        currentTotal: curr * item.quantity
      };
    });
    
    return { 
      savingsAmount: totalSavings, 
      savingsPercent: originalTotal > 0 ? (totalSavings / originalTotal) * 100 : 0,
      itemSavings: itemSavingsMap
    };
  }, [items]);

  // الإجمالي بدون الشحن - سيتم حساب تكلفة الشحن في مكون الدفع
  const totalWithoutShipping = useMemo(
    () => total,
    [total]
  );

  const handleQuantity = useCallback(
    (id: string, qty: number) => {
      if (qty < 1) removeItem(id);
      else updateQuantity(id, qty);
    },
    [removeItem, updateQuantity]
  );

  if (items.length === 0) {
    return (
      <section className="py-8 md:py-16">
        <div className="container-custom text-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mx-auto mb-6 w-28 h-28 md:w-36 md:h-36 bg-gradient-to-br from-delight-50 to-delight-100 rounded-full flex items-center justify-center shadow-md">
              <ShoppingCart className="h-14 w-14 md:h-16 md:w-16 text-delight-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-delight-900">سلة التسوق فارغة</h2>
            <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8">لم تقم بإضافة أي منتجات بعد. استكشف منتجاتنا الآن!</p>
            <div className="flex justify-center gap-4">
              <Link to="/products">
                <Button size="sm" className="h-9 px-4 text-sm md:h-10 md:px-5 md:text-base">تصفح المنتجات <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" /></Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 md:py-8 lg:py-12">
      <div className="container-custom grid md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 px-4">
        <div className="md:col-span-2 space-y-4 md:space-y-6">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-delight-900">سلة التسوق</h1>
          <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
            <AnimatePresence>
              {items.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  layout
                  className="flex gap-3 md:gap-4 bg-white p-3 md:p-4 rounded-lg shadow-sm relative"
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                >
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="إزالة المنتج"
                  >
                    <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                  <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm md:text-base text-delight-900 mb-1 pr-6">{item.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-1">
                      {(() => {
                        // البحث عن معلومات التوفير لهذا المنتج
                        const itemSaving = itemSavings.find(s => s.id === item.id);
                        
                        if (itemSaving && itemSaving.saving > 0) {
                          const percent = Math.round(itemSaving.savingPercent);
                          return (
                            <>
                              <Badge variant="outline" className="text-xs md:text-sm bg-green-50 text-green-700 border-green-200">
                                خصم {percent}%
                              </Badge>
                              <Badge variant="outline" className="text-xs md:text-sm bg-green-50 text-green-700 border-green-200">
                                وفرت {formatCurrency(itemSaving.saving)}
                              </Badge>
                            </>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <div className="flex items-center justify-between mt-2 md:mt-3">
                      <div className="flex items-center border rounded overflow-hidden h-7 md:h-8">
                        <button onClick={() => handleQuantity(item.id, item.quantity - 1)} className="px-1.5 md:px-2 h-full flex items-center justify-center"><Minus className="h-3 w-3 md:h-4 md:w-4" /></button>
                        <span className="px-2 md:px-3 text-sm md:text-base">{item.quantity}</span>
                        <button onClick={() => handleQuantity(item.id, item.quantity + 1)} className="px-1.5 md:px-2 h-full flex items-center justify-center"><Plus className="h-3 w-3 md:h-4 md:w-4" /></button>
                      </div>
                      <div className="text-right">
                        {(() => {
                          const itemSaving = itemSavings.find(s => s.id === item.id);
                          return (
                            <>
                              <div className="font-semibold text-sm md:text-base lg:text-lg text-delight-900">
                                {formatCurrency((parseFloat(item.price.replace(/[^\d.]/g, '')) || 0) * item.quantity)}
                              </div>
                              {itemSaving && itemSaving.saving > 0 && (
                                <div className="text-xs md:text-sm text-gray-500 line-through">
                                  {formatCurrency(itemSaving.originalTotal)}
                                </div>
                              )}
                              <div className="text-xs md:text-sm text-gray-500">
                                {formatCurrency(parseFloat(item.price.replace(/[^\d.]/g, '')) || 0)} / قطعة
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          <Link to="/products">
            <Button variant="outline" size="sm" className="h-8 md:h-9 px-3 md:px-4 text-xs md:text-sm gap-1 md:gap-2">متابعة التسوق <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" /></Button>
          </Link>
        </div>

        <div className="space-y-4 md:space-y-6 sticky top-4">
          <div className="bg-white p-4 md:p-5 rounded-lg md:rounded-xl shadow">
            <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">ملخص الطلب</h2>
            <div className="space-y-1.5 md:space-y-2 max-h-40 md:max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {items.map(item => {
                const itemSaving = itemSavings.find(s => s.id === item.id);
                return (
                  <div key={item.id} className="flex flex-col text-xs md:text-sm mb-2">
                    <div className="flex justify-between">
                      <span className="truncate ml-2">{item.name} × {item.quantity}</span>
                      <span className="flex-shrink-0">{formatCurrency((parseFloat(item.price.replace(/[^\d.]/g, '')) || 0) * item.quantity)}</span>
                    </div>
                    {itemSaving && itemSaving.saving > 0 && (
                      <div className="flex justify-between text-green-600 text-xs">
                        <span className="mr-4">وفرت</span>
                        <span>{formatCurrency(itemSaving.saving)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <Separator className="my-3 md:my-4" />
            
            {/* ملخص الأسعار والتوفير */}
            <div className="space-y-2">
              {savingsAmount > 0 && (
                <div className="flex justify-between text-xs md:text-sm text-gray-500">
                  <span>السعر قبل الخصم</span>
                  <span className="line-through">{formatCurrency(total + savingsAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs md:text-sm"><span>المجموع بعد الخصم</span><span>{formatCurrency(total)}</span></div>
              {savingsAmount > 0 && (
                <div className="flex justify-between text-xs md:text-sm bg-green-50 p-2 rounded-md text-green-700">
                  <span className="font-medium">إجمالي التوفير</span>
                  <span dir="ltr" className="font-medium">{formatCurrency(savingsAmount)} ({Math.round(savingsPercent)}%)</span>
                </div>
              )}
            </div>
            <div className="flex justify-between text-xs md:text-sm"><span>الشحن</span><span className="text-gray-500">يتم حسابه عند الدفع</span></div>
            <Separator className="my-3 md:my-4" />
            <div className="flex justify-between font-bold text-sm md:text-base lg:text-lg"><span>الإجمالي</span><span dir="ltr">{formatCurrency(totalWithoutShipping)}</span></div>
            <div className="text-xs text-gray-500 mt-1 text-center">* سيتم إضافة تكلفة الشحن حسب المدينة عند إتمام الطلب</div>
            <Button 
              onClick={() => navigate('/checkout')} 
              size="sm" 
              className="w-full mt-3 md:mt-4 h-9 md:h-10 text-xs md:text-sm flex justify-center items-center gap-1 md:gap-2"
            >
              إتمام الطلب <CreditCardIcon className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Button>
          </div>

          {/* Free Shipping Bar - استخدام المكون الجديد */}
          <FreeShippingIndicator currentTotal={total} threshold={FREE_SHIPPING_THRESHOLD} />
        </div>
      </div>
    </section>
  );
};

export default CartPage;