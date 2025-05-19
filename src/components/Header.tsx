
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { User, LogIn, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const Header: React.FC = () => {
  const { user } = useAuth();
  const { itemCount } = useCart();

  return (
    <header className="bg-delight-800 text-white py-2 fixed top-0 w-full z-50 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-delight-200">
            <span className="text-white">DE</span>LIGHT
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
            <Link to="/" className="hover:text-delight-200 transition-colors">الرئيسية</Link>
            <Link to="/products" className="hover:text-delight-200 transition-colors">المنتجات</Link>
            <Link to="/about" className="hover:text-delight-200 transition-colors">عن الشركة</Link>
            <Link to="/factory" className="hover:text-delight-200 transition-colors">المصنع</Link>
            <Link to="/contact" className="hover:text-delight-200 transition-colors">اتصل بنا</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link to="/cart" className="flex items-center gap-1 text-white hover:text-delight-200 transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-delight-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            
            {user ? (
              <Link to="/profile">
                <Button variant="outline" className="flex items-center gap-1 border-delight-300 text-delight-100 hover:bg-delight-700">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">حسابي</span>
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="outline" className="flex items-center gap-1 border-delight-300 text-delight-100 hover:bg-delight-700">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">تسجيل الدخول</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
