
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import SectionHeading from '@/components/SectionHeading';

// This would come from an API in a real application
const productData = [
  {
    id: 'interior-cleaner',
    name: 'منظف المقصورة الداخلية',
    description: 'منظف عالي الجودة للمقصورة الداخلية للسيارة، يزيل البقع والأوساخ بفعالية ويترك رائحة منعشة.',
    image: '/placeholder.svg'
  },
  {
    id: 'exterior-cleaner',
    name: 'منظف الهيكل الخارجي',
    description: 'منظف متطور للهيكل الخارجي للسيارة، يزيل الأوساخ والشحوم ويمنح لمعاناً فائقاً.',
    image: '/placeholder.svg'
  },
  {
    id: 'tire-shine',
    name: 'ملمع الإطارات',
    description: 'ملمع إطارات عالي الجودة يمنح الإطارات مظهراً جديداً ولامعاً ويحميها من التشقق والتلف.',
    image: '/placeholder.svg'
  },
  {
    id: 'dashboard-protectant',
    name: 'حامي لوحة القيادة',
    description: 'منتج متخصص لحماية لوحة القيادة من الأشعة فوق البنفسجية وإضفاء لمعان طبيعي.',
    image: '/placeholder.svg'
  },
  {
    id: 'wheel-cleaner',
    name: 'منظف الجنوط',
    description: 'منظف قوي للجنوط يزيل الأوساخ العنيدة وغبار الفرامل دون التسبب في أي ضرر.',
    image: '/placeholder.svg'
  },
  {
    id: 'wax-polish',
    name: 'شمع التلميع',
    description: 'شمع تلميع عالي الجودة يمنح سيارتك لمعاناً كالمرآة ويوفر حماية تدوم لأشهر.',
    image: '/placeholder.svg'
  }
];

const ProductsPage: React.FC = () => {
  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-delight-800 to-blue-900 py-20 text-white">
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
      </section>

      {/* Products Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productData.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={`/products/${product.id}`}>
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    image={product.image}
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-delight-50 py-16">
        <div className="container-custom text-center">
          <SectionHeading
            title="منتجات احترافية للعناية بسيارتك"
            subtitle="تمتع بتجربة مميزة مع منتجات ديلايت المصنوعة بأعلى معايير الجودة"
            center
          />
          <p className="mt-6 max-w-2xl mx-auto text-gray-600">
            جميع منتجاتنا مصنعة محلياً في المملكة العربية السعودية باستخدام أحدث التقنيات والمواد عالية الجودة. نحن نضمن رضاك التام عن كل منتج من منتجاتنا.
          </p>
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;
