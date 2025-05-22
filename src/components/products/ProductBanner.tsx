
import React from 'react';
import { motion } from 'framer-motion';
import SectionHeading from '@/components/SectionHeading';

const ProductBanner: React.FC = () => {
  return (
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
  );
};

export default ProductBanner;
