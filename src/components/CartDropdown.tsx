
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartItem, useCart } from '@/context/CartContext';
import { toast } from '@/components/ui/use-toast';

const CartDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { items, total, itemCount, removeItem, updateQuantity, clearCart } = useCart();

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  const handleCheckout = () => {
    toast({
      title: "تم إكمال الطلب بنجاح",
      description: "سيتم التواصل معك قريباً للتأكيد.",
    });
    clearCart();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Cart Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleCart}
        className="relative"
      >
        <ShoppingCart className="h-6 w-6" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-delight-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </Button>

      {/* Cart Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleCart}
            />

            {/* Cart Panel */}
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl z-50 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between bg-delight-50">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-delight-600" />
                  سلة المشتريات
                </h2>
                <Button variant="ghost" size="icon" onClick={toggleCart}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Cart Items */}
              <div className="flex-grow overflow-auto p-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <ShoppingCart className="h-12 w-12 mb-4 text-gray-300" />
                    <p>السلة فارغة</p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {items.map((item) => (
                      <CartItemCard 
                        key={item.id} 
                        item={item} 
                        removeItem={removeItem}
                        updateQuantity={updateQuantity}
                      />
                    ))}
                  </ul>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">المجموع:</span>
                  <span className="text-lg font-bold text-delight-700">{total}</span>
                </div>
                <Button 
                  onClick={handleCheckout}
                  className="w-full"
                  disabled={items.length === 0}
                >
                  إتمام الطلب
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

interface CartItemCardProps {
  item: CartItem;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({ item, removeItem, updateQuantity }) => {
  const handleIncrement = () => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    } else {
      removeItem(item.id);
    }
  };

  return (
    <motion.li 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex gap-3 p-3 bg-white rounded-lg border"
    >
      {/* Product Image */}
      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Product Info */}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800 line-clamp-1">{item.name}</h3>
        <p className="text-delight-600 font-medium">{item.price}</p>
        
        {/* Quantity Controls */}
        <div className="flex items-center mt-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-7 w-7 rounded-full" 
            onClick={handleDecrement}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="mx-2 w-8 text-center">{item.quantity}</span>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-7 w-7 rounded-full" 
            onClick={handleIncrement}
          >
            <Plus className="h-3 w-3" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-red-500 mr-auto" 
            onClick={() => removeItem(item.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.li>
  );
};

export default CartDropdown;
