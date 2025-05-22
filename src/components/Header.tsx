import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { User, LogIn, ShoppingCart, Menu, Search, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { SidebarMenu } from '@/components/SidebarMenu';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // Close search when route changes
  useEffect(() => {
    setSearchOpen(false);
  }, [location.pathname]);

  return (
    <header 
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        "bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm",
        "border-b border-gray-200/80 dark:border-gray-800/80",
        "text-gray-900 dark:text-white",
        scrolled ? "py-2 shadow-sm" : "py-3"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center transition-transform hover:scale-105"
            aria-label="الرئيسية"
          >
            <img 
              src="/lovable-uploads/7bb28241-5759-4c8e-8fd4-83cedb7bea1e.png" 
              alt="DELIGHT Logo" 
              className={cn("h-10 w-auto transition-all duration-300", scrolled ? "h-9" : "h-10")}
            />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
            {[
              { path: "/", label: "الرئيسية" },
              { path: "/products", label: "المنتجات" },
              { path: "/articles", label: "المقالات" },
              { path: "/about", label: "عن الشركة" },
              { path: "/factory", label: "المصنع" },
              { path: "/contact", label: "اتصل بنا" },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium transition-all duration-200 group",
                  "hover:text-primary dark:hover:text-primary-foreground",
                  location.pathname === item.path 
                    ? "text-primary dark:text-primary-foreground font-semibold" 
                    : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {item.label}
                <span 
                  className={cn(
                    "absolute bottom-0 right-0 w-0 h-0.5 bg-primary dark:bg-primary-foreground transition-all duration-300",
                    location.pathname === item.path ? "w-full" : "group-hover:w-full"
                  )}
                />
              </Link>
            ))}
          </nav>
          
          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label={searchOpen ? "إغلاق البحث" : "فتح البحث"}
            >
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Button>
            
            {/* Cart */}
            <Link 
              to="/cart" 
              className="relative p-2 text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary-foreground transition-colors"
              aria-label="سلة المشتريات"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>
            
            {/* Auth Buttons */}
            {user ? (
              <>
                {/* Admin Dashboard Button */}
                {user.role === 'admin' && (
                  <Link to="/admin" className="mr-4">
                    <Button
                      variant="outline"
                      className="hidden sm:inline-flex items-center gap-2 border-red-600 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      لوحة التحكم
                    </Button>
                  </Link>
                )}
                <Link to="/profile">
                  <Button 
                    variant="ghost" 
                    className="hidden sm:flex items-center gap-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span>حسابي</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="sm:hidden text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    aria-label="حسابي"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/auth">
                <Button 
                  variant="outline" 
                  className="hidden sm:flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <LogIn className="h-4 w-4" />
                  <span>تسجيل الدخول</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="sm:hidden border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="تسجيل الدخول"
                >
                  <LogIn className="h-5 w-5" />
                </Button>
              </Link>
            )}
            
            {/* Mobile Menu */}
            <div className="md:hidden">
              <Drawer direction="right">
                <DrawerTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    aria-label="القائمة"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="h-screen w-4/5 sm:w-80 p-0 border-l-0 rounded-none">
                  <SidebarMenu />
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </div>
        
        {/* Search Bar */}
        <div 
          className={cn(
            "overflow-hidden transition-all duration-300 mt-2",
            searchOpen ? "max-h-16 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن منتجات..."
              className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-colors"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header;
