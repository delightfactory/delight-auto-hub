
import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  FileText, 
  Tag, 
  Settings, 
  LogOut,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AdminGuard from '@/components/admin/AdminGuard';
import { useToast } from '@/hooks/use-toast';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { path: '/admin', label: 'لوحة القيادة', icon: BarChart3 },
    { path: '/admin/products', label: 'المنتجات', icon: Package },
    { path: '/admin/orders', label: 'الطلبات', icon: ShoppingCart },
    { path: '/admin/customers', label: 'العملاء', icon: Users },
    { path: '/admin/articles', label: 'المقالات', icon: FileText },
    { path: '/admin/categories', label: 'الفئات', icon: Tag },
    { path: '/admin/settings', label: 'الإعدادات', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك بنجاح من لوحة التحكم",
      });
      navigate('/');
    } catch (error) {
      console.error("خطأ في تسجيل الخروج:", error);
      toast({
        title: "خطأ في تسجيل الخروج",
        description: "حدث خطأ أثناء محاولة تسجيل الخروج",
        variant: "destructive"
      });
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <AdminGuard>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <aside 
          className={`${
            isSidebarOpen ? 'w-64' : 'w-16'
          } bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 z-30 fixed h-full lg:relative`}
        >
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 flex items-center justify-between">
              {isSidebarOpen && (
                <div className="flex items-center">
                  <img 
                    src="/lovable-uploads/7bb28241-5759-4c8e-8fd4-83cedb7bea1e.png" 
                    alt="DELIGHT Logo" 
                    className="h-8 w-auto" 
                  />
                  <span className="font-bold text-xl ml-2 text-gray-800 dark:text-white">لوحة التحكم</span>
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={toggleSidebar} className="lg:hidden">
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleSidebar} 
                className="hidden lg:flex"
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
            
            <Separator />
            
            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const ItemIcon = item.icon;
                  
                  return (
                    <li key={item.path} className="px-3">
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-medium'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                        }`}
                      >
                        <ItemIcon className={`w-5 h-5 ${isActive ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`} />
                        {isSidebarOpen && <span>{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            
            {/* Sidebar Footer */}
            <div className="p-4 mt-auto">
              {/* Theme Toggle */}
              {isSidebarOpen ? (
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium dark:text-gray-200">
                    {theme === 'dark' ? 'الوضع الليلي' : 'الوضع النهاري'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                  >
                    {theme === 'dark' ? (
                      <Sun className="h-5 w-5 text-yellow-400" />
                    ) : (
                      <Moon className="h-5 w-5 text-gray-600" />
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="w-full flex justify-center mb-4"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <Moon className="h-5 w-5 text-gray-600" />
                  )}
                </Button>
              )}
              
              <Separator className="my-2" />
              
              {/* User Profile */}
              <div className={`flex ${isSidebarOpen ? 'items-center' : 'justify-center'} gap-3 mb-3`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar_url || ''} />
                  <AvatarFallback className="bg-red-100 text-red-600">
                    {user?.name?.[0]?.toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                {isSidebarOpen && (
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{user?.name || 'مسؤول'}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
                      {user?.email || 'admin@example.com'}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Logout Button */}
              {isSidebarOpen ? (
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2 border-red-600 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full flex justify-center text-red-600 dark:text-red-400"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              )}
              
              {/* Back to Site Link */}
              {isSidebarOpen && (
                <Link 
                  to="/"
                  className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 block"
                >
                  الرجوع إلى الموقع الرئيسي
                </Link>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm py-4 px-6 flex justify-between items-center">
            <Button variant="ghost" size="sm" onClick={toggleSidebar} className="lg:hidden">
              <Menu size={20} />
            </Button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white hidden sm:block">
              لوحة تحكم ديلايت
            </h1>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Link to="/" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                العودة إلى الموقع
              </Link>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminGuard>
  );
};

export default AdminLayout;
