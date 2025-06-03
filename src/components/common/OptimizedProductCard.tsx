import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { LazyImage } from '@/utils/performance';
import { generateSrcSet, generateSizes } from '@/utils/imageOptimizer';
import { ProgressiveImage } from '@/components/performance/ProgressiveImage';

interface ProductCardProps {
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

/**
 * مكون بطاقة المنتج المحسن
 * يستخدم تقنيات تحسين الأداء مثل:
 * - التحميل الكسول للصور
 * - تنسيق WebP للصور
 * - أحجام مختلفة للصور
 * - React.memo لمنع إعادة التصيير غير الضرورية
 */
const OptimizedProductCard: React.FC<ProductCardProps> = React.memo(({
  id,
  title,
  price,
  originalPrice,
  image,
  category,
  rating = 0,
  discount,
  isNew = false,
  isBestSeller = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // حساب نسبة الخصم
  const discountPercentage = discount || (originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);
  
  // توليد مجموعة الصور بأحجام مختلفة
  const srcSet = generateSrcSet(image);
  const sizes = generateSizes();

  // تعريف الفئات الثابتة لتجنب مشاكل حذف CSS في وضع الإنتاج
  const cardContainerClasses = "bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg";
  const linkClasses = "block relative";
  const imageContainerClasses = "relative aspect-square overflow-hidden";
  const imageWrapperClasses = "w-full h-full transition-transform duration-500";
  const imageClasses = "w-full h-full object-cover";
  const badgesContainerClasses = "absolute top-2 right-2 flex flex-col gap-2";
  const newBadgeClasses = "bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded";
  const bestSellerBadgeClasses = "bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded";
  const discountBadgeClasses = "bg-red-500 text-white text-xs font-bold px-2 py-1 rounded";
  const contentClasses = "p-4";
  const categoryClasses = "text-xs text-gray-500 dark:text-gray-400 mb-1 block";
  const titleClasses = "text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2";
  const priceContainerClasses = "flex items-center justify-between";
  const priceWrapperClasses = "flex items-center gap-2";
  const currentPriceClasses = "font-bold text-lg text-blue-600 dark:text-blue-400";
  const originalPriceClasses = "text-sm text-gray-500 dark:text-gray-400 line-through";
  const ratingContainerClasses = "flex items-center";
  const ratingStarClasses = "text-amber-500";
  const ratingValueClasses = "text-sm text-gray-600 dark:text-gray-300 mr-1";

  return (
    <div
      ref={cardRef}
      className={cardContainerClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${id}`} className={linkClasses}>
        <div className={imageContainerClasses}>
          <div className={imageWrapperClasses} style={{
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          }}>
            <ProgressiveImage
              src={image}
              alt={title}
              className={imageClasses}
              placeholderColor="#f3f4f6"
              blur={true}
            />
          </div>
          
          {/* علامات المنتج (جديد، الأكثر مبيعًا، خصم) */}
          <div className={badgesContainerClasses}>
            {isNew && (
              <div className={newBadgeClasses}>
                جديد
              </div>
            )}
            
            {isBestSeller && (
              <div className={bestSellerBadgeClasses}>
                الأكثر مبيعًا
              </div>
            )}
            
            {discountPercentage > 0 && (
              <div className={discountBadgeClasses}>
                {discountPercentage}% خصم
              </div>
            )}
          </div>
        </div>
        
        <div className={contentClasses}>
          {category && (
            <div className={categoryClasses}>
              {category}
            </div>
          )}
          
          <h3 className={titleClasses}>
            {title}
          </h3>
          
          <div className={priceContainerClasses}>
            <div className={priceWrapperClasses}>
              <span className={currentPriceClasses}>
                {price.toLocaleString('ar-EG')} ج.م
              </span>
              
              {originalPrice && originalPrice > price && (
                <span className={originalPriceClasses}>
                  {originalPrice.toLocaleString('ar-EG')} ج.م
                </span>
              )}
            </div>
            
            {rating > 0 && (
              <div className={ratingContainerClasses}>
                <span className={ratingStarClasses}>★</span>
                <span className={ratingValueClasses}>
                  {rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
});

export default OptimizedProductCard;
