
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, lazy, useEffect } from "react";
import Index from "./pages/Index";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import ProductsPage from "./pages/ProductsPage";
import ProductPage from "./pages/ProductPage";
import FactoryPage from "./pages/FactoryPage";
import NotFound from "./pages/NotFound";
import Sidebar from "./components/Sidebar";
import { CartProvider } from "./context/CartContext";
import WhatsAppButton from "./components/WhatsAppButton";
import PageLoader from "./components/PageLoader";
import FloatingCartButton from "./components/FloatingCartButton";

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
      
      // Create golden triangle
      const triangle = document.createElement('div');
      triangle.className = 'golden-triangle';
      triangle.style.position = 'absolute';
      triangle.style.top = '50%';
      triangle.style.left = '50%';
      triangle.style.transform = 'translate(-50%, -50%)';
      container.appendChild(triangle);

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
            <Route path="/" element={<Index />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:productId" element={<ProductPage />} />
            <Route path="/factory" element={<FactoryPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          <div className="flex flex-col lg:flex-row min-h-screen">
            <Sidebar />
            <motion.main 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex-1 min-h-screen pt-16 lg:pt-0 lg:pr-72 xl:pr-80 glass-panel"
            >
              <AnimatedRoutes />
            </motion.main>
            <WhatsAppButton phoneNumber="00201211668511" />
            <FloatingCartButton />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
