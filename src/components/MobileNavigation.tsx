import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, List, User, Package, PanelLeft, Zap, ChevronLeft, X, Moon, Sun, Settings, Book, Info, Phone, Factory, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Switch } from '@/components/ui/switch';

const MobileNavigation: React.FC = () => {
  // Hooks يجب استدعاء React Hooks في نفس الترتيب دائمًا
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();
  const { items } = useCart();
  const { theme } = useTheme();
  const { user } = useAuth();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const navItems = [
    { name: 'الرئيسية', path: '/', icon: Home },
    { name: 'المنتجات', path: '/products', icon: Package },
    { name: 'عروض خاصة', path: '/best-deals', icon: Zap },
    { name: 'المصنع', path: '/factory', icon: Factory },
    { name: 'المقالات', path: '/articles', icon: Book },
    { name: 'من نحن', path: '/about', icon: Info },
    { name: 'اتصل بنا', path: '/contact', icon: Phone },
  ];

  const accountItems = user?.role === 'admin'
    ? [
        { path: '/admin', label: 'لوحة التحكم', icon: Settings },
        { path: '/profile', label: 'الملف الشخصي', icon: User },
        { path: '/orders', label: 'طلباتي', icon: ShoppingCart },
        { path: '/favorites', label: 'المفضلة', icon: Heart },
        { path: '/settings', label: 'الإعدادات', icon: Settings },
      ]
    : [
        { path: '/profile', label: 'الملف الشخصي', icon: User },
        { path: '/orders', label: 'طلباتي', icon: ShoppingCart },
        { path: '/favorites', label: 'المفضلة', icon: Heart },
        { path: '/settings', label: 'الإعدادات', icon: Settings },
      ];

  return (
    <>
      {/* Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-2xl sm:hidden h-16" style={{ zIndex: 10000 }}>
        <ul className="flex items-center h-full w-full px-2">
          <li className="flex-1">
            <button 
              onClick={() => setIsSidebarOpen(prev => !prev)}
              className="flex flex-col items-center justify-center gap-1 h-full w-full text-xs py-1 transition-colors text-delight-600 dark:text-delight-400"
            >
              <PanelLeft className="w-6 h-6" />
              <span className="leading-none">القائمة</span>
            </button>
          </li>
          
          {navItems.slice(0, 3).map((item) => {
            const Icon = item.icon;
            const isActive = item.path === location.pathname;
            
            return (
              <li key={item.name} className="flex-1">
                <Link 
                  to={item.path} 
                  className={`flex flex-col items-center justify-center gap-1 h-full w-full text-xs py-1 transition-colors ${
                    isActive 
                      ? 'text-delight-600 dark:text-delight-400' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-delight-600 dark:hover:text-delight-400'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="leading-none">{item.name}</span>
                </Link>
              </li>
            );
          })}
          
          <li className="flex-1 relative">
            <Link 
              to="/cart" 
              className="flex flex-col items-center justify-center gap-1 h-full w-full text-xs py-1 transition-colors text-gray-500 dark:text-gray-400 hover:text-delight-600 dark:hover:text-delight-400"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-5 bg-red-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
              <span className="leading-none">السلة</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 sm:hidden backdrop-blur-sm" style={{ zIndex: 9990 }}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ 
                type: 'spring',
                damping: 30,
                stiffness: 300
              }}
              className={cn(
                "fixed top-0 right-0 bottom-0 w-72 h-full overflow-y-auto",
                "bg-white dark:bg-gray-900 shadow-2xl flex flex-col"
              )} style={{ zIndex: 9999 }}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">القائمة</h2>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                <div className="space-y-1">
                  <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    التنقل
                  </h3>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.path === location.pathname;
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-delight-100 dark:bg-delight-900/50 text-delight-700 dark:text-delight-400"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                {user && (
                  <div className="space-y-1 pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
                    <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      حسابي
                    </h3>
                    {accountItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = item.path === location.pathname;
                      
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsSidebarOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                            isActive
                              ? "bg-delight-100 dark:bg-delight-900/50 text-delight-700 dark:text-delight-400"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {theme === 'dark' ? (
                      <Moon className="w-5 h-5 text-delight-400" />
                    ) : (
                      <Sun className="w-5 h-5 text-delight-600" />
                    )}
                    <span className="text-sm font-medium">
                      {theme === 'dark' ? 'الوضع الليلي' : 'الوضع النهاري'}
                    </span>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={() => useTheme().toggleTheme()}
                    className={`${
                      theme === 'dark' 
                        ? 'bg-delight-600 data-[state=checked]:bg-delight-400' 
                        : 'bg-gray-300 data-[state=checked]:bg-delight-600'
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNavigation;
