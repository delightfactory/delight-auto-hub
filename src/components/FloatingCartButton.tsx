
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const FloatingCartButton: React.FC = () => {
  const { itemCount } = useCart();
  
  const handleClick = () => {
    // Find cart dropdown button in sidebar and click it
    const cartButton = document.querySelector('[data-cart-toggle]');
    if (cartButton && cartButton instanceof HTMLElement) {
      cartButton.click();
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-delight-500 to-delight-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-colors duration-300"
      whileHover={{ scale: 1.1, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 15
      }}
    >
      <ShoppingCart className="h-6 w-6" />
      {itemCount > 0 && (
        <motion.div
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ 
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          {itemCount}
        </motion.div>
      )}
      <motion.div
        className="absolute -z-10 inset-0 rounded-full bg-white opacity-30"
        initial={{ scale: 1 }}
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.3, 0, 0.3]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "loop"
        }}
      />
    </motion.button>
  );
};

export default FloatingCartButton;
