import { Gem, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import React from 'react';
import { cn } from '@/lib/utils';

interface CavePromoCardProps {
  productName: string;
  originalPrice?: number; // السعر الأصلي للمنتج
  cavePrice?: number; // سعر المغارة
  requiredPoints?: number;
  maxQuantity?: number;
  className?: string;
}

/**
 * بطاقة ترويج عروض المغارة المميزة.
 * قابلة لإعادة الاستخدام وتمتاز بتصميم جاذب مع خصائص تفاعل سلسة.
 */
const CavePromoCard: React.FC<CavePromoCardProps> = ({
  productName,
  originalPrice,
  cavePrice,
  requiredPoints,
  maxQuantity,
  className,
}) => {
  // حساب نسبة التوفير والمبلغ المدخر
  const discountPercent = originalPrice && cavePrice && originalPrice > cavePrice
    ? Math.round(((originalPrice - cavePrice) / originalPrice) * 100)
    : null;
  const savings = originalPrice && cavePrice && originalPrice > cavePrice
    ? (originalPrice - cavePrice)
    : null;

  return (
    <Link
      to="/cave"
      className={cn(
        'group relative block rounded-lg p-4 border border-green-300 dark:border-green-600 bg-gradient-to-br from-emerald-50 via-lime-50 to-white dark:from-green-900/50 dark:via-lime-900/40 dark:to-green-900/20 text-green-900 dark:text-green-200 shadow-sm hover:shadow-xl transition-transform hover:-translate-y-1 focus:ring-2 focus:ring-green-500',
        className,
      )}
    >
      {/* خلفية متحركة خفيفة */}
      <span className="pointer-events-none absolute -inset-1 rounded-lg bg-gradient-to-br from-green-300/40 via-lime-300/40 to-transparent opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-60" />

      {/* المحتوى */}
      <div className="relative z-10 space-y-2 rtl:text-right ltr:text-left text-[0.85rem] sm:text-sm">
        <div className="flex items-center gap-2">
          <Gem className="w-5 h-5 text-green-600 dark:text-green-300" />
          <h3 className="font-bold leading-snug text-base sm:text-lg md:text-xl">🎯 عرض جامد على {productName}!</h3>
          {discountPercent && (
            <p className="font-semibold text-green-800 dark:text-green-300">وفر {discountPercent}% دلوقتي 💥</p>
          )}
        </div>
        <div className="space-y-0.5">
            {cavePrice != null && (
              <p>💸 السعر في المغارة: <span className="font-semibold">{cavePrice} ج.م</span></p>
            )}
            {originalPrice != null && (
              <p>💰 بدل <span className="line-through">{originalPrice} ج.م</span></p>
            )}
            {savings != null && (
              <p>🟣 وفر {savings} ج.م</p>
            )}
            <p>🎁 نقاط هدية على كل عملية</p>
            {maxQuantity != null && (
              <p>⚠️ الكمية محدودة: {maxQuantity} بس</p>
            )}
            <p>🏷️ عرض حصري من المغارة</p>
          </div>
        <div className="text-sm space-y-1">
            {cavePrice != null && (
              <div>
               السعر داخل المغارة: <span className="font-semibold"> {cavePrice}</span> ج.م
             </div>
           )}
           {originalPrice != null && cavePrice != null && originalPrice > cavePrice && (
             <div>
               السعر الأصلي: <span className="line-through">{originalPrice}</span> ج.م
             </div>
           )}
          {requiredPoints != null && (
            <div>
              نقاط مطلوبة:
              <span className="font-semibold"> {requiredPoints}</span>
            </div>
          )}
          {maxQuantity != null && (
            <div>
              أقصى كمية متاحة:
              <span className="font-semibold"> {maxQuantity}</span>
            </div>
          )}
        </div>
        <button
            type="button"
            className="mt-3 inline-flex items-center gap-1 rounded-md bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            🔘 استغل العرض دلوقتي
            <ArrowUpRight className="w-4 h-4" />
          </button>
      </div>
    </Link>
  );
};

export default CavePromoCard;
