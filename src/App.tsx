import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { MainLayout } from './components/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/Index';
import ProductsPage from './pages/ProductsPage';
import BestDealsPage from './pages/BestDealsPage';
import ProductDetailsPage from './pages/ProductPage';
import LoginPage from './pages/AuthPage';
import RegisterPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import FactoryPage from './pages/FactoryPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailsPage from './pages/ArticleDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminProductsPage from './pages/admin/ProductsPage';
import AdminOrdersPage from './pages/admin/OrdersPage';
import AdminUsersPage from './pages/admin/CustomersPage';
import AdminSettingsPage from './pages/admin/SettingsPage';
import AdminCommentsPage from './pages/admin/CommentsPage';
import AdminArticlesPage from './pages/admin/ArticlesPage';
import { ThemeProvider } from "@/context/ThemeContext"
import { SmoothPageTransition } from "@/components/performance/SmoothPageTransition";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"
import NotificationsPage from './pages/admin/NotificationsPage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';
import FavoritesPage from './pages/FavoritesPage';
import AdminCategoriesPage from './pages/admin/CategoriesPage';
import AdminAppearancePage from './pages/admin/AppearancePage';
import AdminBackupsPage from './pages/admin/BackupsPage';
import AdminBannersPage from './pages/admin/BannersPage';
import AdminShippingPage from './pages/admin/ShippingPage';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ThemeProvider>
            <QueryClientProvider client={queryClient}>
              <div className="min-h-screen bg-background font-sans antialiased">
                <Routes>
                  <Route path="/" element={<MainLayout><SmoothPageTransition><HomePage /></SmoothPageTransition></MainLayout>} />
                  <Route path="/products" element={<MainLayout><ProductsPage /></MainLayout>} />
                  <Route path="/products/:id" element={<MainLayout><SmoothPageTransition><ProductDetailsPage /></SmoothPageTransition></MainLayout>} />
                  <Route path="/articles" element={<MainLayout><SmoothPageTransition><ArticlesPage /></SmoothPageTransition></MainLayout>} />
                  <Route path="/articles/:slug" element={<MainLayout><SmoothPageTransition><ArticleDetailsPage /></SmoothPageTransition></MainLayout>} />
                  <Route path="/factory" element={<MainLayout><SmoothPageTransition><FactoryPage /></SmoothPageTransition></MainLayout>} />
                  <Route path="/about" element={<MainLayout><SmoothPageTransition><AboutPage /></SmoothPageTransition></MainLayout>} />
                  <Route path="/contact" element={<MainLayout><SmoothPageTransition><ContactPage /></SmoothPageTransition></MainLayout>} />
                  <Route path="/auth" element={<SmoothPageTransition><LoginPage /></SmoothPageTransition>} />
                  <Route path="/register" element={<SmoothPageTransition><RegisterPage /></SmoothPageTransition>} />
                  <Route path="/profile" element={<MainLayout><SmoothPageTransition><ProfilePage /></SmoothPageTransition></MainLayout>} />
                  <Route path="/cart" element={<MainLayout><SmoothPageTransition><CartPage /></SmoothPageTransition></MainLayout>} />
                  <Route path="/checkout" element={<MainLayout><SmoothPageTransition><CheckoutPage /></SmoothPageTransition></MainLayout>} />
                  <Route path="/orders" element={<MainLayout><SmoothPageTransition><OrdersPage /></SmoothPageTransition></MainLayout>} />
                  <Route path="/favorites" element={<MainLayout><SmoothPageTransition><FavoritesPage /></SmoothPageTransition></MainLayout>} />
                  <Route path="/best-deals" element={<MainLayout><SmoothPageTransition><BestDealsPage /></SmoothPageTransition></MainLayout>} />

                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="comments" element={<AdminCommentsPage />} />
                    <Route path="articles" element={<AdminArticlesPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="categories" element={<AdminCategoriesPage />} />
                    <Route path="appearance" element={<AdminAppearancePage />} />
                    <Route path="backups" element={<AdminBackupsPage />} />
                    <Route path="banners" element={<AdminBannersPage />} />
                    <Route path="shipping" element={<AdminShippingPage />} />
                  </Route>
                  
                  {/* Add notification settings route */}
                  <Route 
                    path="/settings/notifications" 
                    element={
                      <MainLayout>
                        <SmoothPageTransition>
                          <NotificationSettingsPage />
                        </SmoothPageTransition>
                      </MainLayout>
                    } 
                  />
                  
                  {/* Redirect any unmatched route to home */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                <Toaster />
              </div>
            </QueryClientProvider>
          </ThemeProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
