
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { name: 'الرئيسية', path: '/' },
    { name: 'منتجاتنا', path: '/products' },
    { name: 'المصنع', path: '/factory' },
    { name: 'حول الشركة', path: '/about' },
    { name: 'تواصل معنا', path: '/contact' },
  ];
  
  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md',
      isScrolled ? 'bg-white/80 shadow-sm py-2' : 'bg-transparent py-4'
    )}>
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <div className="text-2xl font-display font-bold text-delight-800">
            <span className="text-gradient">DELIGHT</span>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 rtl:space-x-reverse">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'px-4 py-2 nav-link text-base transition-colors duration-200',
                isActive(item.path) && 'nav-link-active'
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        
        {/* Contact Button */}
        <div className="hidden md:flex items-center">
          <Button className="btn-primary group">
            <Phone className="w-4 h-4 mr-2 group-hover:animate-pulse" />
            <span>اتصل بنا</span>
          </Button>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg animate-fade-in">
          <div className="container py-4 flex flex-col space-y-4 rtl:text-right">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'px-4 py-2 block',
                  isActive(item.path) ? 'text-delight-600 font-medium' : 'text-slate-700'
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Button className="btn-primary self-start">
              <Phone className="w-4 h-4 mr-2" />
              <span>اتصل بنا</span>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
