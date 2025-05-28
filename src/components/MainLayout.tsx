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
import BannerCarousel from './BannerCarousel';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  const location = useLocation();
  
  // Scroll to top on route change for smoother navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // تحديد القسم لعرض البنر بشكل دقيق حسب المسار
  const pathname = location.pathname;
  let pageSection = 'home';
  if (pathname === '/') {
    pageSection = 'home';
  } else if (pathname.startsWith('/products/')) {
    pageSection = 'product';
  } else if (pathname === '/products') {
    pageSection = 'products';
  } else if (pathname.startsWith('/articles/')) {
    pageSection = 'article';
  } else if (pathname === '/articles') {
    pageSection = 'articles';
  } else {
    pageSection = pathname.split('/')[1] || 'home';
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex flex-col min-h-screen w-full" dir="rtl">
        <div className="hidden sm:block fixed top-0 left-0 right-0 z-50">
          <Header />
        </div>
        <div className="sm:hidden">
          <MobileTopBar />
        </div>
        
        <div className="flex flex-1 pt-14 sm:pt-16"> 
          <Sidebar side="right" variant="floating" className="hidden lg:flex"> 
            <SidebarContent>
              <SidebarMenu />
            </SidebarContent>
            <SidebarRail />
          </Sidebar>
          
          <SidebarInset>
            <main className="flex-grow transition-all duration-300 pb-14 sm:pb-0">
              {/* تم تعديل موضع البنرات وإضافة فئة mt لإضافة مسافة علوية */}
              <div className="mt-4 sm:mt-6 relative z-10">
                <BannerCarousel pageName={pageSection} />
              </div>
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
