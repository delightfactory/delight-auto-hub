
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { toast } from '@/components/ui/use-toast';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  className?: string;
  rating?: number;
  price?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  description,
  image,
  className,
  rating = 4.5,
  price = '',
}) => {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id,
      name,
      price: price || '0 ريال',
      image,
    });
    
    toast({
      title: "تمت الإضافة إلى السلة",
      description: `تمت إضافة ${name} إلى سلة التسوق بنجاح.`,
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
      className={cn(
        'group overflow-hidden rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300',
        className
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
        <motion.img
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-all"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <Link to={`/products/${id}`}>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute bottom-4 right-4 left-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <Button variant="secondary" className="bg-white/90 backdrop-blur-sm hover:bg-white">
              <Eye className="w-4 h-4 ml-2" />
              عرض المنتج
            </Button>
          </motion.div>
        </Link>
      </div>
      <div className="p-6">
        <div className="flex items-center mb-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} 
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 mr-1">{rating}</span>
        </div>
        
        <h3 className="text-xl font-bold mb-2 text-gray-800">
          {name}
        </h3>
        <p className="text-gray-600 mb-4 text-sm line-clamp-2">
          {description}
        </p>
        
        {price && (
          <div className="text-delight-700 font-bold mb-4">{price}</div>
        )}
        
        <div className="flex justify-between">
          <Link to={`/products/${id}`}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className="border-delight-200 text-delight-700">
                <Eye className="w-4 h-4 ml-2" />
                <span>التفاصيل</span>
              </Button>
            </motion.div>
          </Link>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="bg-delight-600 hover:bg-delight-700 text-white group" onClick={handleAddToCart}>
              <ShoppingCart className="w-4 h-4 ml-2 group-hover:animate-pulse" />
              <span>إضافة للسلة</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
