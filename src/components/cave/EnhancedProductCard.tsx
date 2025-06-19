import React from 'react';
import { motion } from 'framer-motion';
import { caveAnimations } from './caveAnimations';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, ShieldCheck, Package, Star } from 'lucide-react';
import type { ProductCardProps } from '@/components/ProductCard';

interface EnhancedProductCardProps {
  product: ProductCardProps;
  onAddToCart: () => void;
  isInCart: boolean;
  cartQuantity: number;
}

const EnhancedProductCard: React.FC<EnhancedProductCardProps> = ({
  product,
  onAddToCart
}) => {
  const discount = product.originalPrice
    ? Math.round(
        100 -
          (product.cave_price /
            parseFloat(String(product.originalPrice).replace(/[^0-9.]/g, ''))) *
            100
      )
    : 0;

  const getStockStatus = (qty: number) => {
    if (qty <= 0)
      return {
        text: 'غير متوفر',
        color: 'text-red-400',
        bg: 'bg-red-900/30',
        border: 'border-red-500/30'
      };
    if (qty < 10)
      return {
        text: 'كمية محدودة',
        color: 'text-yellow-400',
        bg: 'bg-yellow-900/30',
        border: 'border-yellow-500/30'
      };
    if (qty < 50)
      return {
        text: 'مخزون منخفض',
        color: 'text-blue-400',
        bg: 'bg-blue-900/30',
        border: 'border-blue-500/30'
      };
    return {
      text: 'متوفر',
      color: 'text-green-400',
      bg: 'bg-green-900/30',
      border: 'border-green-500/30'
    };
  };

  const stockStatus = getStockStatus(product.cave_max_quantity ?? 0);

  return (
    <motion.div
      className="cave-enhanced-card group w-full flex flex-row overflow-hidden transition-all duration-300"
      whileHover={caveAnimations.hover}
    >
      <div className="cave-enhanced-card-inner flex flex-col flex-grow w-2/3">
        <div className="flex-grow">
          <h3 className="cave-enhanced-title font-bold line-clamp-1">{product.name}</h3>
          <p className="text-xs text-gray-800 mt-0.5 mb-1 line-clamp-2 h-7">
            {product.description}
          </p>
        </div>

        <div className="mt-auto">
          <div className="flex justify-end items-center my-0.25">
            <Badge
              variant="outline"
              className={`flex items-center ${stockStatus.color} ${stockStatus.bg} ${stockStatus.border} px-1 py-0.25 text-xs`}
            >
              <Package className="w-1.5 h-1.5 ml-0.5" />
              {stockStatus.text}
            </Badge>
          </div>

          <Separator className="bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent my-0.25" />

          <div className="flex-shrink-0 flex items-end justify-between">
            <div className="flex flex-col items-start">
              <span className="text-xs text-yellow-950 font-medium">السعر</span>
              <div className="cave-enhanced-price text-lg font-black flex items-center">
                <div className="cave-enhanced-icon cave-enhanced-icon-coin ml-1" />
                {product.cave_price}
              </div>
              {discount > 0 && (
                <>
                  <div className="text-xs text-gray-700 line-through font-semibold">
                    {product.originalPrice} ج.م
                  </div>
                  <div className="flex flex-wrap gap-0.25 mt-0.25">
                    {product.cave_required_points !== undefined && (
                      <Badge
                        variant="outline"
                        className="flex items-center px-1 py-0.25 text-xs text-blue-700 bg-blue-100 border border-blue-300"
                      >
                        <div className="cave-enhanced-icon cave-enhanced-icon-gem w-2 h-2 ml-0.5" />
                        {product.cave_required_points} نقطة
                      </Badge>
                    )}
                    {product.cave_max_quantity !== undefined && (
                      <Badge
                        variant="outline"
                        className="flex items-center px-1 py-0.25 text-xs text-green-700 bg-green-100 border border-green-300"
                      >
                        <ShieldCheck className="w-2 h-2 ml-0.5 text-green-700" />
                        حد:{product.cave_max_quantity}
                      </Badge>
                    )}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={onAddToCart}
              disabled={product.cave_max_quantity !== undefined && product.cave_max_quantity <= 0}
              className="cave-enhanced-buy-button"
            >
              <ShoppingCart className="w-2.5 h-2.5" />
              إضافة
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-1/3 flex-shrink-0">
        <div className="w-full h-full flex flex-col items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            className="cave-enhanced-product-image"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://placehold.co/400/1a1a1a/333?text=خطأ';
            }}
          />
        </div>

        {discount > 0 && (
          <div className="cave-enhanced-discount-badge">خصم {discount}%</div>
        )}

        <div className="absolute bottom-1 right-1 z-10 flex items-center gap-0.25 bg-gray-900/80 backdrop-blur-sm px-0.5 py-0.25 rounded-full border border-yellow-500/50">
          <Star className="w-3 h-3 text-yellow-400" />
          <span className="font-bold text-xs text-white">{product.rating}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedProductCard;
