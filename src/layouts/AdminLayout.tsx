import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { 
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
import AdminNavLinks from '@/components/admin/AdminNavLinks';
import AdminHeader from '@/components/admin/AdminHeader';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Load sidebar state from localStorage or default by viewport width
  useEffect(() => {
    const stored = localStorage.getItem('adminSidebarOpen');
    if (stored !== null) setIsSidebarOpen(stored === 'true');
    else setIsSidebarOpen(window.innerWidth >= 768);
  }, []);

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem('adminSidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

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
        {/* Overlay for mobile when sidebar open */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 md:hidden z-20"
            onClick={toggleSidebar}
          />
        )}
        <aside
          ref={sidebarRef}
          className={`${isSidebarOpen ? 'fixed w-64' : 'hidden md:block md:fixed md:w-16'} bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 h-full lg:relative z-30`}
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
              <Button variant="ghost" size="sm" onClick={toggleSidebar}>
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
            
            <Separator />
            
            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-4">
              <AdminNavLinks isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
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
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}>
          {/* Top Header */}
          <AdminHeader toggleSidebar={toggleSidebar} />

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
