
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { MainLayout } from './components/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/Index';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductPage';
import LoginPage from './pages/AuthPage';
import RegisterPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import FactoryPage from './pages/FactoryPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailsPage from './pages/ArticleDetailPage';
import CheckoutPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminProductsPage from './pages/admin/ProductsPage';
import AdminOrdersPage from './pages/admin/OrdersPage';
import AdminUsersPage from './pages/admin/CustomersPage';
import AdminSettingsPage from './pages/admin/SettingsPage';
import AdminCommentsPage from './pages/admin/CommentsPage';
import AdminArticlesPage from './pages/admin/ArticlesPage';
import { ThemeProvider } from "@/context/ThemeContext"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"
import NotificationsPage from './pages/admin/NotificationsPage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';

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
                  <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
                  <Route path="/products" element={<MainLayout><ProductsPage /></MainLayout>} />
                  <Route path="/products/:id" element={<MainLayout><ProductDetailsPage /></MainLayout>} />
                  <Route path="/articles" element={<MainLayout><ArticlesPage /></MainLayout>} />
                  <Route path="/articles/:slug" element={<MainLayout><ArticleDetailsPage /></MainLayout>} />
                  <Route path="/factory" element={<MainLayout><FactoryPage /></MainLayout>} />
                  <Route path="/about" element={<MainLayout><AboutPage /></MainLayout>} />
                  <Route path="/contact" element={<MainLayout><ContactPage /></MainLayout>} />
                  <Route path="/auth" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
                  <Route path="/checkout" element={<MainLayout><CheckoutPage /></MainLayout>} />
                  <Route path="/orders" element={<MainLayout><OrdersPage /></MainLayout>} />

                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="comments" element={<AdminCommentsPage />} />
                    <Route path="articles" element={<AdminArticlesPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                  </Route>
                  
                  {/* Add notification settings route */}
                  <Route 
                    path="/settings/notifications" 
                    element={
                      <MainLayout>
                        <NotificationSettingsPage />
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
