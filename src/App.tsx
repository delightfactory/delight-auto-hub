import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, lazy, useEffect, useState } from "react";
import Index from "./pages/Index";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import ProductsPage from "./pages/ProductsPage";
import ProductPage from "./pages/ProductPage";
import FactoryPage from "./pages/FactoryPage";
import ArticlesPage from "./pages/ArticlesPage";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import NotFound from "./pages/NotFound";
import OrdersPage from "./pages/OrdersPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import Sidebar from "./components/Sidebar";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import WhatsAppButton from "./components/WhatsAppButton";
import PageLoader from "./components/PageLoader";
import FloatingCartButton from "./components/FloatingCartButton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MainLayout from "./components/MainLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      networkMode: 'always', // Ensure queries run even if there are network issues
    },
  },
});

// Animation wrapper component for route transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Add star animation
  useEffect(() => {
    // Create and append stars
    const createStars = () => {
      const container = document.createElement('div');
      container.className = 'stars-container';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.overflow = 'hidden';
      container.style.zIndex = '-1';
      
      document.body.appendChild(container);
    };

    createStars();

    return () => {
      const container = document.querySelector('.stars-container');
      if (container) {
        container.remove();
      }
    };
  }, []);
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20, 
          duration: 0.3 
        }}
        className="flex-1 min-h-screen w-full"
      >
        <Suspense fallback={<PageLoader message="جاري تحميل الصفحة..." />}>
          <Routes location={location}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Index />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:productId" element={<ProductPage />} />
              <Route path="/factory" element={<FactoryPage />} />
              <Route path="/articles/:slug" element={<ArticleDetailPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="/auth" element={<AuthPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Effect to handle responsive sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      // Close sidebar on small screens only
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };
    
    // Run on mount
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner 
                position="top-right" 
                closeButton 
                richColors
                expand
                toastOptions={{
                  style: {
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    direction: 'rtl',
                  }
                }}
              />
              <BrowserRouter>
                <div className="flex flex-col min-h-screen">
                  <AnimatedRoutes />
                  <WhatsAppButton phoneNumber="00201211668511" />
                  <FloatingCartButton />
                </div>
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
