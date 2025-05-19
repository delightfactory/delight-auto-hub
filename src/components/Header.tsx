
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { User, LogIn, ShoppingCart, Menu } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { SidebarMenu } from '@/components/SidebarMenu';

const Header: React.FC = () => {
  const { user } = useAuth();
  const { itemCount } = useCart();

  return (
    <header className="bg-red-600 text-white py-2 fixed top-0 w-full z-50 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/7bb28241-5759-4c8e-8fd4-83cedb7bea1e.png" 
              alt="DELIGHT Logo" 
              className="h-10 w-auto"
            />
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
            <Link to="/" className="hover:text-gray-200 transition-colors">الرئيسية</Link>
            <Link to="/products" className="hover:text-gray-200 transition-colors">المنتجات</Link>
            <Link to="/about" className="hover:text-gray-200 transition-colors">عن الشركة</Link>
            <Link to="/factory" className="hover:text-gray-200 transition-colors">المصنع</Link>
            <Link to="/contact" className="hover:text-gray-200 transition-colors">اتصل بنا</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link to="/cart" className="flex items-center gap-1 text-white hover:text-gray-200 transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            
            {user ? (
              <Link to="/profile">
                <Button variant="outline" className="flex items-center gap-1 border-white text-white hover:bg-red-700 hover:text-white">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">حسابي</span>
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="outline" className="flex items-center gap-1 border-white text-white hover:bg-red-700 hover:text-white">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">تسجيل الدخول</span>
                </Button>
              </Link>
            )}
            
            <div className="md:hidden">
              <Drawer direction="right">
                <DrawerTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-red-700">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="h-screen w-3/4 p-0 border-l-0 rounded-none">
                  <SidebarMenu />
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
