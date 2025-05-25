import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import Header from './Header';
import Footer from './Footer';
import MobileTopBar from './MobileTopBar';
import MobileNavigation from './MobileNavigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarRail,
  SidebarInset
} from '@/components/ui/sidebar';
import { SidebarMenu } from './SidebarMenu';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  const location = useLocation();
  
  // Scroll to top on route change for smoother navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex flex-col min-h-screen w-full" dir="rtl">
        <div className="hidden sm:block">
          <Header />
        </div>
        <div className="sm:hidden">
          <MobileTopBar />
        </div>
        
        <div className="flex flex-1 pt-14"> {/* Add padding top to account for fixed header */}
          <Sidebar side="right" variant="floating" className="hidden lg:flex"> 
            <SidebarContent>
              <SidebarMenu />
            </SidebarContent>
            <SidebarRail />
          </Sidebar>
          
          <SidebarInset>
            <main className="flex-grow transition-all duration-300 pb-14 sm:pb-0">
              {children}
            </main>
            <Footer />
            <div className="sm:hidden">
              <MobileNavigation />
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};

export { MainLayout };
export default MainLayout;
