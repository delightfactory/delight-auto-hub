
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAnimation } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { ProductsAPI } from '@/services/productsAPI';
import { Product } from "@/types/db";
import { Skeleton } from '@/components/ui/skeleton';

// Components
import ProductBanner from '@/components/products/ProductBanner';
import ProductFilters from '@/components/products/ProductFilters';
import ProductGrid from '@/components/products/ProductGrid';
import ProductCta from '@/components/products/ProductCta';

// Product card skeleton loader
const ProductCardSkeleton = () => (
  <div className="overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm p-2">
    <Skeleton className="aspect-[4/3] w-full mb-4" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-5 w-1/4" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  </div>
);

// Category definition for filters
const categories = [
  { id: 'all', name: 'الكل' },
  { id: 'cleaner', name: 'منظفات' },
  { id: 'polish', name: 'ملمعات' },
  { id: 'protection', name: 'حماية' },
  { id: 'tire', name: 'الإطارات' }
];

interface FilterValues {
  category: string;
  priceRange: [number, number];
  rating: number | null;
}

const ProductsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterValues>({
    category: 'all',
    priceRange: [0, 500],
    rating: null
  });
  
  const controls = useAnimation();
  const { toast } = useToast();

  // Calculate price range based on products
  const priceRange = useMemo(() => {
    if (products.length === 0) {
      // Default values when no products are loaded
      return [0, 500] as [number, number];
    }
    
    const prices = products.map(product => product.price || 0);
    
    // Add small buffer to min/max for better UX
    const min = Math.max(0, Math.floor(Math.min(...prices) * 0.9));
    const max = Math.ceil(Math.max(...prices) * 1.1);
    
    return [min, max] as [number, number];
  }, [products]);

  // Load products with retry mechanism
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setLoadingError(null);
    
    try {
      // Get products from service
      const allProducts = await ProductsAPI.getAllProducts();
      console.log("Fetched products from database:", allProducts);
      
      if (!allProducts || allProducts.length === 0) {
        throw new Error("لم يتم العثور على منتجات");
      }
      
      // Set products and initialize filters with proper price range
      setProducts(allProducts);
      
      // Initialize filters with the actual price range from products
      setFilters(prev => ({
        ...prev,
        priceRange: [priceRange[0], priceRange[1]]
      }));
      
      controls.start('visible');
      
      toast({
        title: "تم تحميل المنتجات",
        description: `تم تحميل ${allProducts.length} منتج بنجاح`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to load products:', error);
      setLoadingError(error instanceof Error ? error.message : "حدث خطأ غير معروف");
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من تحميل المنتجات، يرجى المحاولة مرة أخرى",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [priceRange, toast, controls]);

  // Load products on component mount
  useEffect(() => {
    console.log("ProductsPage mounted, loading products...");
    loadProducts();
    
    // Animation timing
    const timer = setTimeout(() => {
      controls.start('visible');
    }, 1000);
    
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter products based on user selections
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) {
      return [];
    }
    
    return products.filter(product => {
      // Search term filter - check name and description
      const matchesSearch = 
        searchTerm === '' || 
        (product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Category filter  
      let matchesCategory = filters.category === 'all';
      
      if (!matchesCategory && product.category) {
        // Check for real category match from database
        matchesCategory = product.category === filters.category;
      } else if (!matchesCategory) {
        // Fallback to text-based category matching
        matchesCategory = 
          (filters.category === 'cleaner' && (
            product.name?.includes('منظف') || 
            product.description?.includes('منظف')
          )) ||
          (filters.category === 'polish' && (
            product.name?.includes('ملمع') || 
            product.name?.includes('تلميع') || 
            product.description?.includes('ملمع') || 
            product.description?.includes('تلميع')
          )) ||
          (filters.category === 'protection' && (
            product.name?.includes('حماية') || 
            product.name?.includes('واقي') || 
            product.description?.includes('حماية') || 
            product.description?.includes('واقي')
          )) ||
          (filters.category === 'tire' && (
            product.name?.includes('إطار') || 
            product.description?.includes('إطار')
          ));
      }
      
      // Price range filter  
      const productPrice = product.price || 0;
      const matchesPrice = 
        productPrice >= filters.priceRange[0] && 
        productPrice <= filters.priceRange[1];
      
      // Rating filter - Temporarily using hardcoded rating since DB doesn't have ratings
      const productRating = 4.5; // We need to add this to DB
      const matchesRating = 
        filters.rating === null || 
        productRating >= filters.rating;
      
      // Product must match all active filters
      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    });
  }, [products, searchTerm, filters]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({
      category: 'all',
      priceRange: [priceRange[0], priceRange[1]],
      rating: null
    });
    setSearchTerm('');
    
    toast({
      title: "تم إعادة ضبط التصفية",
      description: "تم عرض جميع المنتجات",
      duration: 2000,
    });
  }, [priceRange, toast]);

  // Loading skeletons
  if (isLoading) {
    return (
      <div className="pb-20">
        <section className="bg-gradient-to-r from-delight-800 to-blue-900 py-20 text-white">
          <div className="container-custom">
            <div className="max-w-xl mx-auto">
              <Skeleton className="h-12 w-3/4 mb-4 bg-white/20" />
              <Skeleton className="h-4 w-full bg-white/10" />
            </div>
          </div>
        </section>
        
        <section className="py-8 bg-delight-50/50 backdrop-blur-sm sticky top-0 z-30 border-b border-delight-100">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <Skeleton className="h-10 w-full md:w-1/3" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <ProductBanner />

      <ProductFilters 
        categories={categories}
        filters={filters}
        priceRange={priceRange}
        setFilters={setFilters}
        resetFilters={resetFilters}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onRefresh={loadProducts}
      />

      <section className="py-16">
        <div className="container-custom">
          <ProductGrid 
            products={products}
            filteredProducts={filteredProducts}
            isLoading={isLoading}
            loadingError={loadingError}
            onRefresh={loadProducts}
            controls={controls}
          />
        </div>
      </section>

      <ProductCta />
    </div>
  );
};

export default ProductsPage;
