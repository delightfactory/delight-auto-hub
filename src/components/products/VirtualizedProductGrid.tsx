import React, { useRef, useState, useEffect } from 'react';
import { useVirtualList } from '../../utils/listOptimizer';
import OptimizedImage from '../common/OptimizedImage';
import LoadingIndicator from '../common/LoadingIndicator';
import ProductCard, { ProductCardProps } from '@/components/ProductCard'; // استيراد المكون الرئيسي وواجهته

// واجهة المنتج
// واجهة المنتج المستخدمة داخليًا في VirtualizedProductGrid
// هذه الواجهة تصف البيانات كما هي مستلمة أو مستخدمة قبل تحويلها لـ ProductCardProps
export interface Product {
  id: string;
  name: string;
  description?: string; // الوصف التفصيلي
  descriptionTitle?: string; // عنوان الوصف
  price: number; // السعر كرقم
  originalPrice?: number; // السعر الأصلي كرقم (اختياري)
  image: string;
  rating?: number;
  discount?: number; // الخصم يمكن أن يبقى هنا إذا كان يستخدم في حسابات ما قبل العرض
  category?: string;
  isNew?: boolean;
  isFeatured?: boolean;
  stock?: number;
  // أضف أي حقول أخرى خاصة بـ VirtualizedProductGrid هنا إذا لزم الأمر
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

  // إذا القيمة صفر ولم يبدأ التحميل، أو لم يتم حساب عرض الحاوية بعد
  if (!containerWidth && !isLoading) {
    return (
      <div
        ref={containerRef} // مهم جداً لوضع الـ ref هنا أيضاً ليتمكن useEffect من حساب العرض الأولي
        className="relative overflow-auto h-full min-h-[500px]" // نفس الفئات المستخدمة في الحاوية الرئيسية
      >
        <div className="flex items-center justify-center h-full">
          <span className="text-gray-500">جارٍ التحميل...</span>
        </div>
      </div>
    );
  }

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
      className="relative overflow-auto h-full min-h-[500px]"
    >
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        <div
          style={{
            ...virtualItemProps.style,
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: '0.5rem',
            padding: '0 0.25rem'
          }}
        >
          {visibleItems.map((productItem) => {
            // تحويل وتكييف كائن المنتج ليتوافق مع ProductCardProps
            const productCardData: ProductCardProps = {
              id: productItem.id,
              name: productItem.name,
              descriptionTitle: productItem.descriptionTitle,
              // لعرض عنوان الوصف القصير فقط داخل البطاقة
              description: productItem.descriptionTitle ?? '', // إذا لم يتوفر العنوان نُرسل نصاً فارغاً
              image: productItem.image,
              category: productItem.category,
              rating: productItem.rating,
              price: productItem.price ? `${productItem.price} ريال` : undefined, // تحويل السعر إلى نص وإضافة العملة
              originalPrice: productItem.originalPrice ? `${productItem.originalPrice} ريال` : undefined,
              isFeatured: productItem.isFeatured,
              isNew: productItem.isNew,
              stock: productItem.stock,
              // stockStatusText: productItem.stockStatusText, // إذا كان متوفرًا في productItem
              // quickFeatures: productItem.quickFeatures, // إذا كان متوفرًا في productItem
              // className: `w-[${calculateItemWidth()}] h-[${itemHeight}px]` // يمكن إضافة هذا إذا أردنا تحكمًا دقيقًا بالحجم من هنا
            };

            return (
              <ProductCard
                key={productCardData.id}
                {...productCardData}
                // ProductCard الرئيسي يتعامل مع التنقل عند النقر.
                // إذا كان onProductClick له وظيفة أخرى، يجب التعامل معها بشكل مختلف.
                // onClick={onProductClick ? () => onProductClick(productItem) : undefined}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};


export default VirtualizedProductGrid;
