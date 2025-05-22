
import React from 'react';
import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'أحمد محمد',
    role: 'مالك سيارة BMW',
    content: 'منتجات رائعة وفعالة، استخدمت ملمع السيارات وأصبحت سيارتي تلمع كالجديدة. أنصح بشدة بهذه المنتجات.',
    avatar: 'https://placehold.co/100/5a67d8/ffffff?text=AM',
  },
  {
    id: '2',
    name: 'سارة الأحمد',
    role: 'مالكة سيارة مرسيدس',
    content: 'حقًا أفضل منتجات للعناية بالسيارات استخدمتها. النتائج فورية وملحوظة، خاصة منظف المقاعد الجلدية.',
    avatar: 'https://placehold.co/100/ef4444/ffffff?text=SA',
  },
  {
    id: '3',
    name: 'فهد العتيبي',
    role: 'محب السيارات',
    content: 'استخدمت منتجات كثيرة على مر السنين، لكن منتجات ديلايت هي الأفضل من حيث الجودة والنتائج. سعيد جدًا بالنتيجة!',
    avatar: 'https://placehold.co/100/eab308/ffffff?text=FA',
  },
];

const Testimonials: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container-custom">
        <SectionHeading 
          title="آراء عملائنا" 
          subtitle="اقرأ ما يقوله عملاؤنا حول منتجات العناية بالسيارات من ديلايت" 
          center
        />
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={itemVariants}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="flex items-center mb-6">
                <Avatar className="h-12 w-12 border-2 border-gray-100">
                  <AvatarImage src={testimonial.avatar} />
                  <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="mr-4">
                  <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
              
              <blockquote>
                <p className="text-gray-700 leading-relaxed">"{testimonial.content}"</p>
              </blockquote>
              
              <div className="mt-6 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star}
                    className="h-5 w-5 text-yellow-400 fill-current" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
