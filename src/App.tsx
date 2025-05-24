import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import FactoryPage from './pages/FactoryPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailsPage from './pages/ArticleDetailsPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSettingsPage from './pages/admin/SettingsPage';
import AdminCommentsPage from './pages/admin/CommentsPage';
import AdminArticlesPage from './pages/admin/AdminArticlesPage';
import { ThemeProvider } from "@/context/ThemeContext"
import { QueryClient } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"
import NotificationsPage from './pages/admin/NotificationsPage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <QueryClient>
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

                  <Route path="/admin" element={<AdminLayout><AdminDashboardPage /></AdminLayout>} />
                  <Route path="/admin/products" element={<AdminLayout><AdminProductsPage /></AdminLayout>} />
                  <Route path="/admin/orders" element={<AdminLayout><AdminOrdersPage /></AdminLayout>} />
                  <Route path="/admin/users" element={<AdminLayout><AdminUsersPage /></AdminLayout>} />
                  <Route path="/admin/comments" element={<AdminLayout><AdminCommentsPage /></AdminLayout>} />
                  <Route path="/admin/articles" element={<AdminLayout><AdminArticlesPage /></AdminLayout>} />
                  <Route path="/admin/settings" element={<AdminLayout><AdminSettingsPage /></AdminLayout>} />
                  <Route path="/admin/notifications" element={<AdminLayout><NotificationsPage /></AdminLayout>} />
                  
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
            </QueryClient>
          </ThemeProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
