
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Home, 
  Info, 
  Phone, 
  ShoppingBag, 
  Factory, 
  Menu, 
  X, 
  ShoppingCart, 
  Book, 
  Sun, 
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import CartDropdown from '@/components/CartDropdown';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/context/ThemeContext';

const navItems = [
  { path: '/', label: 'الرئيسية', icon: Home },
  { path: '/products', label: 'المنتجات', icon: ShoppingBag },
  { path: '/factory', label: 'المصنع', icon: Factory },
  { path: '/articles', label: 'المقالات', icon: Book },
  { path: '/about', label: 'من نحن', icon: Info },
  { path: '/contact', label: 'اتصل بنا', icon: Phone },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile menu toggle */}
      <div className="block lg:hidden fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className={`backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 touch-target ${
            theme === 'dark' 
              ? 'bg-gray-800/80 hover:bg-gray-700/80 text-white' 
              : 'bg-white/80 hover:bg-white text-gray-800'
          }`}
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
          "lg:translate-x-0 lg:static lg:w-72 xl:w-80",
          theme === 'dark'
            ? "bg-gradient-to-b from-gray-800 to-gray-900 text-white shadow-xl lg:shadow-md"
            : "bg-gradient-to-b from-white to-delight-50 text-gray-800 shadow-xl lg:shadow-md",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="p-6">
          <div className="mb-8 text-center">
            <div className={`inline-block p-3 rounded-full mb-3 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-delight-50'
            }`}>
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              >
                <ShoppingCart className={`h-8 w-8 ${
                  theme === 'dark' ? 'text-delight-400' : 'text-delight-700'
                }`} />
              </motion.div>
            </div>
            <h2 className={`text-2xl font-bold tracking-tight ${
              theme === 'dark' ? 'text-delight-400' : 'text-delight-700'
            }`}>ديلايت</h2>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>للعناية بالسيارات</p>
          </div>

          {/* Theme Switcher */}
          <div className={`flex items-center justify-between p-3 mb-6 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700/50' : 'bg-white/80'
          }`}>
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-delight-400" />
              ) : (
                <Sun className="h-5 w-5 text-delight-600" />
              )}
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {theme === 'dark' ? 'الوضع الليلي' : 'الوضع النهاري'}
              </span>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
              className={`${
                theme === 'dark' 
                  ? 'bg-delight-600 data-[state=checked]:bg-delight-400' 
                  : 'bg-gray-300 data-[state=checked]:bg-delight-600'
              }`}
            />
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
                    whileHover={{ x: -5, backgroundColor: theme === 'dark' ? "rgba(31, 41, 55, 0.8)" : "rgba(238, 247, 255, 0.8)" }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex items-center px-4 py-3 text-base rounded-lg transition-all duration-200",
                      theme === 'dark'
                        ? "hover:bg-gray-700/80 hover:shadow-sm touch-target"
                        : "hover:bg-delight-50/80 hover:shadow-sm touch-target",
                      isActive
                        ? theme === 'dark'
                          ? "bg-gradient-to-r from-gray-700 to-gray-600 text-white font-medium shadow-sm"
                          : "bg-gradient-to-r from-delight-50 to-delight-100 text-delight-700 font-medium shadow-sm"
                        : theme === 'dark'
                          ? "text-gray-300"
                          : "text-gray-700"
                    )}
                  >
                    <ItemIcon className={cn(
                      "ml-3 w-5 h-5 transition-colors",
                      isActive 
                        ? theme === 'dark' ? "text-delight-400" : "text-delight-600"
                        : theme === 'dark' ? "text-gray-400" : "text-gray-500"
                    )} />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className={`mr-auto w-5 h-5 ${
                          theme === 'dark' ? 'text-delight-400' : 'text-delight-600'
                        }`} />
                      </motion.div>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Cart section */}
          <div className={`mt-8 pt-6 border-t ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-medium ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}>سلة المشتريات</h3>
              <div className="relative">
                <CartDropdown />
              </div>
            </div>
            {itemCount > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-2 text-sm py-1 px-3 rounded-full font-medium ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-delight-400'
                    : 'bg-delight-50 text-delight-700'
                }`}
              >
                لديك {itemCount} منتج في السلة
              </motion.div>
            )}
          </div>
          
          {/* Bottom decoration */}
          <div className={`mt-10 pt-6 border-t ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex justify-center">
              <p className={`text-xs ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`}>ديلايت © {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
