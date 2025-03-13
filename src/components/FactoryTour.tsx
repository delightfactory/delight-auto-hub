
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Factory tour data
const tourData = [
  {
    id: 'raw-materials',
    title: 'مرحلة المواد الخام',
    description: 'نستخدم فقط أجود أنواع المواد الخام المستوردة من أفضل الموردين العالميين. كل مادة يتم فحصها بعناية في مختبراتنا قبل استخدامها في عمليات الإنتاج.',
    image: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=800'
  },
  {
    id: 'mixing',
    title: 'مرحلة الخلط والتصنيع',
    description: 'يتم خلط المواد الخام بدقة وفق تركيبات مدروسة ومعادلات كيميائية متقنة. نستخدم أحدث المعدات الأوتوماتيكية للتأكد من جودة المنتج النهائي.',
    image: 'https://images.unsplash.com/photo-1581093458791-9ca5d86762c1?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=800'
  },
  {
    id: 'quality-control',
    title: 'مرحلة ضبط الجودة',
    description: 'يخضع كل منتج لاختبارات صارمة في مختبراتنا للتأكد من مطابقته للمعايير العالمية. نفحص الفعالية، الأمان، الثبات، ومدة الصلاحية قبل الاعتماد النهائي.',
    image: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=800'
  },
  {
    id: 'packaging',
    title: 'مرحلة التعبئة والتغليف',
    description: 'نستخدم أحدث خطوط التعبئة الأوتوماتيكية لضمان دقة التعبئة ونظافتها. عبواتنا مصممة لحماية المنتج وسهولة الاستخدام وجاذبية المظهر.',
    image: 'https://images.unsplash.com/photo-1581094479004-5c7be9f53e49?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=800'
  },
  {
    id: 'distribution',
    title: 'مرحلة التوزيع',
    description: 'شبكة توزيع متكاملة تضمن وصول منتجاتنا للعملاء في جميع أنحاء المملكة والعالم. نستخدم أنظمة تخزين متطورة وأسطول نقل حديث.',
    image: 'https://images.unsplash.com/photo-1581093502151-6e6174fd117a?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=800'
  }
];

const FactoryTour: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === tourData.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? tourData.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-delight-50 to-white rounded-xl shadow-md">
      <div className="relative aspect-[16/9] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <img 
              src={tourData[currentSlide].image} 
              alt={tourData[currentSlide].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation arrows */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white rounded-full w-10 h-10 z-10"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white rounded-full w-10 h-10 z-10"
          onClick={nextSlide}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
        
        {/* Slide info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl font-bold mb-2">{tourData[currentSlide].title}</h3>
              <p className="text-white/90">{tourData[currentSlide].description}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Dots navigation */}
      <div className="flex justify-center p-4 gap-2">
        {tourData.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-delight-600 w-6' : 'bg-gray-300'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default FactoryTour;
