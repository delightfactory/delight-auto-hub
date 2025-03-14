
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from '@/components/ui/use-toast';

const FloatingCartButton: React.FC = () => {
  const { itemCount } = useCart();
  
  const handleClick = () => {
    // Direct cart toggle implementation instead of relying on DOM elements
    // Find cart dropdown button in sidebar and click it
    const cartButton = document.querySelector('[data-cart-toggle]');
    if (cartButton && cartButton instanceof HTMLElement) {
      cartButton.click();
    } else {
      // Show cart in a different way if the button is not found
      // First, try to manually toggle any dropdown that might be in the DOM
      const dropdown = document.querySelector('[data-state="closed"][data-cart-dropdown]');
      if (dropdown && dropdown instanceof HTMLElement) {
        // Simulate a click on this element
        dropdown.click();
      } else {
        // If all fails, show a toast with instructions
        toast({
          title: "تعذر فتح السلة",
          description: "يرجى المحاولة مرة أخرى أو استخدام زر السلة في القائمة الجانبية",
          variant: "destructive",
        });
        console.log("Cart toggle elements not found in the DOM", { 
          cartButton: Boolean(cartButton), 
          dropdown: Boolean(dropdown) 
        });
      }
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 gold-gradient text-white p-4 rounded-full shadow-lg hover:shadow-xl gold-glow transition-all duration-300"
      whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(245, 158, 11, 0.7)" }}
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
        className="absolute -z-10 inset-0 rounded-full bg-amber-400/50 opacity-30"
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
