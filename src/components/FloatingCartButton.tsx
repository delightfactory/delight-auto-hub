
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import CartDropdown from './CartDropdown';
import { useIsMobile } from '@/hooks/use-mobile';

const FloatingCartButton: React.FC = () => {
  const { itemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Ensure the component is mounted before showing any animations
    // This prevents hydration issues
    setIsMounted(true);
  }, []);
  
  const handleClick = () => {
    setIsOpen(true);
  };

  if (!isMounted) return null;

  return (
    <>
      <motion.button
        onClick={handleClick}
        className="fixed bottom-6 right-6 z-50 bg-amazon-orange text-amazon-dark p-4 rounded-full shadow-amazon hover:shadow-xl transition-all duration-300 lg:bottom-8 lg:right-8 touch-target"
        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255, 153, 0, 0.5)" }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 15
        }}
      >
        <ShoppingCart className="h-5 w-5 lg:h-5 lg:w-5" />
        {itemCount > 0 && (
          <motion.div
            className="absolute -top-2 -right-2 bg-amazon-warning text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {itemCount}
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent 
              side="right" 
              className="p-0 border-0 bg-transparent transition-all duration-300 ease-in-out w-full max-w-md xl:max-w-lg"
            >
              <motion.div 
                className="h-full bg-white dark:bg-gray-900 rounded-l-lg shadow-xl overflow-hidden flex flex-col"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <SheetHeader className="p-3 border-b flex items-center justify-between bg-amazon-secondary">
                  <SheetTitle className="flex items-center gap-2 text-white font-amazon">
                    <ShoppingBag className="h-4 w-4 text-amazon-orange" />
                    سلة المشتريات
                  </SheetTitle>
                  <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none touch-target text-white">
                    <X className="h-4 w-4" />
                    <span className="sr-only">إغلاق</span>
                  </SheetClose>
                </SheetHeader>
                <div className="flex-grow overflow-auto max-h-[calc(100vh-60px)]">
                  <CartDropdown inFloatingMode={true} />
                </div>
              </motion.div>
            </SheetContent>
          </Sheet>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingCartButton;
