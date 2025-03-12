
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  description,
  image,
  className,
}) => {
  return (
    <div 
      className={cn(
        'group overflow-hidden rounded-xl bg-white border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md',
        className
      )}
    >
      <div className="aspect-[4/3] w-full overflow-hidden">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-slate-800">
          {name}
        </h3>
        <p className="text-slate-600 mb-4 line-clamp-2">
          {description}
        </p>
        <div className="flex justify-end">
          <Link to={`/products/${id}`}>
            <Button className="btn-primary group">
              <ShoppingCart className="w-4 h-4 mr-2 group-hover:animate-pulse" />
              <span>عرض المنتج</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
