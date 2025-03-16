
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
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 lg:bottom-8 lg:right-8 touch-target"
        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(37, 99, 235, 0.5)" }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 15
        }}
      >
        <ShoppingCart className="h-6 w-6 lg:h-6 lg:w-6" />
        {itemCount > 0 && (
          <motion.div
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
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
                className="h-full bg-white rounded-l-lg shadow-xl overflow-hidden flex flex-col"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <SheetHeader className="p-4 border-b flex items-center justify-between bg-gray-50">
                  <SheetTitle className="flex items-center gap-2 text-gray-800">
                    <ShoppingBag className="h-5 w-5 text-blue-600" />
                    سلة المشتريات
                  </SheetTitle>
                  <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none touch-target">
                    <X className="h-5 w-5" />
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
