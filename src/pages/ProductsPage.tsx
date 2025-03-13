
import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/ProductCard';
import SectionHeading from '@/components/SectionHeading';
import { ProductService } from '@/services/productService';
import PageLoader from '@/components/PageLoader';
import { LoaderCircle, Filter, Search } from 'lucide-react';

const ProductsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState(ProductService.getAllProducts());
  const [searchTerm, setSearchTerm] = useState('');
  const controls = useAnimation();
  const { toast } = useToast();

  useEffect(() => {
    // Simulate API loading
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        const allProducts = ProductService.getAllProducts();
        setProducts(allProducts);
        controls.start('visible');
        
        toast({
          title: "تم تحميل المنتجات",
          description: `تم تحميل ${allProducts.length} منتج بنجاح`,
          duration: 3000,
        });
      } catch (error) {
        console.error('Failed to load products:', error);
        toast({
          title: "حدث خطأ",
          description: "لم نتمكن من تحميل المنتجات، يرجى المحاولة مرة أخرى",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, [controls, toast]);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <motion.section 
        className="bg-gradient-to-r from-delight-800 to-blue-900 py-20 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SectionHeading
              title="منتجاتنا"
              subtitle="مجموعة متكاملة من منتجات العناية بالسيارات الاحترافية"
              center
              className="text-white max-w-xl mx-auto"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-delight-50/50">
        <div className="container-custom">
          <motion.div 
            className="flex flex-col md:flex-row gap-4 justify-between items-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative w-full md:w-auto flex-1 max-w-md">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pr-10 py-3 border border-gray-300 rounded-lg focus:ring-delight-500 focus:border-delight-500"
                placeholder="ابحث عن منتج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 py-3 px-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
            >
              <Filter className="h-5 w-5 text-delight-600" />
              <span>تصفية النتائج</span>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16">
        <div className="container-custom">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                {searchTerm ? (
                  <>
                    <p className="text-gray-600 text-xl mb-4">لا توجد نتائج تطابق بحثك</p>
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="bg-delight-500 text-white px-4 py-2 rounded-md hover:bg-delight-600 transition-colors"
                    >
                      عرض جميع المنتجات
                    </button>
                  </>
                ) : (
                  <>
                    <LoaderCircle className="h-12 w-12 text-delight-400 animate-spin mb-4" />
                    <p className="text-gray-600">لا توجد منتجات متاحة حالياً</p>
                  </>
                )}
              </motion.div>
            </div>
          ) : (
            <>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={staggerVariants}
                initial="hidden"
                animate={controls}
              >
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <Link to={`/products/${product.id}`}>
                      <ProductCard
                        id={product.id}
                        name={product.name}
                        description={product.description}
                        image={product.image}
                        price={product.price}
                        rating={product.rating}
                      />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div 
                className="mt-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <p className="text-delight-700 mb-4">تم عرض {filteredProducts.length} من {products.length} منتج</p>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-delight-50 py-16">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <SectionHeading
              title="منتجات احترافية للعناية بسيارتك"
              subtitle="تمتع بتجربة مميزة مع منتجات ديلايت المصنوعة بأعلى معايير الجودة"
              center
            />
            <p className="mt-6 max-w-2xl mx-auto text-gray-600">
              جميع منتجاتنا مصنعة محلياً في المملكة العربية السعودية باستخدام أحدث التقنيات والمواد عالية الجودة. نحن نضمن رضاك التام عن كل منتج من منتجاتنا.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-8 bg-gradient-to-r from-delight-600 to-delight-700 text-white px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              تواصل معنا
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;
