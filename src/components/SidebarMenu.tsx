
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { Home, ShoppingBag, Info, Factory, Phone, ShoppingCart, User, LogIn, Sun, Moon, Settings, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import AdminSidebarLink from '@/components/AdminSidebarLink';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { navLinksService } from '@/services/homepageService';
import { NavLink as NavLinkType } from '@/types/db';
import { Loader2 } from 'lucide-react';

// Helper to map icon names to components
const getIconByName = (iconName: string) => {
  const iconMap: Record<string, React.ElementType> = {
    Home: Home,
    ShoppingBag: ShoppingBag,
    Tag: Tag,
    Info: Info,
    Factory: Factory,
    Phone: Phone,
    ShoppingCart: ShoppingCart,
    User: User,
    LogIn: LogIn,
    Settings: Settings
  };
  
  return iconMap[iconName] || Home;
};

export const SidebarMenu: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  
  const { data: isAdmin } = useQuery({
    queryKey: ['isUserAdmin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      try {
        const { data, error } = await supabase.rpc('is_admin');
        
        if (error) {
          console.error("Error checking admin status:", error);
          return false;
        }
        
        return data || false;
      } catch (error) {
        console.error("Error in admin check:", error);
        return false;
      }
    },
    enabled: !!user,
  });
  
  // Fetch navigation links from the database
  const { data: navLinks, isLoading: isLoadingNavLinks } = useQuery({
    queryKey: ['navLinks'],
    queryFn: navLinksService.getNavLinks,
  });
  
  // Fallback navigation links if loading or error
  const fallbackNavLinks = [
    { path: '/', label: 'الرئيسية', icon: 'Home' },
    { path: '/products', label: 'المنتجات', icon: 'ShoppingBag' },
    { path: '/articles', label: 'المقالات', icon: 'Tag' },
    { path: '/about', label: 'عن الشركة', icon: 'Info' },
    { path: '/factory', label: 'المصنع', icon: 'Factory' },
    { path: '/contact', label: 'اتصل بنا', icon: 'Phone' },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 bg-red-600 text-white">
        <div className="flex justify-center mb-4">
          <img 
            src="/lovable-uploads/7bb28241-5759-4c8e-8fd4-83cedb7bea1e.png" 
            alt="DELIGHT Logo" 
            className="h-12 w-auto"
          />
        </div>
        <p className="text-center text-sm">منتجات العناية بالسيارات</p>
      </div>

      {/* Theme Switch */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {theme === 'dark' ? (
            <Moon className="h-5 w-5 text-gray-400" />
          ) : (
            <Sun className="h-5 w-5 text-yellow-500" />
          )}
          <span className="text-sm font-medium dark:text-gray-200">
            {theme === 'dark' ? 'الوضع الليلي' : 'الوضع النهاري'}
          </span>
        </div>
        <Switch
          checked={theme === 'dark'}
          onCheckedChange={toggleTheme}
        />
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {isLoadingNavLinks ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-red-500" />
            </div>
          ) : (
            (navLinks && navLinks.length > 0 ? navLinks : fallbackNavLinks).map((item: NavLinkType | { path: string, label: string, icon: string }) => {
              const isActive = location.pathname === ('path' in item ? item.path : item.url);
              const path = 'path' in item ? item.path : item.url;
              const label = 'label' in item ? item.label : item.title;
              const iconName = 'icon' in item ? item.icon : 'Home';
              
              // Get the appropriate icon component
              const ItemIcon = 'icon' in item ? getIconByName(item.icon) : Home;
              
              return (
                <li key={path}>
                  <Link
                    to={path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-medium'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                    }`}
                  >
                    <ItemIcon className={`w-5 h-5 ${isActive ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })
          )}
        </ul>

        <div className="mt-6">
          <Link to="/cart" className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span>سلة المشتريات</span>
            </div>
            {itemCount > 0 && (
              <span className="bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {user ? (
          <div className="space-y-3">
            <Link to="/profile" className="w-full">
              <Button variant="outline" className="w-full flex items-center justify-center gap-2 border-red-600 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20">
                <User className="w-5 h-5" />
                <span>الملف الشخصي</span>
              </Button>
            </Link>
            
            {/* Admin Dashboard Link - Direct link visible to admins */}
            {isAdmin && (
              <Link to="/admin" className="w-full">
                <Button className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white">
                  <Settings className="w-5 h-5" />
                  <span>لوحة التحكم</span>
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <Link to="/auth" className="w-full">
            <Button className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white">
              <LogIn className="w-5 h-5" />
              <span>تسجيل الدخول</span>
            </Button>
          </Link>
        )}
        
        {/* Keep AdminSidebarLink as a fallback */}
        <AdminSidebarLink>
          <span>لوحة التحكم</span>
        </AdminSidebarLink>
      </div>
      
      {/* Footer */}
      <div className="p-4 text-center text-xs text-gray-500 dark:text-gray-400">
        ديلايت © {new Date().getFullYear()}
      </div>
    </div>
  );
};
