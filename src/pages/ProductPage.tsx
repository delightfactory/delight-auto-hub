import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ShoppingCart, Star, Check, AlertTriangle, Loader2, Share2, Shield, 
  RefreshCw, Heart, Home, ChevronLeft, ChevronRight, ZoomIn, Truck, Clock, Package,
  ThumbsUp, MessageCircle, Info, Award, Sparkles, Settings
} from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../components/ui/tooltip';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import SectionHeading from '../components/SectionHeading';
import { toast } from '../components/ui/use-toast';
import { useCart } from '../context/CartContext';
import { ProductDataService } from '../services/productDataService';
import { ProgressiveImage } from '../components/performance/ProgressiveImage';
import { VirtualizedProductGrid } from '../components/performance/VirtualizedProductGrid';
import { cn } from '../lib/utils';
import { ReviewService } from '../services/reviewService';
import type { Review } from '../types/db';

// دالة لتنسيق الأسعار مع معالجة الأرقام العشرية بشكل أفضل
const formatPrice = (price: number | string): React.ReactNode => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return '0';
  
  // التحقق مما إذا كان الرقم يحتوي على كسور
  if (numPrice % 1 === 0) {
    // إذا كان رقماً صحيحاً، نعرضه بدون أرقام عشرية
    return Math.floor(numPrice).toLocaleString('en-US');
  } else {
    // إذا كان يحتوي على كسور، نفصل الجزء الصحيح عن الكسري
    const wholePart = Math.floor(numPrice);
    const decimalPart = (numPrice - wholePart).toFixed(2).substring(1); // نأخذ رقمين عشريين فقط
    
    return (
      <>
        <span>{wholePart.toLocaleString('en-US')}</span>
        <span className="text-xs align-top">{decimalPart}</span>
      </>
    );
  }
};

// دالة لتنسيق عرض السعر في واجهة المستخدم
const formatDisplayPrice = (priceString: string): React.ReactNode => {
  // استخراج الرقم من النص
  const numericPart = priceString.replace(/[^\d.]/g, '');
  const price = parseFloat(numericPart);
  
  if (isNaN(price)) return priceString;
  
  return (
    <>
      {formatPrice(price)}
      <span className="mr-1 text-sm">ج.م</span>
    </>
  );
};

const ProductPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'features' | 'specs' | 'reviews' | 'usage'>('features');
  const [quantity, setQuantity] = useState<number>(1);
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const controls = useAnimation();
  const { addItem } = useCart();
  const isDesktop = window.matchMedia('(min-width: 768px)').matches;
  const [canHover, setCanHover] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const location = useLocation();
  const searchQuery = (location.state as any)?.searchQuery as string | undefined;
  
  // متغيرات التبويبات والتقييمات ستعرف لاحقاً بعد تحميل بيانات المنتج
  
  useEffect(() => {
    const mql = window.matchMedia('(hover: hover)');
    setCanHover(mql.matches);
  }, []);

  useEffect(() => {
    if (productId) {
      setSelectedImageIndex(0);
      setQuantity(1); // إعادة تعيين الكمية عند تغيير المنتج
    }
  }, [productId]);

  // Review system hooks moved above early returns to maintain hook order
  const [newReviewRating, setNewReviewRating] = useState<number>(0);
  const [newReviewComment, setNewReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const { data: reviews = [], isLoading: loadingReviews, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => ReviewService.getReviews(productId!),
    enabled: !!productId,
  });
  const { data: canWriteReview = false, isLoading: checkingReviewEligibility } = useQuery({
    queryKey: ['canReview', productId],
    queryFn: () => ReviewService.canReview(productId!),
    enabled: !!productId,
  });
  const ratingCount = reviews.length;
  const ratingAverage = ratingCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount : 0;
  const handleSubmitReview = async () => {
    if (!productId) return;
    setSubmittingReview(true);
    try {
      await ReviewService.createReview(productId, newReviewRating, newReviewComment);
      toast({ title: 'تم إرسال التقييم', description: 'شكراً لمساهمتك!', duration: 3000 });
      setNewReviewRating(0);
      setNewReviewComment('');
      await refetchReviews();
    } catch (err: any) {
      console.error('Error submitting review:', err);
      toast({ title: 'حدث خطأ', description: err.message, variant: 'destructive' });
    } finally {
      setSubmittingReview(false);
    }
  };

  // جلب بيانات المنتج من Supabase
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => {
      if (!productId) {
        throw new Error('Product ID is required');
      }
      return ProductDataService.getProductById(productId);
    },
    enabled: !!productId,
    retry: 2
  });

  // جلب المنتجات ذات الصلة
  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['related-products', productId, product?.category, searchQuery],
    queryFn: async () => {
      if (searchQuery) {
        return ProductDataService.searchProducts(searchQuery);
      } else if (productId && product?.category) {
        return ProductDataService.getRelatedProducts(productId, product.category);
      }
      return [];
    },
    enabled: !!product,
    retry: 1
  });

  // جلب منتجات مقترحة (مميزة) عند عدم وجود منتجات مرتبطة
  const { data: suggestedProducts = [] } = useQuery({
    queryKey: ['suggested-products'],
    queryFn: () => ProductDataService.getFeaturedProducts(),
    enabled: relatedProducts.length === 0,
    retry: 1
  });
  const displayedProducts = relatedProducts.length > 0 ? relatedProducts : suggestedProducts;

  useEffect(() => {
    if (product) {
      controls.start('visible');
    }
  }, [product, controls]);
  
  // Redirect if no productId
  useEffect(() => {
    if (!productId) {
      console.error('No product ID provided');
      navigate('/products');
    }
  }, [productId, navigate]);
  
  if (isLoading) {
    return (
      <div className="container-custom py-20">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-delight-600 mb-4" />
          <p className="text-lg font-medium">جارِ تحميل المنتج...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    console.error('Product loading error:', error);
    return (
      <div className="container-custom py-20">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">المنتج غير موجود</h2>
          <p className="mb-8">عذراً، لم نتمكن من العثور على المنتج الذي تبحث عنه.</p>
          <Button onClick={() => navigate('/products')}>
            العودة إلى المنتجات
          </Button>
        </div>
      </div>
    );
  }

  const addToCartWithoutNotification = () => {
    try {
      if (product) {
        if (product.stock === 0) {
          throw new Error('المنتج غير متوفر في المخزون');
        }
        
        addItem({
          id: product.id,
          name: product.name,
          price: product.price || '0 ريال',
          image: product.image || '',
        originalPrice: product.originalPrice, // إضافة السعر الأصلي هنا
        });
        
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleAddToCart = () => {
    try {
      if (product) {
        if (product.stock === 0) {
          toast.warning({
            title: "المنتج غير متوفر",
            description: "عذراً، هذا المنتج غير متوفر في المخزون حالياً."
          });
          return;
        }
        
        // Añadir al carrito
        addToCartWithoutNotification();
        
        // Mostrar notificación con estilo de éxito
        toast.success({
          title: "تمت الإضافة إلى السلة",
          description: `تمت إضافة ${product.name} إلى سلة التسوق بنجاح.`,
        });
        
        // تحريك الصفحة للأعلى
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة المنتج إلى السلة"
      });
    }
  };

  const fadeInVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Removed static rating and reviews; using dynamic values instead

  // تحويل activeTab إلى تنسيق متوافق مع مكون Tabs من shadcn
  const tabValue = activeTab === 'features' ? 'features' : activeTab === 'reviews' ? 'reviews' : 'usage';

  // حساب نسبة الخصم والتوفير
  const calculateDiscount = () => {
    if (product?.price && product?.originalPrice) {
      // استخراج الأرقام من النص
      const parseNum = (str: string) => parseFloat(str.replace(/[^\d.]/g, ''));
      const orig = parseNum(product.originalPrice);
      const curr = parseNum(product.price);
      if (!isNaN(orig) && !isNaN(curr) && orig > curr) {
        const percentDiscount = Math.round(((orig - curr) / orig) * 100);
        const savings = (orig - curr) * quantity;
        const totalOriginal = orig * quantity;
        const totalCurrent = curr * quantity;
        return {
          percent: percentDiscount,
          savings: savings.toFixed(2),
          totalOriginal: totalOriginal.toFixed(2),
          totalCurrent: totalCurrent.toFixed(2),
          currency: 'ج.م'
        };
      }
    }
    return null;
  };

  const discountInfo = calculateDiscount();
  const discountPercent = discountInfo?.percent || null;
  
  // حالة توفر المنتج
  const stockStatus = () => {
    if (!product.stock || product.stock === 0) return { status: 'outOfStock', label: 'غير متوفر', color: 'bg-red-100 text-red-800 border-red-200' };
    if (product.stock < 5) return { status: 'lowStock', label: 'متوفر (كمية محدودة)', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    return { status: 'inStock', label: 'متوفر', color: 'bg-green-100 text-green-800 border-green-200' };
  };

  const productStock = stockStatus();

  return (
    <div className="pb-20 overflow-x-hidden bg-gradient-to-b from-white to-gray-50">
      {/* Breadcrumb + Share */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-4 shadow-sm">
        <div className="container-custom">
          <div className="flex justify-between items-center">
            <nav className="flex items-center space-x-2 space-x-reverse text-sm">
              <Link to="/" className="flex items-center text-gray-600 hover:text-purple-600 transition-colors">
                <Home className="w-4 h-4 ml-1" />
                <span>الرئيسية</span>
              </Link>
              <ChevronLeft className="w-4 h-4 text-gray-400" />
              <Link to="/products" className="text-gray-600 hover:text-purple-600 transition-colors">المنتجات</Link>
              <ChevronLeft className="w-4 h-4 text-gray-400" />
              <span className="text-purple-600 font-medium">{product.name}</span>
            </nav>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition duration-150 border border-gray-200">
                      <Share2 className="w-4 h-4 text-gray-700" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>مشاركة</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition duration-150 border border-gray-200">
                      <Heart className="w-4 h-4 text-gray-700" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>إضافة للمفضلة</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <section className="py-8 md:py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            {/* Product Image */}
            <motion.div
              variants={fadeInVariants}
              initial="hidden"
              animate={controls}
              className="relative"
            >
              <div className="sticky top-24 w-full">
                {/* الصورة الرئيسية */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-800">
                  <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden flex items-center justify-center p-6">
                    {/* شارات جديد ومميز */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                      {product.isNew && (
                        <Badge variant="outline" className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-md animate-pulse">
                          <Sparkles className="w-3.5 h-3.5 ml-1" />
                          <span className="font-bold">جديد</span>
                        </Badge>
                      )}
                      {product.isFeatured && (
                        <Badge variant="outline" className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 shadow-md">
                          <Award className="w-3.5 h-3.5 ml-1" />
                          <span className="font-bold">مميز</span>
                        </Badge>
                      )}
                    </div>
                    
                    {/* تمت إزالة زر التكبير بناءً على طلب المستخدم */}
                    
                    {/* الصورة الرئيسية */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedImageIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full relative flex items-center justify-center"
                      >
                        <motion.div
                          className="w-full h-full"
                          whileHover={canHover ? { scale: 1.05 } : undefined}
                          transition={{ duration: 0.3 }}
                        >
                          <ProgressiveImage
                            src={product.images?.[selectedImageIndex] || '/placeholder.svg'}
                            alt={product.name}
                            className="w-full h-auto object-contain max-h-[400px]"
                            placeholderColor="#f3f4f6"
                            blur={true}
                          />
                        </motion.div>
                      </motion.div>
                    </AnimatePresence>
                    
                    {/* تمت إزالة أزرار التنقل بين الصور بناءً على طلب المستخدم */}
                  </div>
                  
                  {/* الصور المصغرة */}
                  {product.images && product.images.length > 1 && (
                    <div className="flex justify-center gap-2 p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
                      {product.images.map((image, index) => (
                        <motion.button
                          key={index}
                          type="button"
                          whileHover={{ y: -2 }}
                          onClick={() => setSelectedImageIndex(index)}
                          className={cn(
                            "relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200",
                            index === selectedImageIndex 
                              ? "border-purple-500 shadow-md shadow-purple-200 dark:shadow-purple-900/20" 
                              : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                          )}
                        >
                          <ProgressiveImage
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                            placeholderColor="#f3f4f6"
                          />
                          {index === selectedImageIndex && (
                            <div className="absolute inset-0 bg-purple-500/10 dark:bg-purple-500/20 backdrop-blur-sm" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* معلومات الشحن والتوصيل */}
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <Package className="w-4 h-4 ml-1.5 text-purple-500" />
                    معلومات الشحن والتوصيل
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                        <Truck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span>شحن سريع خلال 2-3 أيام</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span>الدفع عند الاستلام</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <RefreshCw className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                      </div>
                      <span>إمكانية الإرجاع خلال 14 يوم</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span>ضمان لمدة سنة</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              variants={fadeInVariants}
              initial="hidden"
              animate={controls}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              {/* Header with Title & Rating */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-blue-600 dark:from-purple-500 dark:to-blue-400">
                      {product.name}
                    </h1>
                    <div className="flex items-center mt-2 gap-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(ratingAverage) ? 'fill-amber-500 text-amber-500' : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {ratingAverage.toFixed(1)} ({ratingCount} تقييم)
                      </span>
                      <Badge variant="outline" className={cn(
                        "ml-auto",
                        productStock.color
                      )}>
                        {productStock.label}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                  {product.fullDescription || product.description}
                </p>
              </div>
              
              {/* Pricing Section - Mobile Version */}
              <div className="md:hidden p-0 fixed bottom-0 left-0 right-0 z-50 pb-safe">
                {/* Glass effect background with subtle gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-800/95 via-gray-800/95 to-slate-700/95 dark:from-slate-900/95 dark:via-gray-900/95 dark:to-slate-800/95 backdrop-blur-md border-t border-white/10 dark:border-white/5 shadow-[0_-2px_10px_rgba(0,0,0,0.2)]">
                  {/* Decorative elements */}
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400 opacity-50"></div>
                </div>
                
                {/* Content - Compact Design */}
                <div className="relative container-custom mx-auto pt-2 pb-1 px-3">
                  <div className="flex items-center gap-2 h-8">
                    {/* Price and Discount Column */}
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-white flex items-center">
                          {quantity > 1 ? (
                            <>
                              {formatPrice(discountInfo?.totalCurrent || parseFloat(product.price.replace(/[^\d.]/g, '')) * quantity)}
                              <span className="mr-1 text-sm">ج.م</span>
                            </>
                          ) : (
                            formatDisplayPrice(product.price)
                          )}
                        </span>
                        
                        {discountInfo && (
                          <Badge className="bg-red-600 text-white border-0 text-xs px-1.5 py-0">
                            <span className="font-bold">-{discountInfo.percent}%</span>
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs">
                        {product.originalPrice && discountPercent && (
                          <>
                            <span className="text-white/90 font-medium relative inline-block">
                              <span className="relative">
                              {quantity > 1 ? (
                                <>
                                  {formatPrice(parseFloat(discountInfo?.totalOriginal || '0'))}
                                  <span className="mr-1 text-xs">ج.م</span>
                                </>
                              ) : (
                                formatDisplayPrice(product.originalPrice || '')
                              )}
                            </span>
                              <span className="absolute left-0 right-0 h-[1.5px] bg-red-500 transform rotate-[-7deg] top-[50%] z-20 opacity-100 border-0 border-red-500"></span>
                            </span>
                          </>
                        )}
                        
                        {discountInfo && (
                          <span className="text-green-400 font-medium flex items-center">
                            <Check className="w-3 h-3 mr-0.5" />
                            وفر {discountInfo.savings} ج.م
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Controls Column */}
                    <div className="flex items-center gap-1.5">
                      {/* Quantity controls */}
                      <div className="flex items-center bg-white/30 rounded-lg overflow-hidden border border-white/20 h-8">
                        <button 
                          onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                          className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        >
                          <span className="font-bold">-</span>
                        </button>
                        <span className="w-8 text-center text-white font-bold">{quantity}</span>
                        <button 
                          onClick={() => setQuantity(prev => prev + 1)}
                          className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        >
                          <span className="font-bold">+</span>
                        </button>
                      </div>
                      
                      {/* Add to Cart Button */}
                      <Button
                        onClick={() => {
                          try {
                            if (product.stock === 0) {
                              toast.warning({
                                title: "المنتج غير متوفر",
                                description: "عذراً، هذا المنتج غير متوفر في المخزون حالياً."
                              });
                              return;
                            }
                            
                            // Añadir productos al carrito sin mostrar múltiples notificaciones
                            let successCount = 0;
                            for (let i = 0; i < quantity; i++) {
                              if (addToCartWithoutNotification()) {
                                successCount++;
                              }
                            }
                            
                            // Mostrar una única notificación solo si se añadió al menos un producto
                            if (successCount > 0) {
                              toast.success({
                                title: "تمت الإضافة إلى السلة",
                                description: `تمت إضافة ${successCount} ${successCount > 1 ? 'وحدات' : 'وحدة'} من ${product.name} إلى سلة التسوق.`,
                              });
                            }
                          } catch (error) {
                            console.error('Error adding to cart:', error);
                            toast.error({
                              title: "خطأ",
                              description: "حدث خطأ أثناء إضافة المنتج إلى السلة"
                            });
                          }
                        }}
                        disabled={!product.stock || product.stock === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-lg px-3 border-0 transition-all duration-200 h-8 flex items-center justify-center"
                        size="sm"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 ml-1" />
                        <span className="font-bold text-xs">إضافة</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Spacer for mobile to prevent content being hidden behind fixed pricing section */}
              <div className="md:hidden h-28 mb-8"></div>
              
              {/* Pricing Section - Desktop Version */}
              <div className="hidden md:block p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border-b border-gray-100 dark:border-gray-700">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">{product.price}</span>
                      {discountPercent && (
                        <Badge variant="outline" className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-md animate-pulse">
                          <span className="font-bold">خصم {discountPercent}%</span>
                        </Badge>
                      )}
                    </div>
                    {product.originalPrice && discountPercent && (
                      <div className="mt-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">بدلاً من </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through font-semibold">{product.originalPrice}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    onClick={handleAddToCart}
                    disabled={!product.stock || product.stock === 0}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-full px-6 py-2"
                    size="lg"
                  >
                    <ShoppingCart className="w-5 h-5 ml-2" />
                    <span>إضافة إلى السلة</span>
                  </Button>
                </div>
              </div>
              
              {/* Tabs Section */}
              <Tabs defaultValue={tabValue} onValueChange={(value) => setActiveTab(value as 'features' | 'specs' | 'reviews' | 'usage')} className="w-full">
                <div className="px-6 pt-4">
                  <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-lg">
                    <TabsTrigger value="features" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 data-[state=active]:shadow-sm">
                      <span className="w-full text-center text-xs sm:text-sm font-medium">المميزات</span>
                    </TabsTrigger>
                    <TabsTrigger value="specs" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 data-[state=active]:shadow-sm">
                      <span className="w-full text-center text-xs sm:text-sm font-medium">المواصفات</span>
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 data-[state=active]:shadow-sm">
                      <span className="w-full text-center text-xs sm:text-sm font-medium">التقييمات</span>
                    </TabsTrigger>
                    <TabsTrigger value="usage" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 data-[state=active]:shadow-sm">
                      <span className="w-full text-center text-xs sm:text-sm font-medium">الاستخدام</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="p-6">
                  <TabsContent value="features" className="mt-0">
                    {product.features && product.features.length > 0 ? (
                      <motion.div
                        variants={staggerVariants}
                        initial="hidden"
                        animate={controls}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2"
                      >
                        {product.features.map((feat, idx) => (
                          <motion.div
                            key={idx}
                            variants={fadeInVariants}
                            whileHover={{ scale: 1.02, y: -2 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-3 p-3 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 rounded-lg shadow-sm hover:shadow transition-all duration-200"
                          >
                            <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full flex-shrink-0">
                              <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-gray-800 dark:text-gray-200 text-sm font-medium">{feat}</p>
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">لا توجد مميزات متاحة لهذا المنتج</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="specs" className="mt-0">
                    <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/20 rounded-lg overflow-hidden">
                      <div className="p-4 border-b border-purple-100 dark:border-purple-800/20">
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-purple-700 dark:text-purple-400">
                          <Settings className="w-5 h-5" />
                          <span>المواصفات الفنية</span>
                        </h3>
                      </div>
                      
                      <div className="divide-y divide-purple-100 dark:divide-purple-800/20">
                        {[
                          { key: 'الموديل', value: product.name },
                          { key: 'النوع', value: product.subtype || product.category || 'غير محدد' },
                          { key: 'الماركة', value: product.brand || 'غير متوفر' },
                          { key: 'البائع', value: product.vendor || 'غير متوفر' },
                          { key: 'بلد المنشأ', value: product.country_of_origin || 'غير متوفر' },
                          { key: 'الأبعاد', value: product.dimensions
                              ? `${product.dimensions.width || ''}×${product.dimensions.height || ''}×${product.dimensions.depth || ''} ${product.dimensions.unit || ''}`
                              : 'غير محدد'
                          },
                          { key: 'رابط الفيديو', value: product.video_url
                              ? (<a href={product.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">عرض الفيديو</a>)
                              : 'غير متوفر'
                          },
                        ].map((spec, index) => (
                          <div 
                            key={index} 
                            className={`flex flex-wrap md:flex-nowrap ${index % 2 === 0 ? 'bg-purple-50 dark:bg-purple-900/5' : 'bg-white/80 dark:bg-purple-900/10'}`}
                          >
                            <div className="w-full md:w-1/3 p-3 font-medium text-purple-800 dark:text-purple-300">{spec.key}</div>
                            <div className="w-full md:w-2/3 p-3 text-gray-700 dark:text-gray-300">{spec.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="reviews" className="mt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <ThumbsUp className="w-5 h-5 text-amber-500" />
                          <span>التقييمات ({ratingCount})</span>
                        </h3>
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/30">
                          {ratingAverage.toFixed(1)} / 5
                        </Badge>
                      </div>
                      {loadingReviews ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="animate-spin text-amber-500" />
                        </div>
                      ) : reviews.length > 0 ? (
                        reviews.map((rev) => (
                          <div key={rev.id} className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/20 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-amber-100 dark:from-amber-700 dark:to-amber-800 flex items-center justify-center flex-shrink-0">
                                <span className="text-amber-700 dark:text-amber-300 font-bold">{rev.rating}</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-500 text-amber-500' : 'fill-gray-300 text-gray-300'}`}
                                      />
                                    ))}
                                  </div>
                                  <p className="text-gray-400 dark:text-gray-500 text-xs">{new Date(rev.created_at).toLocaleDateString('ar-EG')}</p>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">"{rev.comment}"</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">لا توجد تقييمات بعد لهذا المنتج</p>
                      )}
                      {canWriteReview && (
                        <div className="mt-4 p-4 border border-purple-200 rounded-lg">
                          <h4 className="font-semibold mb-2">أضف تقييمك</h4>
                          <div className="flex items-center mb-2 space-x-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 cursor-pointer ${i < newReviewRating ? 'fill-amber-500 text-amber-500' : 'fill-gray-300 text-gray-300'}`}
                                onClick={() => setNewReviewRating(i + 1)}
                              />
                            ))}
                          </div>
                          <textarea
                            className="w-full p-2 border rounded mb-2"
                            rows={3}
                            placeholder="اكتب تعليقك هنا..."
                            value={newReviewComment}
                            onChange={(e) => setNewReviewComment(e.target.value)}
                          />
                          <Button
                            onClick={handleSubmitReview}
                            disabled={submittingReview || newReviewRating === 0}
                          >
                            {submittingReview ? 'جاري الإرسال...' : 'إرسال التقييم'}
                          </Button>
                        </div>
                      )}
                      {!canWriteReview && !checkingReviewEligibility && (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                          يرجى شراء هذا المنتج لتتمكن من كتابة تقييم.
                        </p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="usage" className="mt-0">
                    {product.usage_instructions ? (
                      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20 rounded-lg p-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-blue-700 dark:text-blue-400">
                          <Info className="w-5 h-5" />
                          <span>تعليمات الاستخدام</span>
                        </h3>
                        <div className="space-y-4">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{product.usage_instructions}</p>
                          
                          {/* فيديو تعليمي إن وجد */}
                          {product.video_url && (
                            <div className="mt-4 border border-blue-200 dark:border-blue-800/30 rounded-lg overflow-hidden">
                              <div className="aspect-video bg-black">
                                {(product.video_url.includes("youtube.com") || product.video_url.includes("youtu.be")) ? (
                                  <iframe
                                    src={(() => {
                                      const url = product.video_url;
                                      let id: string;
                                      if (url.includes("watch?v=")) {
                                        id = url.split("watch?v=")[1].split(/[?&]/)[0];
                                      } else if (url.includes("youtu.be/")) {
                                        id = url.split("youtu.be/")[1].split(/[?&]/)[0];
                                      } else if (url.includes("embed/")) {
                                        id = url.split("embed/")[1].split(/[?&]/)[0];
                                      } else {
                                        return url;
                                      }
                                      return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
                                    })()}
                                    className="w-full h-full"
                                    title="فيديو توضيحي"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                ) : (
                                  <video src={product.video_url} controls className="w-full h-full bg-black" />
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* روابط مفيدة */}
                          <div className="mt-4 p-4 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg">
                            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-1.5">
                              <Share2 className="w-4 h-4" />
                              <span>روابط مفيدة</span>
                            </h4>
                            <ul className="space-y-1 text-sm">
                              <li className="text-blue-600 dark:text-blue-400 hover:underline">
                                <a href="#" target="_blank" rel="noopener noreferrer">دليل المستخدم الكامل</a>
                              </li>
                              <li className="text-blue-600 dark:text-blue-400 hover:underline">
                                <a href="#" target="_blank" rel="noopener noreferrer">الأسئلة الشائعة</a>
                              </li>
                              <li className="text-blue-600 dark:text-blue-400 hover:underline">
                                <a href="#" target="_blank" rel="noopener noreferrer">استكشاف الأعطال وإصلاحها</a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <Info className="w-8 h-8 text-blue-400 dark:text-blue-500" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">لا توجد تعليمات استخدام متاحة لهذا المنتج</p>
                        <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">
                          طلب مساعدة
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Related Products Carousel */}
      {displayedProducts.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-900">
          <div className="container-custom">
            <div className="mb-10 text-center">
              <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-blue-600 dark:from-purple-500 dark:to-blue-400 inline-block mb-2">
                {searchQuery
                  ? `نتائج البحث عن "${searchQuery}"`
                  : relatedProducts.length > 0
                    ? 'منتجات مشابهة قد تعجبك'
                    : 'منتجات مقترحة لك'
                }
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {searchQuery
                  ? `إليك أفضل المنتجات المتعلقة بـ "${searchQuery}"`
                  : relatedProducts.length > 0
                    ? 'منتجات مختارة بعناية بناءً على اهتماماتك وتفضيلاتك'
                    : 'اكتشف المزيد من منتجاتنا المميزة التي تناسب احتياجاتك'
                }
              </p>
            </div>
            
            <VirtualizedProductGrid
              products={displayedProducts}
              onProductClick={(p) => navigate(`/products/${p.id}`)}
              className="mb-8"
              useWindowScroll={true}
              columns={{ default: 1, sm: 2, md: 3, lg: 4 }}
              gap={6}
              estimateSize={320}
            />
            
            <div className="mt-10 text-center">
              <Button 
                variant="outline" 
                className="bg-transparent hover:bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-300 dark:text-purple-400 dark:border-purple-800/30 dark:hover:border-purple-700/50 dark:hover:bg-purple-900/10"
                onClick={() => navigate('/products')}
              >
                عرض جميع المنتجات
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductPage;
