
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ProductsAPI } from '@/services/productsAPI';
import { Product } from '@/types/db';
import ProductCard from './ProductCard';
import SectionHeading from './SectionHeading';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';

interface FeaturedProductsProps {
  type: 'featured' | 'new';
  title: string;
  subtitle: string;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ type, title, subtitle }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      
      try {
        let data: Product[];
        
        if (type === 'featured') {
          data = await ProductsAPI.getFeaturedProducts();
        } else {
          data = await ProductsAPI.getNewProducts();
        }
        
        console.log(`Fetched ${type} products:`, data);
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching ${type} products:`, err);
        setError('حدث خطأ أثناء تحميل المنتجات');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [type]);
  
  // Animation variants
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
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 70 }
    }
  };
  
  // Loading skeleton
  if (isLoading) {
    return (
      <section className="py-20">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 max-w-full mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[350px] rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  // Error state
  if (error) {
    return (
      <section className="py-20">
        <div className="container-custom">
          <SectionHeading title={title} subtitle={subtitle} center />
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-8 max-w-lg mx-auto">
            <div className="flex items-center text-red-600 mb-3">
              <AlertTriangle size={24} className="ml-2" />
              <h3 className="font-bold">خطأ</h3>
            </div>
            <p className="text-gray-700">{error}</p>
          </div>
        </div>
      </section>
    );
  }
  
  // No products found
  if (products.length === 0) {
    return (
      <section className="py-20">
        <div className="container-custom">
          <SectionHeading title={title} subtitle={subtitle} center />
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mt-8 max-w-lg mx-auto">
            <p className="text-center text-amber-700">
              {type === 'featured' ? 'لا توجد منتجات مميزة متاحة حالياً' : 'لا توجد منتجات جديدة متاحة حالياً'}
            </p>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-20">
      <div className="container-custom">
        <SectionHeading title={title} subtitle={subtitle} center />
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
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
      </div>
    </section>
  );
};

export default FeaturedProducts;
