import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '@/services/adminService';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  FileText, 
  Tag, 
  Settings,
  Palette,
  MessageCircle,
  BellRing,
  Database,
  HelpCircle,
  Image,
  Truck
} from 'lucide-react';

type NavItem = {
  path: string;
  label: string;
  icon: React.ElementType;
  badge?: number | null;
};

interface AdminNavLinksProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const AdminNavLinks: React.FC<AdminNavLinksProps> = ({ isSidebarOpen, toggleSidebar }) => {
  const location = useLocation();
  const { data: stats } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: fetchDashboardStats
  });
  
  const mainNavItems: NavItem[] = [
    { path: '/admin', label: 'لوحة القيادة', icon: BarChart3 },
    { path: '/admin/products', label: 'المنتجات', icon: Package },
    { path: '/admin/orders', label: 'الطلبات', icon: ShoppingCart, badge: stats?.newOrdersCount ?? null },
    { path: '/admin/users', label: 'العملاء', icon: Users },
    { path: '/admin/shipping', label: 'الشحن', icon: Truck },
    { path: '/admin/articles', label: 'المقالات', icon: FileText },
    { path: '/admin/categories', label: 'الفئات', icon: Tag },
    { path: '/admin/banners', label: 'البنرات', icon: Image },
  ];
  
  const settingsNavItems: NavItem[] = [
    { path: '/admin/settings', label: 'الإعدادات العامة', icon: Settings },
    { path: '/admin/appearance', label: 'المظهر والتخصيص', icon: Palette },
    { path: '/admin/comments', label: 'التعليقات', icon: MessageCircle, badge: 5 },
    { path: '/admin/notifications', label: 'الإشعارات', icon: BellRing },
    { path: '/admin/backups', label: 'النسخ الاحتياطي', icon: Database },
  ];

  const renderNavItems = (items: NavItem[]) => {
    return items.map((item) => {
      const isActive = location.pathname === item.path;
      const ItemIcon = item.icon;
      
      return (
        <li key={item.path} className="px-3">
          <Link
            to={item.path}
            onClick={() => { if (isSidebarOpen) toggleSidebar(); }}
            className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-medium'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            <ItemIcon className={`w-5 h-5 ${isActive ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`} />
            {isSidebarOpen && (
              <div className="flex justify-between items-center w-full">
                <span>{item.label}</span>
                {item.badge && (
                  <span className="bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
            )}
            {!isSidebarOpen && item.badge && (
              <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </Link>
        </li>
      );
    });
  };

  return (
    <>
      <div className="mb-4">
        {isSidebarOpen && <h3 className="px-3 mb-1 text-xs text-gray-500 dark:text-gray-400">القائمة الرئيسية</h3>}
        <ul className="space-y-1">
          {renderNavItems(mainNavItems)}
        </ul>
      </div>
      
      <div>
        {isSidebarOpen && <h3 className="px-3 mb-1 text-xs text-gray-500 dark:text-gray-400">الإعدادات</h3>}
        <ul className="space-y-1">
          {renderNavItems(settingsNavItems)}
        </ul>
      </div>
    </>
  );
};

export default AdminNavLinks;
