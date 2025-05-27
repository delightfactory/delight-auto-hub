import React, { useRef, useState, useEffect } from 'react';
import { useVirtualList } from '../../utils/listOptimizer';
import OptimizedImage from '../common/OptimizedImage';
import LoadingIndicator from '../common/LoadingIndicator';

// واجهة المنتج
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  rating?: number;
  discount?: number;
  category?: string;
  isNew?: boolean;
  isFeatured?: boolean;
}

interface VirtualizedProductGridProps {
  /** قائمة المنتجات */
  products: Product[];
  /** عدد الأعمدة في الشبكة */
  columns?: number;
  /** ارتفاع بطاقة المنتج */
  itemHeight?: number;
  /** دالة تنفذ عند النقر على منتج */
  onProductClick?: (product: Product) => void;
  /** حالة التحميل */
  isLoading?: boolean;
  /** رسالة الخطأ */
  error?: string;
}

/**
 * مكون لعرض شبكة افتراضية من المنتجات
 * يحسن الأداء عند عرض قوائم كبيرة من المنتجات
 */
const VirtualizedProductGrid: React.FC<VirtualizedProductGridProps> = ({
  products,
  columns = 3,
  itemHeight = 350,
  onProductClick,
  isLoading = false,
  error,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // حساب عرض العنصر بناءً على عدد الأعمدة
  const calculateItemWidth = () => {
    if (!containerWidth) return '100%';
    const gap = 16; // الفجوة بين العناصر
    return `${(containerWidth - (columns - 1) * gap) / columns}px`;
  };

  // تحديث عرض الحاوية عند تغير حجم النافذة
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);

    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // استخدام القائمة الافتراضية
  const { visibleItems, totalHeight, virtualItemProps } = useVirtualList(
    products,
    containerRef,
    { itemHeight }
  );

  // عرض مؤشر التحميل
  if (isLoading) {
    return <LoadingIndicator type="skeleton" />;
  }

  // عرض رسالة الخطأ
  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
      </div>
    );
  }

  // عرض رسالة إذا لم تكن هناك منتجات
  if (!products || products.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        <p>لا توجد منتجات متاحة</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto"
      style={{ height: '100%', minHeight: '500px' }}
    >
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        <div
          style={{
            ...virtualItemProps.style,
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: '1rem',
          }}
        >
          {visibleItems.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onProductClick?.(product)}
              width={calculateItemWidth()}
              height={`${itemHeight}px`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// مكون بطاقة المنتج
interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  width: string;
  height: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
  width,
  height,
}) => {
  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      style={{ width, height }}
      onClick={onClick}
    >
      <div className="relative h-48">
        <OptimizedImage
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          blur={true}
          placeholderColor="#f3f4f6"
        />
        {product.discount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
            خصم {product.discount}%
          </div>
        )}
        {product.isNew && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold">
            جديد
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{product.name}</h3>
        <div className="flex justify-between items-center">
          <span className="text-blue-600 font-bold">{product.price} ريال</span>
          {product.rating && (
            <div className="flex items-center">
              <span className="text-yellow-500 mr-1">★</span>
              <span className="text-sm">{product.rating}</span>
            </div>
          )}
        </div>
        {product.category && (
          <div className="mt-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {product.category}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualizedProductGrid;
