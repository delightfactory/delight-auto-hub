
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye, Star, Heart } from 'lucide-react';
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
  const [isLiked, setIsLiked] = React.useState(false);

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

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
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
        <motion.button
          onClick={toggleLike}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-3 right-3 z-10 bg-white/70 backdrop-blur-sm p-2 rounded-full shadow-sm"
        >
          <Heart 
            className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} 
          />
        </motion.button>
        
        <motion.img
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-all"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute bottom-4 right-4 left-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <Button variant="secondary" className="bg-white/90 backdrop-blur-sm hover:bg-white" onClick={(e) => e.preventDefault()}>
            <Eye className="w-4 h-4 ml-2" />
            عرض المنتج
          </Button>
        </motion.div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} 
              />
            ))}
          </div>
          <span className="text-xs font-medium bg-delight-50 text-delight-700 px-2 py-1 rounded-full">{rating}</span>
        </div>
        
        <h3 className="text-xl font-bold mb-2 text-gray-800 line-clamp-1">
          {name}
        </h3>
        <p className="text-gray-600 mb-4 text-sm line-clamp-2">
          {description}
        </p>
        
        {price && (
          <div className="text-delight-700 font-bold mb-4 text-lg">{price}</div>
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
            <Button className="bg-gradient-to-r from-delight-600 to-delight-700 hover:from-delight-700 hover:to-delight-800 text-white group" onClick={handleAddToCart}>
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
