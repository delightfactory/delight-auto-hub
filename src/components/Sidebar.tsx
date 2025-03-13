
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
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
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="bg-white/10 backdrop-blur-sm"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <motion.div
        className={cn(
          "fixed top-0 right-0 h-full bg-white z-40 shadow-xl overflow-y-auto",
          "w-64 transform transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:static lg:w-72 lg:shadow-none",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-delight-700">ديلايت</h2>
            <p className="text-gray-500 text-sm">للعناية بالسيارات</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const ItemIcon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center px-4 py-3 text-base rounded-md transition-colors",
                    "group hover:bg-delight-50 hover:text-delight-700",
                    isActive ? "bg-delight-50 text-delight-700 font-medium" : "text-gray-700"
                  )}
                >
                  <ItemIcon className="ml-3 w-5 h-5" />
                  <span>{item.label}</span>
                  {isActive && (
                    <ChevronRight className="mr-auto w-5 h-5 text-delight-600" />
                  )}
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
              <div className="mt-2 text-sm text-gray-500">
                لديك {itemCount} منتج في السلة
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
