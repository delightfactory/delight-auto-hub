
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useTheme } from '@/context/ThemeContext';

const MainLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="flex flex-col min-h-screen" dir="rtl">
      <Navbar isDarkTheme={theme === 'dark'} toggleTheme={toggleTheme} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
