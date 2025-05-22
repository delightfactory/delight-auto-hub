
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  ArrowRight,
  ShieldCheck,
  AreaChart,
  Award,
  Factory,
  Sparkles,
  CarFront
} from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import ProductCard from '@/components/ProductCard';
import { ProductService } from '@/services/productService';
import { useQuery } from '@tanstack/react-query';
import { 
  heroSettingsService, 
  testimonialsService,
  ctaSettingsService
} from '@/services/homepageService';
import { Skeleton } from '@/components/ui/skeleton';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const HomePage: React.FC = () => {
  // Get featured products from the service
  const featuredProducts = ProductService.getFeaturedProducts();
  
  // Animation hooks
  const controlsFeatures = useAnimation();
  const controlsProducts = useAnimation();
  const controlsTestimonials = useAnimation();
  
  const featuresRef = useRef(null);
  const productsRef = useRef(null);
  const testimonialsRef = useRef(null);
  
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.3 });
  const productsInView = useInView(productsRef, { once: true, amount: 0.1 });
  const testimonialsInView = useInView(testimonialsRef, { once: true, amount: 0.1 });
  
  // Fetch hero settings
  const { data: heroSettings, isLoading: isLoadingHero } = useQuery({
    queryKey: ['heroSettings'],
    queryFn: heroSettingsService.getHeroSettings
  });
  
  // Fetch testimonials
  const { data: testimonials, isLoading: isLoadingTestimonials } = useQuery({
    queryKey: ['testimonials'],
    queryFn: testimonialsService.getTestimonials
  });
  
  // Fetch CTA settings
  const { data: ctaSettings, isLoading: isLoadingCTA } = useQuery({
    queryKey: ['ctaSettings'],
    queryFn: ctaSettingsService.getCTASettings
  });
  
  useEffect(() => {
    if (featuresInView) {
      controlsFeatures.start('visible');
    }
    if (productsInView) {
      controlsProducts.start('visible');
    }
    if (testimonialsInView) {
      controlsTestimonials.start('visible');
    }
  }, [featuresInView, productsInView, testimonialsInView, controlsFeatures, controlsProducts, controlsTestimonials]);
  
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${isLoadingHero ? 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80' : heroSettings?.background_image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80'})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/50"></div>
        </div>
        
        <div className="container-custom relative z-10 py-20">
          <div className="max-w-2xl text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 mb-5 rounded-full bg-delight-600/20 text-delight-400 font-medium text-sm backdrop-blur-sm border border-delight-500/20">
                الأفضل في العناية بالسيارات
              </span>
            </motion.div>
            
            {isLoadingHero ? (
              <>
                <Skeleton className="h-12 w-3/4 mb-6 bg-gray-700/30" />
                <Skeleton className="h-20 w-full mb-8 bg-gray-700/30" />
              </>
            ) : (
              <>
                <motion.h1 
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <span className="text-gradient">{heroSettings?.title || 'تألق مع منتجات DELIGHT للعناية بالسيارات'}</span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl text-slate-300 mb-8 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {heroSettings?.subtitle || 'منتجات مبتكرة عالية الجودة لحماية سيارتك والحفاظ عليها بأفضل مظهر وأداء. صنعت بأيدي خبراء ومطورة بأحدث التقنيات.'}
                </motion.p>
              </>
            )}
            
            <motion.div 
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 sm:rtl:space-x-reverse"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link to={heroSettings?.button_link || "/products"}>
                <Button className="btn-primary w-full sm:w-auto text-lg px-8 py-4">
                  <span>{heroSettings?.button_text || "استكشف منتجاتنا"}</span>
                  <ChevronRight className="ml-2 h-5 w-5 rtl:rotate-180" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="border-white border-2 text-white hover:bg-white/10 w-full sm:w-auto text-lg px-8 py-4">
                  تواصل معنا
                </Button>
              </Link>
            </motion.div>
            
            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-delight-400">+50</div>
                <div className="text-slate-300 mt-1">منتج متخصص</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-delight-400">+15</div>
                <div className="text-slate-300 mt-1">سنوات خبرة</div>
              </div>
              <div className="text-center col-span-2 md:col-span-1">
                <div className="text-3xl font-bold text-delight-400">+30</div>
                <div className="text-slate-300 mt-1">دولة حول العالم</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="section bg-white" ref={featuresRef}>
        <div className="container-custom">
          <SectionHeading 
            title="لماذا تختار منتجات DELIGHT"
            subtitle="نسعى دائمًا لتقديم أفضل المنتجات المبتكرة والفعالة للعناية بسيارتك من الداخل والخارج"
            center
          />
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate={controlsFeatures}
          >
            {/* Feature 1 */}
            <motion.div 
              className="glass-card rounded-xl p-8 flex flex-col items-center text-center"
              variants={fadeInUp}
            >
              <div className="w-16 h-16 rounded-full bg-delight-100 flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-delight-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">جودة عالمية</h3>
              <p className="text-slate-600">
                منتجاتنا مصنعة وفق أعلى معايير الجودة العالمية وتمتثل لجميع المعايير البيئية والصحية.
              </p>
            </motion.div>
            
            {/* Feature 2 */}
            <motion.div 
              className="glass-card rounded-xl p-8 flex flex-col items-center text-center"
              variants={fadeInUp}
            >
              <div className="w-16 h-16 rounded-full bg-delight-100 flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-delight-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">نتائج فعالة</h3>
              <p className="text-slate-600">
                صيغ متطورة تمنح سيارتك نتائج فورية ومذهلة مع حماية طويلة الأمد ومظهر احترافي لامع.
              </p>
            </motion.div>
            
            {/* Feature 3 */}
            <motion.div 
              className="glass-card rounded-xl p-8 flex flex-col items-center text-center lg:col-span-1 md:col-span-2 lg:col-start-auto md:col-start-1"
              variants={fadeInUp}
            >
              <div className="w-16 h-16 rounded-full bg-delight-100 flex items-center justify-center mb-6">
                <Award className="w-8 h-8 text-delight-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">تكنولوجيا متقدمة</h3>
              <p className="text-slate-600">
                استخدام أحدث التقنيات والمركبات المبتكرة لتوفير حماية فائقة وأداء استثنائي لكل منتج.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* About Section */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="relative z-10">
                  <img 
                    src="https://images.unsplash.com/photo-1635770311293-b9ea6a189c43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                    alt="DELIGHT Factory" 
                    className="rounded-xl shadow-xl"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-delight-100 rounded-full -z-10"></div>
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-delight-200 rounded-full -z-10"></div>
              </motion.div>
            </div>
            
            {/* Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-1.5 mb-5 rounded-full bg-delight-100 text-delight-600 font-medium text-sm">
                  من نحن
                </span>
                <h2 className="text-3xl md:text-4xl font-semibold mb-6">
                  رواد صناعة منتجات العناية بالسيارات
                </h2>
                <p className="text-slate-600 mb-8 text-lg">
                  تأسست شركة DELIGHT بهدف تقديم أفضل منتجات العناية بالسيارات التي تجمع بين الكفاءة العالية والتركيبات الآمنة للبيئة. نحن نفخر بمصنعنا المتطور الذي يستخدم أحدث التقنيات والمعدات.
                </p>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <div className="flex items-center mb-2">
                      <Factory className="w-5 h-5 text-delight-600 mr-2" />
                      <h3 className="font-semibold text-slate-800">مصنع متطور</h3>
                    </div>
                    <p className="text-slate-600">
                      مصنع حديث مجهز بأحدث المعدات والتقنيات لضمان جودة المنتجات.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <AreaChart className="w-5 h-5 text-delight-600 mr-2" />
                      <h3 className="font-semibold text-slate-800">تطوير مستمر</h3>
                    </div>
                    <p className="text-slate-600">
                      فريق بحث وتطوير يعمل باستمرار على تحسين وابتكار منتجات جديدة.
                    </p>
                  </div>
                </div>
                
                <Link to="/about">
                  <Button className="btn-primary">
                    <span>اكتشف المزيد عنا</span>
                    <ArrowRight className="ml-2 h-5 w-5 rtl:rotate-180" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="section bg-white" ref={productsRef}>
        <div className="container-custom">
          <SectionHeading 
            title="منتجاتنا المميزة"
            subtitle="مجموعة منتقاة من منتجاتنا عالية الجودة للعناية المثالية بسيارتك"
            center
          />
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate={controlsProducts}
          >
            {featuredProducts.map((product) => (
              <motion.div key={product.id} variants={fadeInUp}>
                <ProductCard
                  id={product.id}
                  name={product.name}
                  description={product.description}
                  image={product.image}
                  price={product.price}
                  rating={product.rating}
                />
              </motion.div>
            ))}
          </motion.div>
          
          <div className="text-center mt-12">
            <Link to="/products">
              <Button className="btn-primary text-lg px-8 py-3">
                <span>عرض جميع المنتجات</span>
                <ArrowRight className="ml-2 h-5 w-5 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-delight-800 to-blue-900 text-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            {isLoadingCTA ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-3/4 mx-auto bg-white/20" />
                <Skeleton className="h-16 w-full mx-auto bg-white/20" />
                <Skeleton className="h-12 w-48 mx-auto mt-6 bg-white/20" />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  {ctaSettings?.title || 'هل أنت مهتم بتوزيع منتجات DELIGHT؟'}
                </h2>
                <p className="text-xl text-delight-100 mb-8">
                  {ctaSettings?.subtitle || 'انضم إلى شبكة موزعينا حول العالم واستفد من منتجاتنا عالية الجودة والدعم المستمر'}
                </p>
                <Link to={ctaSettings?.button_link || '/contact'}>
                  <Button className="bg-white text-delight-800 hover:bg-delight-50 px-8 py-3 text-lg font-medium rounded-lg">
                    {ctaSettings?.button_text || 'تواصل مع فريق المبيعات'}
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="section bg-gray-50" ref={testimonialsRef}>
        <div className="container-custom">
          <SectionHeading 
            title="ما يقوله عملاؤنا"
            subtitle="آراء عملائنا الذين جربوا منتجاتنا وخدماتنا"
            center
          />
          
          {isLoadingTestimonials ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-md">
                  <Skeleton className="h-24 w-full mb-4" />
                  <div className="flex items-center">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="ml-3">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24 mt-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : testimonials && testimonials.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              animate={controlsTestimonials}
            >
              {testimonials.map((testimonial) => (
                <motion.div 
                  key={testimonial.id}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md"
                  variants={fadeInUp}
                >
                  <p className="text-gray-600 dark:text-gray-300 mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center text-gray-500">
                      {testimonial.avatar_url ? (
                        <img src={testimonial.avatar_url} alt={testimonial.author_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold">{testimonial.author_name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="mr-4">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100">{testimonial.author_name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.author_role}{testimonial.company ? `, ${testimonial.company}` : ''}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center text-gray-500">
              لا توجد شهادات متاحة حاليًا.
            </div>
          )}
        </div>
      </section>
      
      {/* Partners Section */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <SectionHeading 
            title="شركاء النجاح"
            subtitle="نفخر بالتعاون مع العديد من الشركات والعلامات التجارية الرائدة حول العالم"
            center
          />
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center justify-items-center">
            {/* Partner logos - using placeholder colored boxes */}
            {[...Array(6)].map((_, index) => (
              <motion.div
                key={index}
                className="w-32 h-20 flex items-center justify-center p-4 bg-white rounded-lg shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <CarFront className="w-full h-full text-delight-500/40" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
