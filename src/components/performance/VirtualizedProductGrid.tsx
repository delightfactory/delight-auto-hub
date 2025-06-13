import React, { useRef, useEffect, useState, useCallback, memo, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDebounceCallback } from '../../utils/reactPerformance';
import { ProgressiveImage } from './ProgressiveImage';
import { optimizeScroll, applyPassiveScroll } from '../../utils/scrollOptimizer';
import { ShoppingCart, Heart, Star, Tag, TrendingUp, AlertTriangle, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/context/CartContext';
import { WishlistService } from '@/services/wishlistService';
import { cn } from '@/lib/utils'; // Importar la función cn para combinar clases
import { useNavigate, useLocation } from 'react-router-dom';

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
  stock?: number; // كمية المخزون المتوفرة
  points_earned?: number; // نقاط مكتسبة
  points_required?: number; // نقاط مطلوبة
  cave_enabled?: boolean; // تفعيل نظام المغارة
  cave_price?: number; // سعر المغارة
  cave_required_points?: number; // نقاط مغارة مطلوبة
  cave_max_quantity?: number; // أقصى كمية للمغارة
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
  const navigate = useNavigate();
  const location = useLocation();
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: categoryService.getCategories });
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach(c => { map[c.id] = c.name; });
    return map;
  }, [categories]);
  
  // حساب عدد الأعمدة بناءً على عرض الشاشة وخيارات المستخدم
  const getColumns = (width: number) => {
    // منتج واحد فقط في كل صف بغض النظر عن حجم الشاشة
    return 1;
  };

  const columns = getColumns(parentWidth);
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

  React.useEffect(() => {
    (async () => {
      try {
        const favs = await WishlistService.getFavorites();
        const favMap: Record<string, boolean> = {};
        favs.forEach(id => { favMap[id] = true; });
        setFavorites(favMap);
      } catch (err: any) {
        if (err.name === 'AuthSessionMissingError' || err.message.includes('session missing') || err.message.includes('يجب تسجيل الدخول')) {
          navigate('/auth', { state: { from: location.pathname } });
          return;
        }
        console.error('Error loading favorites:', err);
      }
    })();
  }, []);

  // إضافة ثوابت ارتفاع البطاقة، شريط الإجراءات والفجوة الرأسية
  const CARD_HEIGHT = 165; // تقليل ارتفاع البطاقة بنسبة 25%
  const ACTION_BAR_HEIGHT = 50; // تقليل ارتفاع شريط الإجراءات
  const ROW_GAP = 24; // زيادة الفجوة بين الصفوف

  // حساب الارتفاع التقديري للصف ليشمل ارتفاع البطاقة وشريط الإجراءات والفجوة
  const getEstimatedSize = () => CARD_HEIGHT + ACTION_BAR_HEIGHT + ROW_GAP;
  
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

  // Definir clases estáticas para evitar problemas de purga de CSS en producción
  const containerClasses = 'relative w-full px-1 sm:px-2 lg:px-3 overflow-x-visible';
  const gridClasses = 'grid gap-4';
  const productCardClasses = 'bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1 cursor-pointer';

  return (
    <div
      ref={parentRef}
      className={cn(containerClasses, className, useWindowScroll ? '' : 'overflow-y-auto overflow-x-visible')}
      style={{
        height: useWindowScroll ? 'auto' : typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        contain: useWindowScroll ? 'content' : 'strict',
        willChange: 'transform',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain' // تحسين سلوك التمرير الزائد
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
          margin: '0 auto', // متمركزة داخل الحاوية
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
                gap: `${ROW_GAP}px`,
                padding: '0'
              }}
            >
              {Array.from({ length: columns }).map((_, columnIndex) => {
                const productIndex = rowIndex * columns + columnIndex;
                const product = products[productIndex];
                
                if (!product) return null;
                
                return (
                  <motion.div
                    key={product.id}
                    className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-visible cursor-pointer group relative grid grid-cols-1 grid-rows-card-layout h-full flex-shrink-0 p-3"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    onClick={() => onProductClick?.(product)}
                  >
                    {/* شريط المنتج الجديد فقط */}
                    
                    {/* شريط المنتج الجديد */}
                    {product.isNew && !product.originalPrice && (
                      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-600 to-green-500 text-white py-1 z-10 flex items-center justify-center gap-1 shadow-sm">
                        <TrendingUp className="w-3 h-3" />
                        <span className="font-bold text-xs">منتج جديد</span>
                      </div>
                    )}
                    
                    {/* قسم الصورة والمعلومات الرئيسية - تم إعادة هيكلته */}
                    <div className="row-start-1 col-span-2 grid grid-cols-product-card items-start gap-2 h-full px-2 py-1">
                      {/* معلومات المنتج على اليسار */}
                      <div className="flex flex-col justify-start space-y-0.5 h-full pr-0.5">
                        {/* الجزء العلوي: الفئة وحالة المخزون */}
                        <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 mb-0.5">
                          <span className="text-[10px] bg-delight-50 dark:bg-delight-900/30 text-delight-700 dark:text-delight-300 px-1 py-0.5 rounded-sm inline-flex items-center">
                            {categoryMap[product.category] || 'منتجات متنوعة'}
                          </span>
                          {/* Stock Status */}
                          {product.inStock === false || (typeof product.stock === 'number' && product.stock <= 0) ? (
                            <span className="stock-badge stock-unavailable">
                              غير متوفر
                            </span>
                          ) : typeof product.stock === 'number' && product.stock < 10 ? (
                            <span className="stock-badge stock-limited">
                              أوشك على النفاذ
                            </span>
                          ) : typeof product.stock === 'number' && product.stock < 50 ? (
                            <span className="stock-badge stock-limited">
                              مخزون منخفض
                            </span>
                          ) : (
                            <span className="stock-badge stock-available">
                              متوفر
                            </span>
                          )}
                        </div>
                        
                        {/* اسم المنتج */}
                        <h3 className="font-semibold text-gray-800 dark:text-white text-base leading-tight line-clamp-2 mt-0 mb-1">
                          {product.name}
                        </h3>

                        {/* Short Description (Moved under Name) */}
                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mt-0 mb-0 min-h-[calc(1.5*1rem)]">
                          {product.description || 'وصف المنتج غير متوفر'}
                        </p>

                        {/* Price Block (Added vertical margin) */}
                        <div className="flex items-baseline gap-1 flex-wrap my-0">
                          <span className="text-md font-bold text-delight-600 dark:text-delight-400">
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
                        
                        {/* Discount & Savings Block (Corrected text) */}
                        {product.originalPrice && (() => {
                          const originalPriceNum = typeof product.originalPrice === 'string' 
                            ? parseFloat(product.originalPrice.replace(/[^\d.]/g, '')) 
                            : parseFloat(String(product.originalPrice));
                          const currentPriceNum = typeof product.price === 'string' 
                            ? parseFloat(product.price.replace(/[^\d.]/g, '')) 
                            : parseFloat(String(product.price));
                          
                          if (!isNaN(originalPriceNum) && !isNaN(currentPriceNum) && originalPriceNum > 0) {
                            const discount = Math.round(((originalPriceNum - currentPriceNum) / originalPriceNum) * 100);
                            const savings = originalPriceNum - currentPriceNum;
                            return (
                              <div className="flex items-center gap-1 flex-wrap -mt-1">
                                {discount > 0 && (
                                <span className="product-badge discount-badge">
                                  خصم {discount}%
                                </span>
                                )}
                                {savings > 0 && (
                                <span className="product-badge savings-badge">
                                  وفر {savings.toFixed(2)} ج.م
                                </span>
                                )}
                              </div>
                            );
                          }
                          return null;
                        })()}

                        {/* عرض النقاط ونظام المغارة */}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.points_earned != null && (
                            <span className="feature-item points-earned-badge">اكسب {product.points_earned} نقطة</span>
                          )}
                          {product.points_required != null && (
                            <span className="feature-item points-required-badge">احصل عليه بـ {product.points_required} نقطة</span>
                          )}
                          {product.cave_price != null && (
                            <span className="feature-item cave-price-badge">سعر المغارة: {product.cave_price} ج.م</span>
                          )}
                          {product.cave_required_points != null && (
                            <span className="feature-item cave-required-points-badge">نقاط مغارة مطلوبة: {product.cave_required_points}</span>
                          )}
                          {product.cave_max_quantity != null && (
                            <span className="feature-item cave-max-quantity-badge">أقصى كمية للمغارة: {product.cave_max_quantity}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* صورة المنتج والتقييم */}
                      <div className="flex flex-col justify-start items-center space-y-1">
                        <div className="relative w-[140px] h-[140px] flex-shrink-0 overflow-hidden rounded-md">
                          <ProgressiveImage
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            placeholderColor="#f3f4f6"
                            width={140}
                            height={140}
                          />
                        </div>
                        <div className="flex items-center justify-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                          {product.rating > 0 && (
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-0.5">
                              ({product.rating.toFixed(1)})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* شريط الإجراءات */}
                    <div className="row-start-2 col-span-2 mt-0.5 flex gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-100 dark:border-gray-700 rounded-b-lg px-3 py-1.5">
                      <button 
                        className={`flex-1 py-1 px-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 transform ${product.inStock === false || (typeof product.stock === 'number' && product.stock <= 0) ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-delight-600 hover:bg-delight-700 text-white hover:scale-105 active:scale-95'}`}
                        disabled={product.inStock === false || (typeof product.stock === 'number' && product.stock <= 0)}
                        title={product.inStock === false || (typeof product.stock === 'number' && product.stock <= 0) ? 'المنتج غير متوفر في المخزون' : 'إضافة إلى سلة التسوق'}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault(); // منع السلوك الافتراضي للزر
                          
                          // التحقق من توفر المنتج في المخزون
                          if (product.inStock === false || (typeof product.stock === 'number' && product.stock <= 0)) {
                            toast({
                              title: "المنتج غير متوفر",
                              description: `عذراً، المنتج ${product.name} غير متوفر في المخزون حالياً.`,
                              variant: "destructive",
                            });
                            return;
                          }
                          
                          // إضافة للسلة
                          try {
                            // إضافة المنتج للسلة
                            cart.addItem({
                              id: product.id,
                              name: product.name,
                              price: typeof product.price === 'number' ? `${product.price} ج.م` : product.price,
                              originalPrice: product.originalPrice ? `${product.originalPrice} ج.م` : undefined,
                              image: product.image,
                              stock: product.stock // إضافة معلومات المخزون للسلة
                            });
                            
                            // إظهار إشعار بدلاً من alert
                            toast({
                              title: "تمت الإضافة إلى السلة",
                              description: `تم إضافة ${product.name} إلى سلة التسوق`,
                              variant: "success",
                            });
                            
                            // منع التمرير لأعلى الصفحة عند إضافة منتج من المنتجات المقترحة
                            // الحفاظ على موضع التمرير الحالي
                            setTimeout(() => {
                              // استخدام setTimeout لضمان تنفيذ هذا الكود بعد أي تحديثات DOM
                              if (window.scrollY) {
                                window.scrollTo({
                                  top: window.scrollY,
                                  behavior: 'auto'
                                });
                              }
                            }, 0);
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
                        {product.inStock === false || (typeof product.stock === 'number' && product.stock <= 0) ? (
                          <>
                            <AlertTriangle className="w-3 h-3 ml-1" />
                            <span>غير متوفر</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3 h-3 ml-1" />
                            <span>إضافة للسلة</span>
                          </>
                        )}
                      </button>
                      
                      <button 
                        className={`bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 p-1.5 rounded-md transition-colors transform hover:scale-110 active:scale-95 ${favorites[product.id] ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : ''} flex-shrink-0`}
                        onClick={async (e) => {
                          e.stopPropagation();
                          const isAdding = !favorites[product.id];
                          try {
                            if (isAdding) await WishlistService.addFavorite(product.id);
                            else await WishlistService.removeFavorite(product.id);
                            setFavorites(prev => ({ ...prev, [product.id]: isAdding }));
                            toast({
                              title: isAdding ? "تمت الإضافة إلى المفضلة" : "تمت الإزالة من المفضلة",
                              description: isAdding
                                ? `تم إضافة ${product.name} إلى المفضلة`
                                : `تم إزالة ${product.name} من المفضلة`,
                              variant: isAdding ? "success" : "default",
                            });
                          } catch (err: any) {
                            if (err.name === 'AuthSessionMissingError' || err.message.includes('session missing') || err.message.includes('يجب تسجيل الدخول')) {
                              navigate('/auth', { state: { from: location.pathname } });
                              return;
                            }
                            console.error("Error toggling favorite:", err);
                            toast({
                              title: "خطأ في المفضلة",
                              description: err.message,
                              variant: "destructive",
                            });
                          }
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
