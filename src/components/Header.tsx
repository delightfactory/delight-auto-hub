import React from 'react';
import { NavLink } from 'react-router-dom';

const Header: React.FC = () => (
  <header className="bg-white dark:bg-gray-800 shadow-md">
    <div className="container-custom flex items-center justify-between py-4">
      <NavLink to="/" className="text-2xl font-bold text-amazon-orange dark:text-amazon-yellow">
        Delight Auto Hub
      </NavLink>
      <nav className="space-x-6">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}>
          الرئيسية
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}>
          المنتجات
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}>
          حول
        </NavLink>
        <NavLink to="/contact" className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}>
          اتصل بنا
        </NavLink>
      </nav>
    </div>
  </header>
);

export default Header;
