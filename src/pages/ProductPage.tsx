import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useAnimation } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Star, Check, AlertTriangle, Loader2, Share2, Shield, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import SectionHeading from '@/components/SectionHeading';
import { toast } from '@/components/ui/use-toast';
import { useCart } from '@/context/CartContext';
import { ProductDataService } from '@/services/productDataService';
import ProductCard from '@/components/ProductCard';

const ProductPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'features'|'reviews'|'usage'>('features');
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const controls = useAnimation();
  const { addItem } = useCart();
  const [canHover, setCanHover] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const location = useLocation();
  const searchQuery = (location.state as any)?.searchQuery as string | undefined;
  
  useEffect(() => {
    const mql = window.matchMedia('(hover: hover)');
    setCanHover(mql.matches);
  }, []);

  useEffect(() => {
    if (productId) setSelectedImageIndex(0);
  }, [productId]);

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

  const handleAddToCart = () => {
    try {
      if (product.stock === 0) {
        toast({
          title: "المنتج غير متوفر",
          description: "عذراً، هذا المنتج غير متوفر في المخزون حالياً.",
          variant: "destructive"
        });
        return;
      }

      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      });
      
      toast({
        title: "تمت الإضافة إلى السلة",
        description: `تمت إضافة ${product.name} إلى سلة التسوق بنجاح.`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة المنتج إلى السلة",
        variant: "destructive"
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

  // Ensure we have valid rating values
  const rating = product.rating || 0;
  const reviews = product.reviews || 0;

  return (
    <div className="pb-20 overflow-x-hidden">
      {/* Breadcrumb + Share */}
      <div className="bg-gray-100 py-4">
        <div className="container-custom flex justify-between items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 bg-white rounded-full shadow hover:bg-gray-50 transition duration-150">
                  <Share2 className="w-4 h-4 text-gray-700" />
                </button>
              </TooltipTrigger>
              <TooltipContent>مشاركة</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Product Details */}
      <section className="py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Product Image */}
            <motion.div
              variants={fadeInVariants}
              initial="hidden"
              animate={controls}
              className="bg-white p-6 rounded-xl shadow-sm overflow-hidden"
            >
              <div className="w-full h-full">
                <div className="w-full md:aspect-square bg-gray-100 rounded-lg overflow-hidden relative flex items-center justify-center">
                  {product.isNew && (
                    <span
                      className="absolute top-0 left-0 w-16 h-16 bg-red-500 shadow-lg z-10"
                      style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
                    >
                      <span className="absolute bottom-4 left-3 text-lg font-semibold text-white transform -rotate-45 origin-bottom-left">جديد</span>
                    </span>
                  )}
                  {product.isFeatured && (
                    <span
                      className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg z-10"
                      style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}
                    >
                      <span className="absolute bottom-4 right-3 text-lg font-semibold text-white transform rotate-45 origin-bottom-right">مميز</span>
                    </span>
                  )}
                  <motion.img
                    src={product.images?.[selectedImageIndex] || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-auto object-contain"
                    whileHover={canHover ? { scale: 1.05 } : undefined}
                    transition={{ duration: 0.3 }}
                    onError={(e) => {
                      console.error('Image loading error for product:', product.id);
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
                
                {/* Additional Images */}
                {product.images && product.images.length > 1 && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {product.images.map((image, index) => (
                      <div key={index} className={`w-1/3 sm:w-1/4 aspect-square bg-gray-100 rounded-lg overflow-hidden ${index === selectedImageIndex ? 'ring-2 ring-delight-600' : ''}`}>
                        <button type="button" className="w-full h-full" onClick={() => setSelectedImageIndex(index)}>
                          <img
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              variants={fadeInVariants}
              initial="hidden"
              animate={controls}
              transition={{ delay: 0.2 }}
            >
              {/* Title & Badges */}
              <div className="flex flex-col items-start sm:flex-row sm:items-center gap-2 mb-6">
                <h1 className="text-3xl font-extrabold">{product.name}</h1>
              </div>
              {/* Rating */}
              <div className="flex items-center mb-6 gap-2">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-amber-500' : 'fill-gray-200'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-700">{rating.toFixed(1)} ({reviews} تقييم)</span>
              </div>
              {/* Pricing & Discount */}
              <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-delight-600">{product.price}</span>
                  {product.originalPrice && (() => {
                    const parseNum = (str: string) => parseFloat(str.replace(/[^\d.]/g, ''));
                    const orig = parseNum(product.originalPrice);
                    const curr = parseNum(product.price);
                    const percent = orig > curr ? Math.round(((orig - curr) / orig) * 100) : 0;
                    return percent > 0 ? (
                      <span className="inline-flex items-center bg-gradient-to-br from-red-600 to-red-800 text-white px-3 py-1.5 rounded-full shadow-lg animate-[bounce_1.5s_infinite] hover:scale-110 transition-transform duration-300">
                        <span className="text-sm font-medium">خصم</span>
                        <span className="ml-1 text-xl font-extrabold">{percent}%</span>
                      </span>
                    ) : null;
                  })()}
                </div>
                {product.originalPrice && (() => {
                  const parseNum = (str: string) => parseFloat(str.replace(/[^\d.]/g, ''));
                  const orig = parseNum(product.originalPrice);
                  const curr = parseNum(product.price);
                  const percent = orig > curr ? Math.round(((orig - curr) / orig) * 100) : 0;
                  if (percent <= 0) return null;
                  return (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-gray-500 font-medium">بدلاً من</span>
                      <span className="text-lg text-gray-500 line-through font-semibold">{product.originalPrice}</span>
                      <Button
                        variant="modern-primary"
                        size="sm"
                        onClick={handleAddToCart}
                        disabled={!product.stock || product.stock === 0}
                        className="inline-flex items-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4 md:w-6 md:h-6" />
                        <span>إضافة إلى السلة</span>
                      </Button>
                    </div>
                  );
                })()}
              </div>
              {/* Trust Icons */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                <Shield className="w-4 h-4 text-delight-600" />
                <span>الدفع عند الاستلام</span>
                <RefreshCw className="w-4 h-4 text-delight-600" />
                <span>دعم فني</span>
              </div>
              <p className="text-gray-700 leading-relaxed mb-6">{product.fullDescription || product.description}</p>
              {/* Tabs */}
              <div className="mb-6">
                <div className="flex border-b">
                  <button
                    onClick={() => setActiveTab('features')}
                    className={`${activeTab==='features'? 'border-delight-600 text-delight-600':'text-gray-500'} py-2 px-4 border-b-2 transition duration-150`}
                  >المميزات</button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`${activeTab==='reviews'? 'border-delight-600 text-delight-600':'text-gray-500'} py-2 px-4 border-b-2 transition duration-150 mx-4`}
                  >التقييمات</button>
                  <button
                    onClick={() => setActiveTab('usage')}
                    className={`${activeTab==='usage'? 'border-delight-600 text-delight-600':'text-gray-500'} py-2 px-4 border-b-2 transition duration-150`}
                  >طريقة الاستخدام</button>
                </div>
                <div className="mt-4">
                  {activeTab==='features' && product.features && product.features.length>0 && (
                    <motion.div
                      variants={staggerVariants}
                      initial="hidden"
                      animate={controls}
                      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 py-2"
                    >
                      {product.features.map((feat, idx) => (
                        <motion.div
                          key={idx}
                          variants={fadeInVariants}
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                          className="cursor-pointer inline-flex items-center gap-2 py-1 px-2 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:border-green-300 rounded-full shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 text-sm"
                        >
                          <div className="p-1 bg-green-200 rounded-full flex-shrink-0">
                            <Check strokeWidth={3} className="w-4 h-4 text-green-600" />
                          </div>
                          <p className="text-gray-800 dark:text-gray-100 text-sm font-medium">{feat}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                  {activeTab==='reviews' && (
                    <div>
                      <p className="font-medium mb-2">{reviews} تقييم</p>
                      <blockquote className="border-l-4 border-gray-200 pl-4 italic text-gray-600">“منتج رائع وخدمة سريعة”</blockquote>
                    </div>
                  )}
                  {activeTab==='usage' && (
                    <p className="text-gray-700 leading-relaxed">{product.usage_instructions}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Related Products Carousel */}
      {displayedProducts.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container-custom">
            <SectionHeading
              title={
                searchQuery
                  ? `نتائج البحث عن "${searchQuery}"`
                  : relatedProducts.length > 0
                    ? 'منتجات مشابهة لك'
                    : 'منتجات مقترحة لك'
              }
              subtitle=""
              center
            />
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-4"
              variants={staggerVariants}
              initial="hidden"
              animate={controls}
            >
              {displayedProducts.map(rp => (
                <motion.div key={rp.id} variants={fadeInVariants} className="w-full">
                  <ProductCard 
                    id={rp.id}
                    name={rp.name}
                    description={rp.description}
                    image={rp.image}
                    price={rp.price}
                    rating={rp.rating}
                    isFeatured={rp.isFeatured}
                    isNew={rp.isNew}
                    originalPrice={rp.originalPrice}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductPage;
