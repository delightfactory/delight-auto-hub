
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import CartDropdown from './CartDropdown';

interface NavbarProps {
  transparent?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ transparent = false }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navbarClass = cn(
    'fixed top-0 left-0 right-0 z-30 transition-all duration-300',
    {
      'bg-white shadow-md py-3': !transparent || scrolled,
      'bg-transparent py-5': transparent && !scrolled,
    }
  );

  return (
    <motion.header
      className={navbarClass}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container-custom flex justify-between items-center">
        <div className="lg:invisible">
          {/* Logo placeholder - invisible on large screens since it's in the sidebar */}
          <h1 className="text-xl font-bold text-delight-600">ديلايت</h1>
        </div>

        <div className="hidden lg:flex items-center gap-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn('nav-link', isActive && 'nav-link-active')
            }
          >
            الرئيسية
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              cn('nav-link', isActive && 'nav-link-active')
            }
          >
            المنتجات
          </NavLink>
          <NavLink
            to="/factory"
            className={({ isActive }) =>
              cn('nav-link', isActive && 'nav-link-active')
            }
          >
            المصنع
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              cn('nav-link', isActive && 'nav-link-active')
            }
          >
            من نحن
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              cn('nav-link', isActive && 'nav-link-active')
            }
          >
            اتصل بنا
          </NavLink>
        </div>

        <div>
          <CartDropdown />
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
