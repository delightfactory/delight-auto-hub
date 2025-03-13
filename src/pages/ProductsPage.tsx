
import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import SectionHeading from '@/components/SectionHeading';
import { ProductService } from '@/services/productService';

const ProductsPage: React.FC = () => {
  const products = ProductService.getAllProducts();
  const controls = useAnimation();

  useEffect(() => {
    controls.start('visible');
  }, [controls]);

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
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerVariants}
            initial="hidden"
            animate={controls}
          >
            {products.map((product) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
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
