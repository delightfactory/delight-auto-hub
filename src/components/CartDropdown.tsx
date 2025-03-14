
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Plus, Minus, Check, ShoppingBag, ShoppingBasket, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartItem, useCart } from '@/context/CartContext';
import { toast } from '@/components/ui/use-toast';
import Checkout from './Checkout';

const CartDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const { items, total, itemCount, removeItem, updateQuantity, clearCart } = useCart();

  const toggleCart = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowCheckout(false);
    }
  };

  const handleStartCheckout = () => {
    setShowCheckout(true);
  };

  const handleCloseCheckout = () => {
    setShowCheckout(false);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Cart Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleCart}
        className="relative hover:bg-delight-100 transition-colors"
        data-cart-toggle
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ShoppingCart className="h-6 w-6 text-delight-700" />
          {itemCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-delight-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            >
              {itemCount}
            </motion.span>
          )}
        </motion.div>
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={toggleCart}
            />

            {/* Cart Panel */}
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              {showCheckout ? (
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-delight-50 to-delight-100">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-delight-800">
                      <ArrowRight className="h-5 w-5 text-delight-600 cursor-pointer" onClick={() => setShowCheckout(false)} />
                      إتمام الطلب
                    </h2>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={toggleCart}
                      className="hover:bg-white/50 rounded-full"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex-grow overflow-auto">
                    <Checkout onClose={handleCloseCheckout} />
                  </div>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-delight-50 to-delight-100">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-delight-800">
                      <ShoppingBag className="h-5 w-5 text-delight-600" />
                      سلة المشتريات
                    </h2>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={toggleCart}
                      className="hover:bg-white/50 rounded-full"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Cart Items */}
                  <div className="flex-grow overflow-auto p-4 bg-gray-50/50">
                    <AnimatePresence>
                      {items.length === 0 ? (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="h-full flex flex-col items-center justify-center text-gray-500 py-16"
                        >
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: [0.8, 1, 0.8] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            <ShoppingBasket className="h-16 w-16 mb-4 text-gray-300" />
                          </motion.div>
                          <p className="font-medium">السلة فارغة</p>
                          <p className="text-sm text-gray-400 mt-2">أضف منتجات من صفحة المنتجات</p>
                        </motion.div>
                      ) : (
                        <motion.ul layout className="space-y-4">
                          {items.map((item) => (
                            <CartItemCard 
                              key={item.id} 
                              item={item} 
                              removeItem={removeItem}
                              updateQuantity={updateQuantity}
                            />
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t bg-gradient-to-b from-white to-delight-50">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold text-gray-700">المجموع:</span>
                      <span className="text-lg font-bold text-delight-700">{total}</span>
                    </div>
                    <Button 
                      onClick={handleStartCheckout}
                      className="w-full bg-delight-600 hover:bg-delight-700 group"
                      disabled={items.length === 0}
                    >
                      <motion.span 
                        initial={{ x: 0 }}
                        whileHover={{ x: -4 }}
                        className="flex items-center gap-2"
                      >
                        إتمام الطلب
                        <Check className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.span>
                    </Button>
                  </div>
                </>
              )}
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
      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
      className="flex gap-3 p-3 bg-white rounded-lg border border-gray-100 transition-all"
    >
      {/* Product Image */}
      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden border border-gray-100">
        <motion.img 
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
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
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7 rounded-full border-delight-200 text-delight-700" 
              onClick={handleDecrement}
            >
              <Minus className="h-3 w-3" />
            </Button>
          </motion.div>
          <motion.span
            key={item.quantity}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-2 w-8 text-center font-medium"
          >
            {item.quantity}
          </motion.span>
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7 rounded-full border-delight-200 text-delight-700" 
              onClick={handleIncrement}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </motion.div>
          
          <motion.div 
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="mr-auto"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors" 
              onClick={() => removeItem(item.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.li>
  );
};

export default CartDropdown;
