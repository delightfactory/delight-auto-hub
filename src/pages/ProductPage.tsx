
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ProductsAPI } from '@/services/productsAPI';
import { Product } from '@/types/db';
import PageLoader from '@/components/PageLoader';
import { useCart } from '@/context/CartContext';
import { 
  Star, 
  Truck, 
  Shield, 
  ArrowRight, 
  Plus, 
  Minus, 
  Check,
  ImageOff,
  ShoppingCart,
  AlertCircle,
  Heart,
  Share2,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { CURRENCY } from '@/constants/app';
import SectionHeading from '@/components/SectionHeading';
import RelatedProducts from '@/components/products/RelatedProducts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();
  const { addItem, items, updateQuantity } = useCart();
  
  const isInCart = items.some(item => item.id === id);
  const cartItem = items.find(item => item.id === id);
  const cartQuantity = cartItem?.quantity || 0;

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!id) throw new Error('معرف المنتج غير صالح');
        
        const data = await ProductsAPI.getProductById(id);
        
        if (!data) {
          throw new Error('لم يتم العثور على المنتج');
        }
        
        console.log("تم استرجاع بيانات المنتج: ", data);
        setProduct(data);
        
        // تعيين الكمية الابتدائية من سلة التسوق إن وجدت
        if (cartItem) {
          setQuantity(cartItem.quantity);
        }
      } catch (err) {
        console.error('خطأ في استرجاع بيانات المنتج:', err);
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل المنتج');
        toast({
          title: "خطأ",
          description: "تعذر تحميل بيانات المنتج",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, toast, cartItem]);
  
  const handleAddToCart = () => {
    if (!product) return;
    
    if (isInCart) {
      updateQuantity(product.id, quantity);
      toast({
        title: "تم تحديث الكمية",
        description: `تم تحديث كمية ${product.name} في سلة التسوق.`,
      });
    } else {
      addItem({
        id: product.id,
        name: product.name,
        price: `${product.price} ${CURRENCY.SYMBOL}`,
        image: product.images && product.images.length > 0 ? 
          product.images[0] : 
          'https://placehold.co/600x400/e2e8f0/1e293b?text=Delight+Car+Products',
      });
      
      toast({
        title: "تمت الإضافة إلى السلة",
        description: `تمت إضافة ${product.name} إلى سلة التسوق بنجاح.`,
      });
    }
  };
  
  const incrementQuantity = () => {
    if (product?.stock && quantity >= product.stock) {
      toast({
        title: "تنبيه",
        description: "لقد وصلت إلى الحد الأقصى المتاح في المخزون",
        variant: "destructive"
      });
      return;
    }
    setQuantity(q => q + 1);
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name || 'منتج ديلايت للعناية بالسيارات',
        text: product?.description || 'تفضل بزيارة موقعنا لمعرفة المزيد',
        url: window.location.href,
      }).catch((error) => console.log('خطأ في المشاركة:', error));
    } else {
      // نسخ الرابط للمتصفحات التي لا تدعم خاصية المشاركة
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "تم نسخ الرابط",
        description: "تم نسخ رابط المنتج بنجاح، يمكنك مشاركته الآن",
      });
    }
  };
  
  const toggleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "تم الإزالة من المفضلة" : "تمت الإضافة للمفضلة",
      description: isLiked 
        ? "تم إزالة المنتج من قائمة المفضلة"
        : "تم إضافة المنتج إلى قائمة المفضلة",
    });
  };
  
  if (isLoading) {
    return <PageLoader message="جاري تحميل المنتج..." />;
  }
  
  if (error || !product) {
    return (
      <div className="container-custom py-16">
        <div className="text-center max-w-md mx-auto bg-red-50 p-8 rounded-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">حدث خطأ</h2>
          <p className="mb-6">{error || 'لم يتم العثور على المنتج المطلوب'}</p>
          <Link to="/products">
            <Button>العودة إلى المنتجات</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pb-20">
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-3 border-b border-gray-100">
        <div className="container-custom">
          <div className="flex items-center text-sm text-gray-500">
            <Link to="/" className="hover:text-amazon-link">الرئيسية</Link>
            <ArrowRight className="h-3 w-3 mx-2 rtl:rotate-180" />
            <Link to="/products" className="hover:text-amazon-link">المنتجات</Link>
            {product.category && (
              <>
                <ArrowRight className="h-3 w-3 mx-2 rtl:rotate-180" />
                <Link to={`/products?category=${product.category}`} className="hover:text-amazon-link">
                  {product.category === 'cleaner' ? 'منظفات' : 
                   product.category === 'polish' ? 'ملمعات' :
                   product.category === 'protection' ? 'حماية' :
                   product.category === 'tire' ? 'الإطارات' : product.category}
                </Link>
              </>
            )}
            <ArrowRight className="h-3 w-3 mx-2 rtl:rotate-180" />
            <span className="font-medium text-gray-800">{product.name}</span>
          </div>
        </div>
      </div>
      
      {/* Product details */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product images */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center relative">
              <motion.button
                onClick={toggleLike}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm"
              >
                <Heart 
                  className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-gray-500'}`} 
                />
              </motion.button>
              
              <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm"
              >
                <Share2 className="w-5 h-5 text-gray-500" />
              </motion.button>
              
              {product.images && product.images.length > 0 ? (
                <motion.img 
                  src={product.images[activeImageIndex]} 
                  alt={product.name} 
                  className="h-full w-full object-contain"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/600x400/e2e8f0/1e293b?text=Delight+Car+Products';
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <ImageOff size={60} className="mb-2" />
                  <span>لا توجد صورة للمنتج</span>
                </div>
              )}
            </div>
            
            {/* Thumbnail gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 space-x-reverse rtl:space-x-reverse overflow-auto pb-1">
                {product.images.map((image, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded border-2 ${
                      activeImageIndex === index ? 'border-amazon-orange' : 'border-gray-200'
                    }`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} - صورة ${index + 1}`} 
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/600x400/e2e8f0/1e293b?text=Delight+Car+Products';
                      }}
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product info */}
          <div className="flex flex-col h-full">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            {/* Product code and availability */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="text-sm text-gray-500">
                رمز المنتج: <span className="font-medium text-gray-700">{product.product_code}</span>
              </span>
              
              {product.stock !== undefined && (
                <span className={`text-sm px-3 py-1 rounded-full ${
                  product.stock > 5 ? 'bg-green-100 text-green-800' : 
                  product.stock > 0 ? 'bg-amber-100 text-amber-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {product.stock > 5 ? 'متوفر' : 
                   product.stock > 0 ? `متبقي ${product.stock} فقط` : 
                   'غير متوفر'}
                </span>
              )}
            </div>
            
            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < 4 ? 'fill-amazon-orange text-amazon-orange' : 'fill-gray-200 text-gray-200'}`} 
                  />
                ))}
              </div>
              <span className="mx-2 text-sm text-gray-500">4.0</span>
              <span className="text-sm text-amazon-link">(0 تقييم)</span>
            </div>
            
            {/* Price */}
            <div className="mb-6">
              {product.discount_price ? (
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-amazon-price">
                    {product.discount_price} {CURRENCY.SYMBOL}
                  </span>
                  <span className="mr-3 text-lg text-gray-400 line-through">
                    {product.price} {CURRENCY.SYMBOL}
                  </span>
                  <span className="mr-3 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                    خصم {Math.round((1 - (product.discount_price / product.price)) * 100)}%
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-amazon-price">
                  {product.price} {CURRENCY.SYMBOL}
                </span>
              )}
              <p className="text-sm text-gray-500 mt-1">
                السعر شامل الضريبة
              </p>
            </div>
            
            {/* Tabs for description & features */}
            <Tabs defaultValue="description" className="mb-6">
              <TabsList className="mb-2">
                <TabsTrigger value="description">الوصف</TabsTrigger>
                {product.features && product.features.length > 0 && (
                  <TabsTrigger value="features">المميزات</TabsTrigger>
                )}
                <TabsTrigger value="usage">طريقة الاستخدام</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="text-gray-600 leading-relaxed">
                {product.description || 'لا يوجد وصف متاح لهذا المنتج.'}
              </TabsContent>
              
              <TabsContent value="features">
                {product.features && product.features.length > 0 && (
                  <ul className="space-y-1 text-gray-600">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
              
              <TabsContent value="usage" className="text-gray-600">
                <p>يرجى اتباع التعليمات المرفقة مع المنتج لضمان أفضل النتائج. في حال عدم وجود تعليمات، يرجى الاتصال بخدمة العملاء للحصول على المساعدة.</p>
              </TabsContent>
            </Tabs>
            
            {/* Low stock warning */}
            {product.stock !== undefined && product.stock > 0 && product.stock <= 5 && (
              <div className="mb-6 flex items-center bg-amber-50 border border-amber-200 p-3 rounded-md">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                <span className="text-sm text-amber-700">
                  كمية محدودة متبقية! فقط {product.stock} قطع في المخزون
                </span>
              </div>
            )}
            
            {/* Quantity */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">الكمية</h3>
              <div className="flex items-center">
                <button
                  onClick={decrementQuantity}
                  className="p-2 border border-gray-300 rounded-r"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="px-4 py-2 border-t border-b border-gray-300 w-16 text-center">
                  {quantity}
                </div>
                <button
                  onClick={incrementQuantity}
                  className="p-2 border border-gray-300 rounded-l"
                  disabled={product.stock !== undefined && quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              {product.stock !== undefined && (
                <p className={`text-sm mt-1 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 
                    ? `متوفر في المخزون (${product.stock} قطعة)`
                    : 'غير متوفر حالياً'
                  }
                </p>
              )}
            </div>
            
            {/* Add to cart */}
            <div className="mt-auto">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  className={`w-full py-6 text-lg ${
                    isInCart 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "amazon-btn-primary"
                  }`}
                  onClick={handleAddToCart}
                  disabled={product.stock !== undefined && product.stock <= 0}
                >
                  <ShoppingCart className="ml-2 h-5 w-5" />
                  {isInCart 
                    ? 'تحديث الكمية في السلة' 
                    : product.stock === 0 
                      ? 'غير متوفر' 
                      : 'إضافة إلى السلة'
                  }
                </Button>
              </motion.div>
            </div>
            
            {/* Shipping info - Updated for Egypt */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <Truck className="h-5 w-5 text-amazon-orange ml-2" />
                <span className="text-sm">شحن سريع متوفر داخل مصر</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-amazon-orange ml-2" />
                <span className="text-sm">ضمان جودة المنتج</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Products Section */}
      {product.category && (
        <RelatedProducts 
          currentProductId={product.id} 
          category={product.category} 
        />
      )}
    </div>
  );
};

export default ProductPage;
