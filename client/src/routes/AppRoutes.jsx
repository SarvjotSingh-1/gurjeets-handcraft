import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import HomePage from '../pages/customer/HomePage';
import ShopPage from '../pages/customer/ShopPage';
import ProductDetailPage from '../pages/customer/ProductDetailPage';
import CustomOrderPage from '../pages/customer/CustomOrderPage';
import OurStoryPage from '../pages/customer/OurStoryPage';
import HowItsMadePage from '../pages/customer/HowItsMadePage';
import ContactPage from '../pages/customer/ContactPage';
import CartPage from '../pages/customer/CartPage';
import CheckoutPage from '../pages/customer/CheckoutPage';
import OrderConfirmationPage from '../pages/customer/OrderConfirmationPage';
import AccountPage from '../pages/customer/AccountPage';
import OrdersPage from '../pages/customer/OrdersPage';
import WishlistPage from '../pages/customer/WishlistPage';
import PolicyPage from '../pages/customer/PolicyPage';
import NotFoundPage from '../pages/customer/NotFoundPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AdminRoute from '../components/auth/AdminRoute';

export const AppRoutes = () => {
  return (
    <PageWrapper>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/custom-orders" element={<CustomOrderPage />} />
        <Route path="/our-story" element={<OurStoryPage />} />
        <Route path="/how-its-made" element={<HowItsMadePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/my-orders" element={<OrdersPage />} />

        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Customer & Admin Routes */}
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />

        {/* Policy & Information Routes */}
        <Route path="/shipping-information" element={<PolicyPage />} />
        <Route path="/returns-information" element={<PolicyPage />} />
        <Route path="/privacy-policy" element={<PolicyPage />} />
        <Route path="/terms" element={<PolicyPage />} />

        {/* 404 Not Found Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </PageWrapper>
  );
};

export default AppRoutes;
