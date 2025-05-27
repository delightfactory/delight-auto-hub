import React, { useState, useEffect } from 'react';
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
  Moon,
  ChevronLeft,
  Settings,
  User,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import CartDropdown from '@/components/CartDropdown';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import AdminSidebarLink from './AdminSidebarLink';

const navItems = [
  { path: '/', label: 'الرئيسية', icon: Home },
  { path: '/products', label: 'المنتجات', icon: ShoppingBag },
  { path: '/best-deals', label: 'العروض الخاصة', icon: Zap },
  { path: '/factory', label: 'المصنع', icon: Factory },
  { path: '/articles', label: 'المقالات', icon: Book },
  { path: '/about', label: 'من نحن', icon: Info },
  { path: '/contact', label: 'اتصل بنا', icon: Phone },
];

const accountItems = [
  { path: '/profile', label: 'الملف الشخصي', icon: User },
  { path: '/orders', label: 'طلباتي', icon: ShoppingCart },
  { path: '/settings', label: 'الإعدادات', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const desktopOpenWidth = '18rem';
  const desktopCollapsedWidth = '4rem';
  const mobileDrawerClass = 'w-3/4';

  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 1024;
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile menu toggle */}
      <div className="block md:hidden fixed top-4 right-4 z-50">
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

      {/* Desktop sidebar toggle (outside the sidebar) */}
      <div className="hidden md:block fixed left-4 top-4 z-50">
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
          {isOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </Button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={toggleSidebar} />
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="sidebar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3 }}
            className={cn(
              "fixed top-0 right-0 bottom-0 z-50 w-72 h-full overflow-y-auto transform transition-all duration-300 ease-in-out",
              theme === 'dark'
                ? "bg-gradient-to-b from-gray-800 to-gray-900 text-white shadow-xl"
                : "bg-gradient-to-b from-white to-delight-50 text-gray-800 shadow-xl"
            )}
          >
            <div>
              <div className="p-6 bg-delight-600 text-white text-center rounded-bl-lg">
                <img src="/lovable-uploads/7bb28241-5759-4c8e-8fd4-83cedb7bea1e.png" alt="Delight Logo" className="h-10 w-auto mx-auto mb-2" />
                <h2 className="text-2xl font-bold tracking-tight">منتجات العناية بالسيارات</h2>
              </div>
              <div className="p-6">
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
                  {/* روابط التنقل العامة */}
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const ItemIcon = item.icon;
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
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
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? 'auto' : 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            {item.label}
                          </motion.span>
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
                  
                  {/* روابط الحساب للمستخدمين المسجلين */}
                  {user && (
                    <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        الحساب
                      </h3>
                      <div className="space-y-1.5">
                        {accountItems.map((item) => {
                          const isActive = location.pathname === item.path;
                          const ItemIcon = item.icon;
                          
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
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
                                <motion.span
                                  initial={{ opacity: 0, width: 0 }}
                                  animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? 'auto' : 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  {item.label}
                                </motion.span>
                              </motion.div>
                            </Link>
                          );
                        })}
                        
                        {/* رابط لوحة التحكم للمسؤولين */}
                        {user?.role === 'admin' && (
                          <Link to="/admin" onClick={() => window.innerWidth < 1024 && setIsOpen(false)}>
                            <motion.div
                              whileHover={{ x: -5, backgroundColor: theme === 'dark' ? "rgba(31, 41, 55, 0.8)" : "rgba(238, 247, 255, 0.8)" }}
                              whileTap={{ scale: 0.98 }}
                              className={cn(
                                "flex items-center px-4 py-3 text-base rounded-lg transition-all duration-200",
                                theme === 'dark'
                                  ? "hover:bg-gray-700/80 hover:shadow-sm touch-target"
                                  : "hover:bg-delight-50/80 hover:shadow-sm touch-target",
                                location.pathname.startsWith('/admin')
                                  ? theme === 'dark'
                                    ? "bg-gradient-to-r from-gray-700 to-gray-600 text-white font-medium shadow-sm"
                                    : "bg-gradient-to-r from-delight-50 to-delight-100 text-delight-700 font-medium shadow-sm"
                                  : theme === 'dark'
                                    ? "text-gray-300"
                                    : "text-gray-700"
                              )}
                            >
                              <Settings className={cn(
                                "ml-3 w-5 h-5 transition-colors",
                                location.pathname.startsWith('/admin')
                                  ? theme === 'dark' ? "text-delight-400" : "text-delight-600"
                                  : theme === 'dark' ? "text-gray-400" : "text-gray-500"
                              )} />
                              <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? 'auto' : 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                لوحة التحكم
                              </motion.span>
                            </motion.div>
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </nav>

                {/* Cart section */}
                <div className={`mt-6 pt-4 border-t ${
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
