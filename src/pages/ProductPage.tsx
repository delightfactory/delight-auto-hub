
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SectionHeading from '@/components/SectionHeading';
import { toast } from '@/components/ui/use-toast';
import { useCart } from '@/context/CartContext';

// This would come from an API in a real application
const getProductData = (id: string) => {
  const products = {
    'interior-cleaner': {
      id: 'interior-cleaner',
      name: 'منظف المقصورة الداخلية',
      description: 'منظف عالي الجودة للمقصورة الداخلية للسيارة، يزيل البقع والأوساخ بفعالية ويترك رائحة منعشة.',
      fullDescription: 'منظف المقصورة الداخلية من ديلايت هو منتج متميز مصمم خصيصًا للعناية بالأجزاء الداخلية للسيارة. يعمل على إزالة الأوساخ والغبار والبقع بفعالية من جميع الأسطح الداخلية مثل لوحة القيادة والمقاعد والأبواب. كما أنه يترك طبقة واقية تحمي من الأشعة فوق البنفسجية وتمنع تشقق وتلف الأسطح الداخلية. بالإضافة إلى ذلك، يضفي هذا المنظف لمعانًا طبيعيًا ورائحة منعشة تدوم طويلًا.',
      price: '75 ريال',
      rating: 4.8,
      reviews: 124,
      image: '/placeholder.svg',
      features: [
        'يزيل الأوساخ والبقع بفعالية',
        'آمن لجميع أنواع الأسطح الداخلية',
        'يحمي من الأشعة فوق البنفسجية',
        'رائحة منعشة تدوم طويلاً',
        'سهل الاستخدام'
      ],
      relatedProducts: ['exterior-cleaner', 'tire-shine', 'dashboard-protectant']
    },
    'exterior-cleaner': {
      id: 'exterior-cleaner',
      name: 'منظف الهيكل الخارجي',
      description: 'منظف متطور للهيكل الخارجي للسيارة، يزيل الأوساخ والشحوم ويمنح لمعاناً فائقاً.',
      fullDescription: 'منظف الهيكل الخارجي من ديلايت هو منتج احترافي لتنظيف وحماية السطح الخارجي للسيارة. يعمل على إزالة الأوساخ والشحوم والحشرات وبقع الطيور بكفاءة عالية دون الإضرار بطبقة الطلاء. كما أنه يضفي طبقة لامعة تحمي السيارة من العوامل البيئية وتمنحها مظهراً جذاباً كسيارات المعارض.',
      price: '85 ريال',
      rating: 4.7,
      reviews: 98,
      image: '/placeholder.svg',
      features: [
        'تنظيف عميق دون خدش الطلاء',
        'حماية من العوامل البيئية',
        'لمعان فائق يدوم طويلاً',
        'آمن للاستخدام على جميع أنواع الطلاء',
        'اقتصادي في الاستخدام'
      ],
      relatedProducts: ['interior-cleaner', 'tire-shine', 'wax-polish']
    },
    'tire-shine': {
      id: 'tire-shine',
      name: 'ملمع الإطارات',
      description: 'ملمع إطارات عالي الجودة يمنح الإطارات مظهراً جديداً ولامعاً ويحميها من التشقق والتلف.',
      fullDescription: 'ملمع الإطارات من ديلايت هو منتج متخصص يعيد للإطارات رونقها ومظهرها الجديد. يعمل على تغذية المطاط وحمايته من التشقق والتلف بسبب أشعة الشمس والعوامل البيئية. كما أنه يمنح الإطارات لمعاناً أسود عميقاً يدوم لفترة طويلة، مما يعزز المظهر العام للسيارة.',
      price: '55 ريال',
      rating: 4.9,
      reviews: 132,
      image: '/placeholder.svg',
      features: [
        'لمعان أسود عميق',
        'حماية من الأشعة فوق البنفسجية',
        'مقاوم للماء والأوساخ',
        'سهل التطبيق',
        'يدوم لعدة أسابيع'
      ],
      relatedProducts: ['interior-cleaner', 'exterior-cleaner', 'wheel-cleaner']
    },
  };
  
  return products[id as keyof typeof products] || null;
};

const ProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const product = productId ? getProductData(productId) : null;
  const { addItem } = useCart();
  
  if (!product) {
    return (
      <div className="container-custom py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">المنتج غير موجود</h2>
          <p className="mb-8">عذراً، لم نتمكن من العثور على المنتج الذي تبحث عنه.</p>
          <Link to="/products">
            <Button>العودة إلى المنتجات</Button>
          </Link>
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

  // Get related products data
  const relatedProducts = product.relatedProducts?.map(id => getProductData(id)).filter(p => p) || [];

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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <div className="aspect-square w-full bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
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
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 ml-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button 
                onClick={handleAddToCart}
                className="w-full md:w-auto text-lg py-6"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 ml-2" />
                <span>إضافة إلى السلة</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <SectionHeading 
            title="منتجات ذات صلة" 
            subtitle="منتجات أخرى قد تهمك من مجموعة ديلايت للعناية بالسيارات"
            center
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {relatedProducts.map((relatedProduct) => (
              <motion.div 
                key={relatedProduct?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl shadow-sm p-4"
              >
                <Link to={`/products/${relatedProduct?.id}`}>
                  <div className="aspect-square w-full bg-gray-100 rounded-lg mb-4 overflow-hidden">
                    <img 
                      src={relatedProduct?.image} 
                      alt={relatedProduct?.name} 
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                  </div>
                  <h3 className="text-lg font-semibold">{relatedProduct?.name}</h3>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">{relatedProduct?.description}</p>
                  <p className="text-delight-600 font-bold mt-2">{relatedProduct?.price}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductPage;
