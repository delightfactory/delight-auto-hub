
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Star, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SectionHeading from '@/components/SectionHeading';
import { toast } from '@/components/ui/use-toast';
import { useCart } from '@/context/CartContext';
import { ProductService } from '@/services/productService';

const ProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const controls = useAnimation();
  
  const product = productId ? ProductService.getProductById(productId) : null;
  const relatedProducts = product ? ProductService.getRelatedProducts(product.id) : [];
  
  const { addItem } = useCart();
  
  useEffect(() => {
    controls.start('visible');
  }, [productId, controls]);
  
  if (!product) {
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
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-contain"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
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
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-500' : 'fill-gray-200'}`} 
                    />
                  ))}
                  <span className="text-sm text-gray-700 mr-2">{product.rating} ({product.reviews} تقييم)</span>
                </div>
              </div>
              
              <div className="text-2xl font-bold text-delight-600 mb-6">
                {product.price}
              </div>
              
              <p className="text-gray-700 mb-6">
                {product.fullDescription}
              </p>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">المميزات</h3>
                <motion.ul 
                  className="space-y-2"
                  variants={staggerVariants}
                  initial="hidden"
                  animate={controls}
                >
                  {product.features?.map((feature, index) => (
                    <motion.li key={index} variants={fadeInVariants} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 ml-2" />
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
              
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={handleAddToCart}
                  className="w-full md:w-auto text-lg py-6"
                  size="lg"
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
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10"
              variants={staggerVariants}
              initial="hidden"
              animate={controls}
            >
              {relatedProducts.map((relatedProduct) => (
                <motion.div 
                  key={relatedProduct.id}
                  variants={fadeInVariants}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-xl shadow-sm p-4"
                >
                  <Link to={`/products/${relatedProduct.id}`}>
                    <div className="aspect-square w-full bg-gray-100 rounded-lg mb-4 overflow-hidden">
                      <motion.img 
                        src={relatedProduct.image} 
                        alt={relatedProduct.name} 
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <h3 className="text-lg font-semibold">{relatedProduct.name}</h3>
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">{relatedProduct.description}</p>
                    <p className="text-delight-600 font-bold mt-2">{relatedProduct.price}</p>
                  </Link>
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
