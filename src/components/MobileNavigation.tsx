import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, List, User, Package, PanelLeft, Zap } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSidebar } from '@/components/ui/sidebar';

const MobileNavigation: React.FC = () => {
  const location = useLocation();
  const { items } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const { toggleSidebar } = useSidebar();
  const navItems = [
    { name: 'الرئيسية', path: '/', icon: Home },
    { name: 'المنتجات', path: '/products', icon: Package },
    { name: 'عروض جامدة', path: '/best-deals', icon: Zap },
    { name: 'السلة', path: '/checkout', icon: ShoppingCart },
    { name: 'الملف الشخصي', path: '/profile', icon: User },
    { name: 'القائمة', action: toggleSidebar, icon: PanelLeft },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 sm:hidden h-12">
      <ul className="flex items-center h-full w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === location.pathname;
          const classes = `relative flex flex-col items-center justify-center gap-1 h-full text-xs py-1 transition-colors px-2 ${
            isActive ? 'text-delight-800 font-semibold' : 'text-gray-500 hover:text-delight-800'
          }`;

          return (
            <li key={item.name} className="flex-1">
              {item.action ? (
                <button onClick={item.action} className={classes}>
                  <Icon className="w-5 h-5" />
                  <span className="leading-none">{item.name}</span>
                </button>
              ) : (
                <Link to={item.path!} className={classes}>
                  <Icon className="w-5 h-5" />
                  {item.name === 'السلة' && totalItems > 0 && (
                    <span className="absolute -top-1 right-2 bg-red-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                  <span className="leading-none">{item.name}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileNavigation;
