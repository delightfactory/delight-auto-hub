import React, { useRef, useEffect, useState, useCallback, memo, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDebounceCallback } from '../../utils/reactPerformance';
import { ProgressiveImage } from './ProgressiveImage';
import { optimizeScroll, applyPassiveScroll } from '../../utils/scrollOptimizer';
import { ShoppingCart, Heart, Star, Tag, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/context/CartContext';

// استيراد نوع ProductDisplay من المكان الصحيح في المشروع
interface Product {
  id: string;
  name: string;
  price: string | number; // تعديل لدعم السعر كنص أو رقم
  image: string;
  description?: string;
  category?: string;
  originalPrice?: string; // إضافة السعر الأصلي
  rating?: number; // تقييم المنتج
  isNew?: boolean; // إذا كان المنتج جديد
  isFeatured?: boolean; // إذا كان المنتج مميز
  inStock?: boolean; // توفر المنتج
}

interface VirtualizedProductGridProps {
  products: Product[];
  onProductClick?: (product: Product) => void;
  className?: string;
  columns?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  gap?: number;
  estimateSize?: number;
  maxHeight?: string | number; // إضافة خاصية للتحكم في الارتفاع الأقصى
  useWindowScroll?: boolean; // إضافة خاصية للتحكم في استخدام تمرير النافذة
}

export const VirtualizedProductGrid: React.FC<VirtualizedProductGridProps> = ({
  products,
  onProductClick,
  className = '',
  columns: columnsProp,
  gap = 4,
  estimateSize = 300,
  maxHeight = 'auto', // القيمة الافتراضية هي auto لاستخدام الارتفاع الديناميكي
  useWindowScroll = true, // استخدام تمرير النافذة بشكل افتراضي
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [parentWidth, setParentWidth] = useState(0);
  const { toast } = useToast();
  const cart = useCart();
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: categoryService.getCategories });
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach(c => { map[c.id] = c.name; });
    return map;
  }, [categories]);
  
  // حساب عدد الأعمدة بناءً على عرض الشاشة وخيارات المستخدم
  const getColumnsCount = (width: number) => {
    if (columnsProp) {
      if (width < 640) return columnsProp.default || 1;
      if (width < 768) return columnsProp.sm || columnsProp.default || 2;
      if (width < 1024) return columnsProp.md || columnsProp.sm || columnsProp.default || 3;
      return columnsProp.lg || columnsProp.md || columnsProp.sm || columnsProp.default || 4;
    }
    
    // القيم الافتراضية إذا لم يتم تحديد الأعمدة
    if (width < 640) return 1; // للشاشات الصغيرة
    if (width < 768) return 2; // للشاشات المتوسطة
    if (width < 1024) return 3; // للشاشات الكبيرة
    return 4; // للشاشات الكبيرة جداً
  };

  const columns = getColumnsCount(parentWidth);
  const rows = Math.ceil(products.length / columns);
  
  // استخدام debounce لتحسين الأداء عند تغيير حجم النافذة
  const [handleResize] = useDebounceCallback(() => {
    if (parentRef.current) {
      setParentWidth(parentRef.current.offsetWidth);
    }
  }, 200);

  useEffect(() => {
    if (parentRef.current) {
      setParentWidth(parentRef.current.offsetWidth);
      
      // تطبيق تحسينات التمرير
      optimizeScroll(parentRef.current);
      
      // تطبيق التمرير المتسلسل
      const cleanupPassiveScroll = applyPassiveScroll(parentRef.current);
      
      return () => {
        cleanupPassiveScroll();
      };
    }
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // حساب الارتفاع التقديري للصف بناءً على حجم الشاشة
  const getEstimatedSize = () => {
    // زيادة الارتفاع التقديري بشكل كبير لضمان عدم تداخل الكروت
    if (parentWidth < 640) { // الهواتف
      return estimateSize + 80; // زيادة كبيرة للهواتف
    } else if (parentWidth < 1024) { // الأجهزة اللوحية
      return estimateSize + 60; // زيادة متوسطة للأجهزة اللوحية
    } else { // الشاشات الكبيرة
      return estimateSize + 40; // زيادة معقولة للشاشات الكبيرة
    }
  };
  
  // إعداد المكون الافتراضي
  const rowVirtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => useWindowScroll ? document.scrollingElement || document.documentElement : parentRef.current,
    estimateSize: getEstimatedSize, // استخدام الدالة الديناميكية لحساب الارتفاع
    overscan: 2, // تقليل عدد الصفوف الإضافية للتحميل المسبق لتحسين الأداء
    scrollToFn: (offset, { behavior }) => {
      // تحسين وظيفة التمرير
      const scrollElement = useWindowScroll 
        ? document.scrollingElement || document.documentElement 
        : parentRef.current;
      if (!scrollElement) return;

      // استخدام التمرير السلس فقط عند الطلب
      scrollElement.scrollTo({
        top: offset,
        behavior: behavior || 'auto'
      });
    },
  });

  // استخدام memo لتخزين العناصر المرئية
  const memoizedVirtualItems = React.useMemo(() => {
    return rowVirtualizer.getVirtualItems();
  }, [rowVirtualizer.getVirtualItems()]);

  return (
    <div
      ref={parentRef}
      className={`w-full ${useWindowScroll ? '' : 'overflow-auto'} ${className}`}
      style={{
        height: useWindowScroll ? 'auto' : typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        contain: useWindowScroll ? 'content' : 'strict',
        willChange: 'transform',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain', // تحسين سلوك التمرير الزائد
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: useWindowScroll ? 'relative' : 'relative',
          margin: '0 auto', // توسيط المحتوى
        }}
      >
        {memoizedVirtualItems.map((virtualRow) => {
          const rowIndex = virtualRow.index;
          
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: `${gap * 0.75}rem`,
                padding: '1rem 0.5rem'
              }}
            >
              {Array.from({ length: columns }).map((_, columnIndex) => {
                const productIndex = rowIndex * columns + columnIndex;
                const product = products[productIndex];
                
                if (!product) return null;
                
                return (
                  <motion.div
                    key={product.id}
                    onClick={() => onProductClick?.(product)}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer group relative flex flex-col h-full min-h-[320px] sm:min-h-[380px] mb-8 sm:mb-10"
                    style={{
                      transform: 'translateZ(0)',
                      backfaceVisibility: 'hidden',
                      contain: 'content',
                      marginBottom: '1rem', // تأكيد إضافي على المسافة السفلية
                    }}
                    whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* شريط المنتج الجديد فقط */}
                    
                    {/* شريط المنتج الجديد */}
                    {product.isNew && !product.originalPrice && (
                      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-600 to-green-500 text-white py-1 z-10 flex items-center justify-center gap-1 shadow-sm">
                        <TrendingUp className="w-3 h-3" />
                        <span className="font-bold text-xs">منتج جديد</span>
                      </div>
                    )}
                    
                    {/* قسم الصورة والمعلومات الرئيسية */}
                    <div className="flex flex-col sm:flex-row p-2 pt-3">
                      {/* صورة المنتج - مساحة متوازنة */}
                      <div className="relative w-[120px] h-[120px] sm:w-1/3 sm:aspect-square overflow-hidden rounded-md flex-shrink-0">
                        <ProgressiveImage
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          placeholderColor="#f3f4f6"
                          width="100%"
                          height="100%"
                        />
                        
                        {/* تم نقل مؤشر التوفر خارج الصورة */}
                      </div>
                      
                      {/* معلومات المنتج الرئيسية */}
                      <div className="flex-1 pr-2 flex flex-col justify-between">
                        {/* الفئة */}
                        <div>
                          <span className="text-[10px] bg-delight-50 dark:bg-delight-900/30 text-delight-700 dark:text-delight-300 px-1.5 py-0.5 rounded-sm">
                            {categoryMap[product.category] || 'منتجات متنوعة'}
                          </span>
                          {product.inStock !== false ? (
                            <span className="text-[10px] bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-300 px-1.5 py-0.5 rounded-sm mr-1">
                              متوفر
                            </span>
                          ) : (
                            <span className="text-[10px] bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-300 px-1.5 py-0.5 rounded-sm mr-1">
                              غير متوفر
                            </span>
                          )}
                        </div>
                        
                        {/* التقييم والسعر */}
                        <div>
                          {product.rating && (
                            <div className="flex items-center gap-0.5 mb-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3 h-3 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">
                                ({product.rating})
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-bold text-delight-600 dark:text-delight-400">
                              {typeof product.price === 'number' 
                                ? `${product.price.toFixed(2)} ج.م` 
                                : product.price}
                            </span>
                            
                            {product.originalPrice && (
                              <span className="text-xs text-red-500 dark:text-red-400 line-through">
                                {typeof product.originalPrice === 'string' 
                                  ? product.originalPrice.replace('ر.س', 'ج.م') 
                                  : `${product.originalPrice} ج.م`}
                              </span>
                            )}
                          </div>
                          
                          {/* معلومات الخصم ومبلغ التوفير */}
                          {product.originalPrice && (() => {
                            const originalPrice = typeof product.originalPrice === 'string' 
                              ? parseFloat(product.originalPrice.replace(/[^\d.]/g, '')) 
                              : parseFloat(product.originalPrice);
                            const currentPrice = typeof product.price === 'string' 
                              ? parseFloat(product.price.replace(/[^\d.]/g, '')) 
                              : parseFloat(String(product.price));
                            const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
                            const savings = originalPrice - currentPrice;
                            
                            return (
                              <div className="mt-1 flex items-center gap-1 flex-wrap">
                                <span className="text-[10px] bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-300 px-1 py-0.5 rounded-sm font-bold inline-flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                                  </svg>
                                  خصم {discount}%
                                </span>
                                <span className="text-[10px] bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-300 px-1 py-0.5 rounded-sm font-bold inline-flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V5a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  وفرت {savings.toFixed(2)} ج.م
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                    
                    {/* وصف المنتج مختصر */}
                    <div className="px-3 py-2">
                      <h3 className="font-bold text-gray-800 dark:text-white truncate text-sm mb-2">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 min-h-[32px]">
                        {product.description || 'وصف المنتج غير متوفر'}
                      </p>
                    </div>
                    
                    {/* ميزات المنتج السريعة */}
                    <div className="px-3 py-2 flex flex-wrap gap-1.5 mb-2">
                      <span className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        شحن سريع
                      </span>
                      <span className="text-[10px] bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        ضمان سنة
                      </span>
                      <span className="text-[10px] bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        أصلي 100%
                      </span>
                    </div>
                    
                    {/* شريط الإجراءات */}
                    <div className="mt-auto p-3 pt-2 flex gap-2 w-full sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                      <button 
                        className="flex-1 bg-delight-600 hover:bg-delight-700 text-white py-1.5 px-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 transform hover:scale-105 active:scale-95 min-w-[100px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          // إضافة للسلة
                          try {
                            cart.addItem({
                              id: product.id,
                              name: product.name,
                              price: typeof product.price === 'number' ? `${product.price} ج.م` : product.price,
                              image: product.image
                            });
                            // إظهار إشعار بدلاً من alert
                            toast({
                              title: "تمت الإضافة إلى السلة",
                              description: `تم إضافة ${product.name} إلى سلة التسوق`,
                              variant: "success",
                            });
                          } catch (error) {
                            console.error('خطأ في إضافة المنتج للسلة:', error);
                            toast({
                              title: "خطأ في الإضافة",
                              description: `حدث خطأ أثناء إضافة ${product.name} إلى سلة التسوق`,
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <ShoppingCart className="w-3 h-3" />
                        إضافة للسلة
                      </button>
                      
                      <button 
                        className={`bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 p-1.5 rounded-md transition-colors transform hover:scale-110 active:scale-95 ${favorites[product.id] ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : ''} flex-shrink-0`}
                        onClick={(e) => {
                          e.stopPropagation();
                          // إضافة/إزالة من المفضلة
                          setFavorites(prev => {
                            const newFavorites = { ...prev };
                            newFavorites[product.id] = !prev[product.id];
                            
                            if (newFavorites[product.id]) {
                              toast({
                                title: "تمت الإضافة إلى المفضلة",
                                description: `تم إضافة ${product.name} إلى المفضلة`,
                                variant: "success",
                              });
                            } else {
                              toast({
                                title: "تمت الإزالة من المفضلة",
                                description: `تم إزالة ${product.name} من المفضلة`,
                                variant: "default",
                              });
                            }
                            
                            return newFavorites;
                          });
                        }}
                      >
                        <Heart className={`w-4 h-4 ${favorites[product.id] ? 'fill-red-500 text-red-500' : 'hover:fill-red-500 hover:text-red-500'}`} />
                      </button>
                      
                      <button 
                        className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 p-1.5 rounded-md transition-colors transform hover:scale-110 active:scale-95 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          // مشاركة المنتج
                          try {
                            // نسخ الرابط للمشاركة
                            const productUrl = `${window.location.origin}/products/${product.id}`;
                            navigator.clipboard.writeText(productUrl).then(() => {
                              toast({
                                title: "تم النسخ",
                                description: `تم نسخ رابط ${product.name} إلى الحافظة`,
                                variant: "success",
                              });
                            });
                          } catch (error) {
                            console.error('خطأ في نسخ الرابط:', error);
                            // الطريقة البديلة للنسخ
                            const dummyElement = document.createElement('textarea');
                            dummyElement.value = `${window.location.origin}/products/${product.id}`;
                            document.body.appendChild(dummyElement);
                            dummyElement.select();
                            document.execCommand('copy');
                            document.body.removeChild(dummyElement);
                            
                            toast({
                              title: "تم النسخ",
                              description: `تم نسخ رابط ${product.name} إلى الحافظة`,
                              variant: "success",
                            });
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </button>
                    </div>
                    

                  </motion.div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
