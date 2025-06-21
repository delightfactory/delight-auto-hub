import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye, Star, Heart, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { toast } from '@/components/ui/use-toast';
import { WishlistService } from '@/services/wishlistService';
import { useAuth } from '@/context/AuthContext';

export interface ProductCardProps {
  descriptionTitle?: string;
  id: string;
  name: string;
  description: string; // الوصف التفصيلي
  image: string;
  className?: string;
  category?: string;
  rating?: number;
  ratingCount?: number;
  price?: string;
  originalPrice?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  stock?: number;
  stockStatusText?: string;
  quickFeatures?: string[];
  points_earned?: number;
  points_required?: number;
  cave_enabled?: boolean;
  cave_price?: number;
  cave_required_points?: number;
  cave_max_quantity?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  description,
  descriptionTitle,
  image,
  className,
  category,
  rating = 4.5,
  ratingCount,
  price = '',
  originalPrice,
  isFeatured = false,
  isNew = false,
  stock = 0,
  stockStatusText,
  quickFeatures = [],
  points_earned,
  points_required,
  cave_enabled = false,
  cave_price,
  cave_required_points,
  cave_max_quantity,
}) => {
  // تم إزالة تعريف featureIcons لتبسيط البادجات وإزالة الأيقونات
  const { addItem, items } = useCart();
  const [isLiked, setIsLiked] = React.useState(false);
  const [isAddedToCart, setIsAddedToCart] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Check if item is already in cart
  React.useEffect(() => {
    const isInCart = items.some(item => item.id === id);
    setIsAddedToCart(isInCart);
  }, [items, id]);

  // جلب حالة المفضلات عند التحميل
  React.useEffect(() => {
    (async () => {
      try {
        const favs = await WishlistService.getFavorites();
        setIsLiked(favs.includes(id));
      } catch (err: unknown) {
        console.error('Error fetching favorites:', err);
        const message = err instanceof Error ? err.message : String(err);
        toast({ title: "حدث خطأ", description: message, variant: "destructive" });
      }
    })();
  }, [id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // التحقق من توفر المنتج في المخزون
    if (stock <= 0) {
      toast({
        title: "المنتج غير متوفر",
        description: `عذراً، المنتج ${name} غير متوفر في المخزون حالياً.`,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    addItem({
      id,
      name,
      price: price || '0 ريال',
      originalPrice: originalPrice, // إضافة السعر الأصلي لحساب التوفير
      image,
    });
    
    // طباعة معلومات المنتج للتصحيح
    console.log(`Added to cart: ${name}, Price: ${price}, Original Price: ${originalPrice}, Stock Status: ${stock > 0 ? 'متوفر' : 'غير متوفر'}`);
    
    setIsAddedToCart(true);
    
    toast({
      title: "تمت الإضافة إلى السلة",
      description: `تمت إضافة ${name} إلى سلة التسوق بنجاح.`,
      duration: 3000,
    });
  };

  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // التأكد من تسجيل الدخول قبل الإضافة أو الإزالة
    if (!user) {
      toast({ title: "يجب تسجيل الدخول أولاً", description: "الرجاء تسجيل الدخول للوصول للمفضلة.", variant: "warning" });
      navigate('/auth', { state: { from: location.pathname } });
      return;
    }
    try {
      if (!isLiked) {
        await WishlistService.addFavorite(id);
        toast({ title: "تمت الإضافة للمفضلة", description: `تم إضافة ${name} إلى المفضلة.`, duration: 3000 });
      } else {
        await WishlistService.removeFavorite(id);
        toast({ title: "تمت إزالة من المفضلة", description: `تمت إزالة ${name} من المفضلة.`, duration: 3000 });
      }
      setIsLiked(!isLiked);
    } catch (err: unknown) {
      console.error('Error toggling favorite:', err);
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: "حدث خطأ", description: message, variant: "destructive" });
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const fallbackImage = 'https://placehold.co/600x400/e2e8f0/1e293b?text=Delight+Car+Products';

  // تعريف الفئات الثابتة لتجنب مشاكل حذف CSS في وضع الإنتاج
  // استخدام فئات CSS ثابتة بدلاً من الفئات الديناميكية التي قد تُحذف أثناء عملية البناء
  const cardClasses = "group relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300";
  const imageContainerClasses = "relative overflow-hidden aspect-square";
  const imageClasses = "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105";
  const contentClasses = "p-1 flex flex-col h-[calc(100%-0px)]";
  const titleClasses = "text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1 line-clamp-2 min-h-[48px]";
  const subtitleClasses = "mt-0.5 text-sm text-gray-500 line-clamp-2";
  const categoryClasses = "text-xs text-gray-500 dark:text-gray-400 mb-2";
  const ratingClasses = "flex items-center mb-2";
  const starClasses = "text-yellow-500 mr-1";
  const ratingCountClasses = "text-xs text-gray-500 dark:text-gray-400";
  const priceClasses = "flex items-center gap-2 mb-2";
  const originalPriceClasses = "text-sm text-gray-500 dark:text-gray-400 line-through";
  const currentPriceClasses = "text-lg text-delight-600 dark:text-delight-400 font-bold";
  const discountClasses = "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-1.5 py-0.5 rounded-sm text-xs font-semibold";
  const savingsClasses = "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 px-1.5 py-0.5 rounded-sm font-semibold";
  const featuresClasses = "flex flex-wrap gap-x-2 gap-y-1 mt-2 mb-3 items-center";
  const featureItemClasses = "flex items-center text-[10px] text-gray-600 dark:text-gray-300";
  const featureIconClasses = "w-3 h-3 ml-1 text-delight-500 dark:text-delight-400";
  const actionsClasses = "flex flex-col sm:flex-row justify-between gap-2 mt-auto pt-2 border-t border-gray-100 dark:border-gray-700/50";
  const detailsBtnClasses = "border-gray-200 text-amazon-link hover:bg-gray-50 hover:text-amazon-link hover:border-gray-300 transition duration-150 ease-in-out";
  const cartBtnClasses = "transition-all duration-300";
  const glowEffectClasses = "absolute -z-10 inset-0 bg-gradient-to-r from-amber-200/20 to-delight-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl";
  
  return (
    <motion.div 
      onClick={() => navigate(`/products/${id}`)}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      className={cn(
        // نستخدم الفئات الثابتة المعرفة أعلاه مع الفئات الديناميكية
        cardClasses,
        'cursor-pointer group overflow-hidden rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 grid grid-cols-1 h-full mb-4 w-full',
        className
      )}
      style={{ display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)', width: '100%' }} /* استخدام أسلوب inline لضمان تطبيقه */
    >
      {/* صورة المنتج مع الشارات - نستخدم order-first لضمان ظهورها في الأعلى دائمًا */}
      <div 
        className="relative w-full overflow-hidden bg-gray-50 border-b border-gray-100 order-first" 
        style={{ 
          aspectRatio: '4/1.8',
          gridRow: '1',
          display: 'block' /* ضمان العرض كـ block */
        }}
      >
        {/* شارات المنتج (جديد/مميز) */}
        {isNew && (
          <div
            className="absolute top-0 left-0 w-12 h-12 bg-red-500 shadow-lg z-20"
            style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
          >
            <div className="absolute bottom-3 left-2 text-xs font-semibold text-white transform -rotate-45 origin-bottom-left">
              جديد
            </div>
          </div>
        )}
        {isFeatured && (
          <div
            className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg z-20"
            style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}
          >
            <div className="absolute bottom-3 right-2 text-xs font-semibold text-white transform rotate-45 origin-bottom-right">
              مميز
            </div>
          </div>
        )}
        
        {/* صورة المنتج */}
        <motion.img
          loading="lazy"
          whileHover={{ scale: 1.15, rotate: -2 }}
          transition={{ duration: 0.15 }}
          src={imageError ? fallbackImage : image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-150 ease-in-out"
          onError={handleImageError}
          style={{ display: 'block' }} /* ضمان العرض كـ block */
        />
        
        {/* تأثير التدرج عند التحويم */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      {/* محتوى المنتج - نستخدم order-last لضمان ظهوره بعد الصورة */}
      <div 
        className="p-1 flex flex-col flex-grow order-last" 
        style={{ 
          gridRow: '2',
          display: 'flex', /* ضمان العرض كـ flex */
          maxHeight: '180px'
        }}>
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex gap-0.5 items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-2.5 h-2.5 ${i < Math.floor(rating) ? 'fill-amazon-orange text-amazon-orange' : 'fill-gray-200 text-gray-200'}`} 
              />
            ))}
            <span className="text-[10px] font-medium text-gray-500 mr-0.5">({ratingCount ? `${rating} (${ratingCount})` : rating})</span>
            <motion.button
              onClick={toggleLike}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-0.5 ml-1 rounded-full shadow-sm bg-white/80 backdrop-blur-sm"
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-amazon-warning text-amazon-warning' : 'text-gray-500'}`} />
            </motion.button>
          </div>
          
          <AnimatePresence>
            {isAddedToCart && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="text-[10px] font-medium bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full flex items-center"
              >
                <Check className="h-2.5 w-2.5 mr-0.5" /> في السلة
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {category && (
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 truncate">
            {category}
          </p>
        )}
        <h3 className="text-sm font-semibold mb-0.5 text-gray-800 dark:text-white line-clamp-1 group-hover:text-delight-600 transition-colors min-h-[1.25rem]">
          {name}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-0.5 text-[10px] line-clamp-1 min-h-[0.75rem]">
          {descriptionTitle ?? description}
        </p>

        {/* Stock Status */}
        {(() => {
          let statusText = stockStatusText;
          let textColor = 'text-gray-600 dark:text-gray-300';
          
          if (!statusText) {
            if (stock > 5) {
              statusText = 'متوفر';
              textColor = 'text-green-600 dark:text-green-400';
            } else if (stock > 0 && stock <= 5) {
              statusText = 'كمية محدودة';
              textColor = 'text-amber-600 dark:text-amber-400';
            } else {
              statusText = 'غير متوفر';
              textColor = 'text-red-600 dark:text-red-400';
            }
          } else {
            // إذا تم توفير stockStatusText، نحدد اللون بناءً على النص
            if (stock > 0) {
              textColor = 'text-green-600 dark:text-green-400';
            } else {
              textColor = 'text-red-600 dark:text-red-400';
            }
          }

          return (
            <div className={`stock-badge text-[10px] font-medium mb-0.5 inline-block ${textColor} ${stock > 5 ? 'stock-available' : stock > 0 ? 'stock-limited' : 'stock-unavailable'}`}>
              {statusText}
            </div>
          );
        })()}
        
        {/* Price, Discount, Savings */}
        {price ? (
          <div className="mb-0.5 space-y-0">
            <div className="flex items-baseline gap-0.5 flex-nowrap">
              <span className="text-sm font-bold text-delight-600 dark:text-delight-400">
                {price}
              </span>
              {originalPrice && (
                <span className="text-[10px] text-gray-500 dark:text-gray-400 line-through">
                  {originalPrice}
                </span>
              )}
            </div>
            {originalPrice && price && (() => {
              const parseNumeric = (str: string) => parseFloat(String(str).replace(/[^\d.]/g, ''));
              const origNum = parseNumeric(originalPrice);
              const currNum = parseNumeric(price);
              if (!isNaN(origNum) && !isNaN(currNum) && origNum > currNum) {
                const discountPercent = Math.round(((origNum - currNum) / origNum) * 100);
                const savingsAmount = origNum - currNum;
                return (
                  <div className="flex items-center gap-0.5 flex-nowrap text-[9px]">
                    {discountPercent > 0 && (
                      <span className="product-badge discount-badge inline-block">
                        خصم {discountPercent}%
                      </span>
                    )}
                    {savingsAmount > 0 && (
                      <span className="product-badge savings-badge inline-block">
                        وفر {savingsAmount.toFixed(2)} ج.م
                      </span>
                    )}
                  </div>
                );
              }
              return null;
            })()}
          </div>
        ) : price ? (
          <div className="amazon-price mb-0.5 text-sm text-delight-600 dark:text-delight-400 font-bold">{price}</div>
        ) : null}
        
        {/* عرض النقاط ونظام المغارة */}
        <div className="flex flex-wrap gap-x-0.5 gap-y-0.5 mt-0.5 mb-1 items-center">
          {points_earned != null && (
            <span className="feature-item points-earned-badge">نقاط مكتسبة: {points_earned}</span>
          )}
          {points_required != null && (
            <span className="feature-item points-required-badge">نقاط مطلوبة: {points_required}</span>
          )}
          {cave_enabled && (
            <span className="feature-item cave-enabled-badge">مغارة مفعلة</span>
          )}
          {cave_price != null && (
            <span className="feature-item cave-price-badge">سعر المغارة: {cave_price} ج.م</span>
          )}
          {cave_required_points != null && (
            <span className="feature-item cave-required-points-badge">نقاط المغارة: {cave_required_points}</span>
          )}
          {cave_max_quantity != null && (
            <span className="feature-item cave-max-quantity-badge">أقصى كمية: {cave_max_quantity}</span>
          )}
        </div>
        
        <div className="flex flex-row justify-between gap-1 mt-auto pt-0.5 border-t border-gray-100 dark:border-gray-700/50 mb-0.5 relative z-10">
          <motion.div className="w-1/2" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              variant="outline"
              className="border-gray-200 text-amazon-link hover:bg-gray-50 hover:text-amazon-link hover:border-gray-300 transition duration-150 ease-in-out text-[9px] py-0.5 h-auto w-full"
              onClick={() => navigate(`/products/${id}`)}
            >
              <Eye className="w-2.5 h-2.5 ml-0.5" />
              <span>التفاصيل</span>
            </Button>
          </motion.div>
          
          <motion.div 
            className="w-1/2"
            whileHover={{ scale: stock > 0 ? 1.05 : 1 }} 
            whileTap={{ scale: stock > 0 ? 0.95 : 1 }}
            animate={isAddedToCart ? { y: [0, -5, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <Button 
              size="sm"
              className={cn(
                "transition-all duration-300 text-[9px] py-0.5 h-auto w-full",
                isAddedToCart
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : stock <= 0
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed hover:bg-gray-300"
                    : "amazon-btn-primary"
              )}
              onClick={handleAddToCart}
              disabled={stock <= 0}
              title={stock <= 0 ? "المنتج غير متوفر في المخزون" : ""}
            >
              {isAddedToCart ? (
                <>
                  <Check className="w-2.5 h-2.5 ml-0.5" />
                  <span>تمت الإضافة</span>
                </>
              ) : stock <= 0 ? (
                <>
                  <AlertTriangle className="w-2.5 h-2.5 ml-0.5" />
                  <span>غير متوفر</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-2.5 h-2.5 ml-0.5 group-hover:animate-pulse" />
                  <span>إضافة للسلة</span>
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
      
      {/* Glowing effect on hover */}
      <motion.div
        className="absolute -z-10 inset-0 bg-gradient-to-r from-amber-200/20 to-delight-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      />
    </motion.div>
  );
};

// تصدير المكون
export default ProductCard;
