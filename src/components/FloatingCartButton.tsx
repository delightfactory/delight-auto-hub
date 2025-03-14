
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from '@/components/ui/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import CartDropdown from './CartDropdown';

const FloatingCartButton: React.FC = () => {
  const { itemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleClick = () => {
    setIsOpen(true);
  };

  return (
    <>
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

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full max-w-md p-0 border-0 bg-transparent">
          <div className="h-full bg-white">
            <SheetHeader className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-delight-50 to-delight-100">
              <SheetTitle className="flex items-center gap-2 text-delight-800">
                <ShoppingBag className="h-5 w-5 text-delight-600" />
                سلة المشتريات
              </SheetTitle>
              <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none">
                <X className="h-5 w-5" />
                <span className="sr-only">إغلاق</span>
              </SheetClose>
            </SheetHeader>
            <div className="overflow-auto h-[calc(100%-60px)]">
              <CartDropdown inFloatingMode={true} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default FloatingCartButton;
