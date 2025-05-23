
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useAnimation } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Star, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SectionHeading from '@/components/SectionHeading';
import { toast } from '@/components/ui/use-toast';
import { useCart } from '@/context/CartContext';
import { ProductDataService } from '@/services/productDataService';
import ProductCard from '@/components/ProductCard';

const ProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const controls = useAnimation();
  const { addItem } = useCart();
  
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
    queryKey: ['related-products', productId, product?.category],
    queryFn: () => {
      if (!productId) return [];
      return ProductDataService.getRelatedProducts(productId, product?.category);
    },
    enabled: !!productId && !!product,
    retry: 1
  });
  
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
    <div className="pb-20">
      {/* Breadcrumb */}
      <div className="bg-gray-100 py-4">
        <div className="container-custom">
          <Link to="/products" className="inline-flex items-center text-delight-600 hover:text-delight-800 transition-colors">
            <ArrowLeft className="w-4 h-4 ml-1" />
            <span>العودة إلى المنتجات</span>
          </Link>
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
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <div className="aspect-square w-full bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                <motion.img 
                  src={product.image || '/placeholder.svg'} 
                  alt={product.name} 
                  className="w-full h-full object-contain"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  onError={(e) => {
                    console.error('Image loading error for product:', product.id);
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
              
              {/* Additional Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 mt-4">
                  {product.images.slice(1, 4).map((image, index) => (
                    <div key={index} className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={image} 
                        alt={`${product.name} ${index + 2}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              variants={fadeInVariants}
              initial="hidden"
              animate={controls}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-amber-500' : 'fill-gray-200'}`} 
                    />
                  ))}
                  <span className="text-sm text-gray-700 mr-2">
                    {rating.toFixed(1)} ({reviews} تقييم)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="text-2xl font-bold text-delight-600">
                  {product.price}
                </div>
                {product.originalPrice && (
                  <div className="text-lg text-gray-400 line-through">
                    {product.originalPrice}
                  </div>
                )}
                {product.isNew && (
                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                    جديد
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock && product.stock > 0 ? (
                  <div className="flex items-center text-green-600">
                    <Check className="w-4 h-4 ml-1" />
                    <span>متوفر في المخزون ({product.stock} قطعة)</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <AlertTriangle className="w-4 h-4 ml-1" />
                    <span>غير متوفر في المخزون</span>
                  </div>
                )}
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                {product.fullDescription || product.description}
              </p>
              
              {product.features && product.features.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3">المميزات</h3>
                  <motion.ul 
                    className="space-y-2"
                    variants={staggerVariants}
                    initial="hidden"
                    animate={controls}
                  >
                    {product.features.map((feature, index) => (
                      <motion.li key={index} variants={fadeInVariants} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 ml-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
              )}
              
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={handleAddToCart}
                  className="w-full md:w-auto text-lg py-6"
                  size="lg"
                  disabled={!product.stock || product.stock === 0}
                >
                  <ShoppingCart className="w-5 h-5 ml-2" />
                  <span>إضافة إلى السلة</span>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container-custom">
            <SectionHeading 
              title="منتجات ذات صلة" 
              subtitle="منتجات أخرى قد تهمك من مجموعة ديلايت للعناية بالسيارات"
              center
            />
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10"
              variants={staggerVariants}
              initial="hidden"
              animate={controls}
            >
              {relatedProducts.map((relatedProduct) => (
                <motion.div 
                  key={relatedProduct.id}
                  variants={fadeInVariants}
                >
                  <ProductCard
                    id={relatedProduct.id}
                    name={relatedProduct.name}
                    description={relatedProduct.description}
                    image={relatedProduct.image}
                    price={relatedProduct.price}
                    rating={relatedProduct.rating}
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
