
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Home, Info, Phone, ShoppingBag, Factory, Menu, X, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import CartDropdown from '@/components/CartDropdown';

const navItems = [
  { path: '/', label: 'الرئيسية', icon: Home },
  { path: '/products', label: 'المنتجات', icon: ShoppingBag },
  { path: '/factory', label: 'المصنع', icon: Factory },
  { path: '/about', label: 'من نحن', icon: Info },
  { path: '/contact', label: 'اتصل بنا', icon: Phone },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { itemCount } = useCart();

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile menu toggle */}
      <div className="block lg:hidden fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="bg-white/80 backdrop-blur-sm shadow-md hover:bg-white hover:shadow-lg transition-all duration-300"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={cn(
          "fixed top-0 right-0 h-full z-40 overflow-y-auto",
          "w-72 transform transition-all duration-300 ease-in-out",
          "lg:translate-x-0 lg:static lg:w-72",
          "bg-gradient-to-b from-white to-delight-50 shadow-xl lg:shadow-md",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="p-6">
          <div className="mb-8 text-center">
            <div className="inline-block p-3 rounded-full bg-delight-50 mb-3">
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              >
                <ShoppingCart className="h-8 w-8 text-delight-700" />
              </motion.div>
            </div>
            <h2 className="text-2xl font-bold text-delight-700 tracking-tight">ديلايت</h2>
            <p className="text-gray-500 text-sm">للعناية بالسيارات</p>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const ItemIcon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                >
                  <motion.div
                    whileHover={{ x: -5, backgroundColor: "rgba(238, 247, 255, 0.8)" }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex items-center px-4 py-3 text-base rounded-lg transition-all duration-200",
                      "hover:bg-delight-50/80 hover:shadow-sm",
                      isActive 
                        ? "bg-gradient-to-r from-delight-50 to-delight-100 text-delight-700 font-medium shadow-sm" 
                        : "text-gray-700"
                    )}
                  >
                    <ItemIcon className={cn(
                      "ml-3 w-5 h-5 transition-colors",
                      isActive ? "text-delight-600" : "text-gray-500 group-hover:text-delight-500"
                    )} />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="mr-auto w-5 h-5 text-delight-600" />
                      </motion.div>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Cart section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">سلة المشتريات</h3>
              <div className="relative">
                <CartDropdown />
              </div>
            </div>
            {itemCount > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm bg-delight-50 text-delight-700 py-1 px-3 rounded-full font-medium"
              >
                لديك {itemCount} منتج في السلة
              </motion.div>
            )}
          </div>
          
          {/* Bottom decoration */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <div className="flex justify-center">
              <p className="text-xs text-gray-400">ديلايت © {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
