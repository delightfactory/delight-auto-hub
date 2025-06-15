import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Heart } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import CartDropdown from './CartDropdown';
import NotificationCenter from './notifications/NotificationCenter';
import AdminSidebarLink from './AdminSidebarLink';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { items } = useCart();
  const location = useLocation();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { name: 'الرئيسية', path: '/' },
    { name: 'المفضلة', path: '/favorites' },
    { name: 'المنتجات', path: '/products' },
    { name: 'العروض الخاصة', path: '/best-deals' },
    { name: 'المصنع', path: '/factory' },
    { name: 'المقالات', path: '/articles' },
    { name: 'المغارة', path: '/cave' },
    { name: 'من نحن', path: '/about' },
    { name: 'اتصل بنا', path: '/contact' },
  ];

  const handleLogout = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/lovable-uploads/7bb28241-5759-4c8e-8fd4-83cedb7bea1e.png" alt="Delight Logo" className="h-10 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 space-x-reverse">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-red-600 ${
                  location.pathname === item.path
                    ? 'text-red-600 border-b-2 border-red-600 pb-1'
                    : 'text-gray-700 hover:text-red-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Notifications - only show for authenticated users */}
            {user && <NotificationCenter />}
            {/* Favorites shortcut */}
            {user && (
              <Link
                to="/favorites"
                className="flex items-center text-gray-700 hover:text-red-600"
                title="المفضلة"
              >
                <Heart className="w-5 h-5" />
              </Link>
            )}
            
            {/* Cart */}
            <CartDropdown />
            
            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="hidden sm:flex items-center space-x-2 text-sm text-gray-700 hover:text-red-600"
                >
                  <User className="w-4 h-4" />
                  <span>{user.name}</span>
                </Link>
                <AdminSidebarLink />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden sm:block text-sm text-gray-700 hover:text-red-600"
                >
                  تسجيل الخروج
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                  تسجيل الدخول
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t">
          <div className="container-custom py-4">
            {/* رابط المفضلة الظاهر في أعلى القائمة الجانبية على الموبايل */}
            {user && (
              <Link
                to="/favorites"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 mb-4"
              >
                <Heart className="w-6 h-6" />
                <span className="text-base font-medium">المفضلة</span>
              </Link>
            )}
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors hover:text-red-600 ${
                    location.pathname === item.path ? 'text-red-600' : 'text-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {user && (
                <Link
                  to="/favorites"
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-red-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="w-5 h-5" />
                  <span>المفضلة</span>
                </Link>
              )}
              
              {user ? (
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 space-x-reverse text-sm text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>{user.name}</span>
                  </Link>
                  <AdminSidebarLink />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="justify-start text-sm"
                  >
                    تسجيل الخروج
                  </Button>
                </div>
              ) : (
                <div className="pt-4 border-t">
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white w-full">
                      تسجيل الدخول
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
