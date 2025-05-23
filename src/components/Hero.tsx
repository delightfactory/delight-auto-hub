
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="container-custom py-20 md:py-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-right"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900">
              منتجات العناية بالسيارات <span className="text-delight-500">الأفضل</span> في المملكة
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-lg mx-auto lg:mr-0">
              نوفر منتجات عالية الجودة للعناية بسيارتك، مصنوعة بأفضل المعايير العالمية
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-end">
              {/* Fix: Wrap Link in Button, not multiple elements in asChild Button */}
              <Button asChild size="lg" className="amazon-btn-primary">
                <Link to="/products">تسوق الآن</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/factory">اكتشف مصنعنا</Link>
              </Button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://placehold.co/800x600/e2e8f0/1e293b?text=Car+Care+Products" 
                alt="منتجات العناية بالسيارات" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute -bottom-5 -left-5 bg-white p-4 rounded-lg shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">منتجات أصلية</p>
                  <p className="text-sm text-gray-600">مضمونة 100%</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[5%] right-[10%] w-64 h-64 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-[15%] left-[20%] w-72 h-72 bg-delight-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[10%] right-[20%] w-80 h-80 bg-amazon-light rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
    </section>
  );
};

export default Hero;
