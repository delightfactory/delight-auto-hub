import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, ShoppingCart, Award, Truck, Shield, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import SectionHeading from '@/components/SectionHeading';
import FactoryTour from '@/components/FactoryTour';
import CategoryShowcase from '@/components/CategoryShowcase';
import { ProductDataService } from '@/services/productDataService';
import { ProgressiveImage } from '@/components/performance/ProgressiveImage';
import { VirtualizedProductGrid } from '@/components/performance/VirtualizedProductGrid';

const Index: React.FC = () => {
  const navigate = useNavigate();

  // جلب المنتجات المميزة
  const { data: featuredProducts = [], isLoading: loadingFeatured } = useQuery({
    queryKey: ['featured-products'],
    queryFn: ProductDataService.getFeaturedProducts
  });

  // جلب المنتجات الجديدة
  const { data: newProducts = [], isLoading: loadingNew } = useQuery({
    queryKey: ['new-products'],
    queryFn: ProductDataService.getNewProducts
  });

  const containerVariants = {
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
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-delight-50 to-white py-20 overflow-hidden">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 text-center md:text-left">
                منتجات العناية بالسيارات
                <span className="text-delight-600 block">الأفضل في مصر</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed text-center md:text-left">
                اكتشف مجموعتنا الواسعة من منتجات التنظيف والعناية بالسيارات المصنوعة بأعلى معايير الجودة العالمية
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
                <Link to="/products">
                  <Button className="text-base w-full sm:w-auto">
                    تسوق الآن
                    <ArrowLeft className="mr-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" className="text-base w-full sm:w-auto">
                    تعرف علينا
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <ProgressiveImage
                src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="منتجات العناية بالسيارات"
                className="rounded-2xl shadow-2xl"
                placeholderColor="#f3f4f6"
                blur={true}
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-delight-100 p-3 rounded-full">
                    <Award className="h-6 w-6 text-delight-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">جودة عالمية</p>
                    <p className="text-gray-600 text-sm">معتمدة دولياً</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="py-8 bg-white">
        <div className="container-custom">
          <SectionHeading 
            title="تصفح الفئات" 
            subtitle="اكتشف منتجاتنا المتنوعة بشكل سهل وسريع"
            center
          />
          <CategoryShowcase 
            maxCategories={24} 
            showSearch={true} 
            compact={true} 
            maxHeight="40vh" 
            showTabs={true}
            showFavorites={true}
          />
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <SectionHeading 
            title="المنتجات المميزة" 
            subtitle="أفضل منتجاتنا المختارة بعناية لعناية مثالية بسيارتك"
            center
          />
          
          {loadingFeatured ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <VirtualizedProductGrid
              products={featuredProducts.map(product => ({
                ...product,
                price: typeof product.price === 'string'
                  ? parseFloat(product.price.replace(/[^\d.]/g, ''))
                  : product.price
              }))}
              onProductClick={product => navigate(`/products/${product.id}`)}
              columns={{ default: 1, sm: 2, md: 3, lg: 4 }}
              gap={6}
              estimateSize={320}
              useWindowScroll={true}
              className="mt-10"
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">لا توجد منتجات مميزة متاحة حالياً</p>
            </div>
          )}
          
          <div className="text-center mt-10">
            <Link to="/products">
              <Button variant="outline" size="lg">
                عرض جميع المنتجات
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* New Products */}
      {newProducts.length > 0 && (
        <section className="py-16">
          <div className="container-custom">
            <SectionHeading 
              title="أحدث المنتجات" 
              subtitle="آخر إضافاتنا من منتجات العناية بالسيارات"
              center
            />
            
            {loadingNew ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <VirtualizedProductGrid
                products={newProducts.map(product => ({
                  ...product,
                  price: typeof product.price === 'string'
                    ? parseFloat(product.price.replace(/[^\d.]/g, ''))
                    : product.price
                }))}
                onProductClick={product => navigate(`/products/${product.id}`)}
                columns={{ default: 1, sm: 2, md: 3, lg: 4 }}
                gap={6}
                estimateSize={320}
                useWindowScroll={true}
                className="mt-10"
              />
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <SectionHeading 
            title="لماذا تختار ديلايت؟" 
            subtitle="نحن نقدم أفضل تجربة تسوق مع ضمان الجودة والخدمة المتميزة"
            center
          />
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} className="text-center bg-white p-8 rounded-xl shadow-sm">
              <div className="bg-delight-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-delight-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">جودة مضمونة</h3>
              <p className="text-gray-600">
                جميع منتجاتنا مصنوعة بأعلى معايير الجودة ومعتمدة دولياً مع ضمان شامل
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-center bg-white p-8 rounded-xl shadow-sm">
              <div className="bg-delight-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Truck className="h-8 w-8 text-delight-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">توصيل سريع</h3>
              <p className="text-gray-600">
                خدمة توصيل سريعة وآمنة لجميع محافظات مصر مع إمكانية الدفع عند الاستلام
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-center bg-white p-8 rounded-xl shadow-sm">
              <div className="bg-delight-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Phone className="h-8 w-8 text-delight-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">دعم فني متخصص</h3>
              <p className="text-gray-600">
                فريق خدمة عملاء متخصص لمساعدتك في اختيار أفضل المنتجات لسيارتك
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Factory Tour Section */}
      <FactoryTour />

      {/* CTA Section */}
      <section className="py-16 bg-delight-600 text-white">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              جاهز لتجربة أفضل منتجات العناية بالسيارات؟
            </h2>
            <p className="text-xl mb-8 text-delight-100">
              انضم إلى آلاف العملاء الراضين واحصل على أفضل عروضنا
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" variant="secondary" className="text-lg w-full sm:w-auto">
                  تسوق الآن
                  <ShoppingCart className="mr-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="text-lg border-white text-white hover:bg-white hover:text-delight-600 w-full sm:w-auto">
                  تواصل معنا
                  <Phone className="mr-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
