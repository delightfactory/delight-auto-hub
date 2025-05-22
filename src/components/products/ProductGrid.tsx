
import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types/db';
import { FileX, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductGridProps {
  products: Product[];
  filteredProducts: Product[];
  isLoading: boolean;
  loadingError: string | null;
  onRefresh: () => void;
  controls: any;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  filteredProducts,
  isLoading,
  loadingError,
  onRefresh,
  controls
}) => {
  // Animation variants
  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15, 
        duration: 0.3 
      } 
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-amazon-orange mb-4" />
        <p className="text-lg font-medium">جاري تحميل المنتجات...</p>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="text-center py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="bg-red-50 text-red-700 p-6 rounded-lg max-w-md mx-auto mb-6">
            <p className="font-bold text-lg mb-2">حدث خطأ أثناء تحميل المنتجات</p>
            <p>{loadingError}</p>
          </div>
          <Button 
            onClick={onRefresh}
            className="bg-amazon-orange hover:bg-amazon-orange/90 text-white transition-colors"
          >
            <RefreshCw className="w-5 h-5 ml-2" />
            إعادة المحاولة
          </Button>
        </motion.div>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="bg-amber-50 text-amber-700 p-6 rounded-lg max-w-md mx-auto mb-6">
            <p className="font-bold text-lg mb-2">لا توجد منتجات تطابق معايير البحث</p>
            <p>حاول تغيير معايير البحث أو التصفية للعثور على المنتجات المطلوبة.</p>
          </div>
          <Button 
            onClick={onRefresh}
            className="bg-amazon-orange hover:bg-amazon-orange/90 text-white transition-colors"
          >
            إعادة ضبط التصفية
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
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
            <ProductCard
              id={product.id}
              name={product.name}
              description={product.description || ''}
              image={(product.images && product.images[0]) || 'https://placehold.co/600x400/e2e8f0/1e293b?text=Delight+Car+Products'}
              price={`${product.price} ر.س`}
              rating={4.5}
            />
          </motion.div>
        ))}
      </motion.div>

      {filteredProducts.length > 0 && (
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-amazon-orange font-medium mb-4">تم عرض {filteredProducts.length} من {products.length} منتج</p>
        </motion.div>
      )}
    </div>
  );
};

export default ProductGrid;
