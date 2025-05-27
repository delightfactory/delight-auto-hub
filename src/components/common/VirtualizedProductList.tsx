import React, { useRef, useState, useEffect } from 'react';
import OptimizedProductCard from './OptimizedProductCard';

interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string;
  rating?: number;
  discount?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
}

interface VirtualizedProductListProps {
  products: Product[];
  itemHeight?: number;
  className?: string;
  gridClassName?: string;
  loading?: boolean;
  loadingItemCount?: number;
}

/**
 * مكون قائمة منتجات افتراضية لتحسين الأداء مع الكميات الكبيرة من المنتجات
 */
const VirtualizedProductList: React.FC<VirtualizedProductListProps> = ({
  products,
  itemHeight = 350,
  className = '',
  gridClassName = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
  loading = false,
  loadingItemCount = 8,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<Product[]>([]);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // حساب عدد العناصر المرئية
  const calculateVisibleItems = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // تحديث ارتفاع الحاوية
    setContainerHeight(containerRect.height);
    
    // تحديث موضع التمرير
    setScrollTop(container.scrollTop);
    
    // حساب عدد العناصر المرئية
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      products.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + 5 // إضافة 5 عناصر إضافية للتحميل المسبق
    );
    
    // تحديث العناصر المرئية
    setVisibleItems(products.slice(Math.max(0, visibleStart - 5), visibleEnd));
  };

  // معالجة حدث التمرير
  const handleScroll = () => {
    requestAnimationFrame(calculateVisibleItems);
  };

  // حساب العناصر المرئية عند تغيير المنتجات أو ارتفاع العنصر
  useEffect(() => {
    calculateVisibleItems();
    
    // إضافة مستمع حدث التمرير
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    
    // تنظيف مستمع الحدث عند إزالة المكون
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [products, itemHeight]);

  // إعادة حساب العناصر المرئية عند تغيير حجم النافذة
  useEffect(() => {
    const handleResize = () => {
      calculateVisibleItems();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // عرض مؤشر التحميل
  if (loading) {
    return (
      <div className={`${className} ${gridClassName}`}>
        {Array.from({ length: loadingItemCount }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden animate-pulse"
            style={{ height: `${itemHeight}px` }}
          >
            <div className="w-full aspect-square bg-gray-300 dark:bg-gray-600" />
            <div className="p-4">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4" />
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${className} overflow-auto`}
      style={{ height: '100%' }}
    >
      <div className={gridClassName}>
        {visibleItems.map((product) => (
          <OptimizedProductCard
            key={product.id}
            id={product.id}
            title={product.title}
            price={product.price}
            originalPrice={product.originalPrice}
            image={product.image}
            category={product.category}
            rating={product.rating}
            discount={product.discount}
            isNew={product.isNew}
            isBestSeller={product.isBestSeller}
          />
        ))}
      </div>
    </div>
  );
};

export default VirtualizedProductList;
