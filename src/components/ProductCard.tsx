
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye, Star, Heart, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const { addItem, items } = useCart();
  const [isLiked, setIsLiked] = React.useState(false);
  const [isAddedToCart, setIsAddedToCart] = React.useState(false);
  
  // Check if item is already in cart
  React.useEffect(() => {
    const isInCart = items.some(item => item.id === id);
    setIsAddedToCart(isInCart);
  }, [items, id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id,
      name,
      price: price || '0 ريال',
      image,
    });
    
    setIsAddedToCart(true);
    
    toast({
      title: "تمت الإضافة إلى السلة",
      description: `تمت إضافة ${name} إلى سلة التسوق بنجاح.`,
      duration: 3000,
    });
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    
    if (!isLiked) {
      toast({
        title: "تمت الإضافة للمفضلة",
        description: `تم إضافة ${name} إلى المفضلة.`,
        duration: 3000,
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      className={cn(
        'group overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300',
        className
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50 border-b border-gray-100">
        <motion.button
          onClick={toggleLike}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm"
        >
          <Heart 
            className={`w-4 h-4 ${isLiked ? 'fill-amazon-warning text-amazon-warning' : 'text-gray-500'}`} 
          />
        </motion.button>
        
        <motion.img
          whileHover={{ scale: 1.15, rotate: -2 }}
          transition={{ duration: 0.6 }}
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-all"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://placehold.co/600x400/e2e8f0/1e293b?text=Delight+Car+Products';
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <motion.div 
          className="absolute bottom-4 right-4 left-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 gap-2"
        >
          <Link to={`/products/${id}`} className="flex-1">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full"
            >
              <Button variant="secondary" className="w-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-md">
                <Eye className="w-4 h-4 ml-2" />
                عرض المنتج
              </Button>
            </motion.div>
          </Link>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            className="flex-1"
          >
            <Button className="w-full bg-amazon-yellow hover:bg-amber-400 text-amazon-dark shadow-md group">
              {isAddedToCart ? (
                <>
                  <Check className="w-4 h-4 ml-2" />
                  في السلة
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 ml-2 group-hover:animate-pulse" />
                  إضافة للسلة
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-amazon-orange text-amazon-orange' : 'fill-gray-200 text-gray-200'}`} 
              />
            ))}
            <span className="text-xs font-medium text-gray-500 mr-1">({rating})</span>
          </div>
          
          <AnimatePresence>
            {isAddedToCart && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center"
              >
                <Check className="h-3 w-3 mr-1" /> في السلة
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <h3 className="text-xl font-bold mb-2 text-amazon-dark line-clamp-1 group-hover:text-amazon-link transition-colors">
          {name}
        </h3>
        
        <p className="text-gray-600 mb-4 text-sm line-clamp-2">
          {description}
        </p>
        
        {price && (
          <div className="amazon-price mb-4 text-lg">{price}</div>
        )}
        
        <div className="flex justify-between">
          <Link to={`/products/${id}`}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className="border-gray-200 text-amazon-link hover:bg-gray-50 hover:text-amazon-link hover:border-gray-300">
                <Eye className="w-4 h-4 ml-2" />
                <span>التفاصيل</span>
              </Button>
            </motion.div>
          </Link>
          
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            animate={isAddedToCart ? { y: [0, -5, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <Button 
              className={cn(
                "transition-all duration-300",
                isAddedToCart
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "amazon-btn-primary"
              )}
              onClick={handleAddToCart}
            >
              {isAddedToCart ? (
                <>
                  <Check className="w-4 h-4 ml-2" />
                  <span>تمت الإضافة</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 ml-2 group-hover:animate-pulse" />
                  <span>إضافة للسلة</span>
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
      
      {/* Glowing effect on hover */}
      <motion.div
        className="absolute -z-10 inset-0 bg-gradient-to-r from-amber-200/20 to-delight-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      />
    </motion.div>
  );
};

export default ProductCard;
