
import React, { useEffect, useState } from 'react';
import { Product } from '@/types/db';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ProductsAPI } from '@/services/productsAPI';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface RelatedProductsProps {
  currentProductId: string;
  category?: string | null;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ 
  currentProductId, 
  category 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      setIsLoading(true);
      try {
        let relatedProducts: Product[] = [];
        
        // إذا كان هناك فئة، ابحث عن منتجات من نفس الفئة
        if (category) {
          relatedProducts = await ProductsAPI.getProductsByCategory(category);
        } 
        
        // إذا لم تكن هناك فئة أو لم يتم العثور على منتجات كافية
        if (!category || relatedProducts.length < 2) {
          relatedProducts = await ProductsAPI.getFeaturedProducts();
        }
        
        // استبعاد المنتج الحالي والاقتصار على 4 منتجات كحد أقصى
        const filteredProducts = relatedProducts
          .filter(product => product.id !== currentProductId)
          .slice(0, 4);
        
        setProducts(filteredProducts);
      } catch (error) {
        console.error('خطأ في تحميل المنتجات ذات الصلة:', error);
        toast({
          title: "تعذر تحميل المنتجات المشابهة",
          description: "يرجى المحاولة مرة أخرى لاحقًا",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRelatedProducts();
  }, [currentProductId, category, toast]);
  
  if (isLoading) {
    return (
      <div className="py-10">
        <h2 className="text-2xl font-bold mb-6 text-center">منتجات مشابهة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow animate-pulse">
              <Skeleton className="h-44 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-8 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (products.length === 0) {
    return null; // لا تعرض أي شيء إذا لم تكن هناك منتجات ذات صلة
  }
  
  return (
    <section className="py-10 border-t border-gray-100 mt-8">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">منتجات قد تعجبك</h2>
          <div className="flex space-s-2">
            <button 
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
              aria-label="السابق"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button 
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
              aria-label="التالي"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {products.map(product => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description || ''}
              image={(product.images && product.images[0]) || 'https://placehold.co/600x400/e2e8f0/1e293b?text=Delight+Car+Products'}
              price={`${product.price} ${CURRENCY.SYMBOL}`}
              rating={4.5}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default RelatedProducts;
