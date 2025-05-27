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

  return (
    <div
      ref={cardRef}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${id}`} className="block relative">
        <div className="relative aspect-square overflow-hidden">
          <div className="w-full h-full transition-transform duration-500" style={{
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          }}>
            <ProgressiveImage
              src={image}
              alt={title}
              className="w-full h-full object-cover"
              placeholderColor="#f3f4f6"
              blur={true}
            />
          </div>
          
          {/* علامات المنتج (جديد، الأكثر مبيعًا، خصم) */}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            {isNew && (
              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                جديد
              </span>
            )}
            
            {isBestSeller && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
                الأكثر مبيعًا
              </span>
            )}
            
            {discountPercentage > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                {discountPercentage}% خصم
              </span>
            )}
          </div>
        </div>
        
        <div className="p-4">
          {category && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
              {category}
            </span>
          )}
          
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
            {title}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                {price.toLocaleString('ar-EG')} ج.م
              </span>
              
              {originalPrice && originalPrice > price && (
                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  {originalPrice.toLocaleString('ar-EG')} ج.م
                </span>
              )}
            </div>
            
            {rating > 0 && (
              <div className="flex items-center">
                <span className="text-amber-500">★</span>
                <span className="text-sm text-gray-600 dark:text-gray-300 mr-1">
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
