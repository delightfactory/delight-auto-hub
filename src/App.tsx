import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, lazy, useEffect, useState } from "react";
import MainLayout from "./components/MainLayout";
import PageLoader from "./components/PageLoader";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import WhatsAppButton from "./components/WhatsAppButton";
import FloatingCartButton from "./components/FloatingCartButton";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const FactoryPage = lazy(() => import("./pages/FactoryPage"));
const ArticlesPage = lazy(() => import("./pages/ArticlesPage"));
const ArticleDetailPage = lazy(() => import("./pages/ArticleDetailPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

// Admin Pages
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const DashboardPage = lazy(() => import("./pages/admin/DashboardPage"));
const AdminProductsPage = lazy(() => import("./pages/admin/ProductsPage"));
const AdminOrdersPage = lazy(() => import("./pages/admin/OrdersPage"));
const AdminCustomersPage = lazy(() => import("./pages/admin/CustomersPage"));
const AdminArticlesPage = lazy(() => import("./pages/admin/ArticlesPage"));
const AdminCategoriesPage = lazy(() => import("./pages/admin/CategoriesPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/SettingsPage"));
const AppearancePage = lazy(() => import("./pages/admin/AppearancePage"));
const CommentsPage = lazy(() => import("./pages/admin/CommentsPage"));
const BackupsPage = lazy(() => import("./pages/admin/BackupsPage"));
const NotificationsPage = lazy(() => import("./pages/admin/NotificationsPage"));

// Create custom QueryClient with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      networkMode: 'always', // Ensure queries run even if there are network issues
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

// Animation wrapper component for route transitions with improved performance
const AnimatedRoutes = () => {
  const location = useLocation();
  
  // Scroll to top on route change with smooth behavior
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [location.pathname]);
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
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
              <Route path="/cart" element={<CartPage />} />
              <Route path="/factory" element={<FactoryPage />} />
              <Route path="/articles" element={<ArticlesPage />} />
              <Route path="/articles/:slug" element={<ArticleDetailPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="/auth" element={<AuthPage />} />
            
            {/* لوحة التحكم للمسؤولين */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="articles" element={<AdminArticlesPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="appearance" element={<AppearancePage />} />
              <Route path="comments" element={<CommentsPage />} />
              <Route path="backups" element={<BackupsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="help" element={<BackupsPage />} />
            </Route>
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => {
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
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#333',
                    direction: 'rtl',
                  },
                  className: "dark:bg-gray-800 dark:text-white dark:border-gray-700",
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
