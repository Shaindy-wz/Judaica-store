import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import PageLoader from './components/ui/PageLoader';

// Customer layout & the pages most visits land on — part of the main bundle.
// Everything else (the admin panel, checkout, content pages) is split into its
// own chunk and downloaded only when opened, so the storefront loads faster.
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import SearchResultsPage from './pages/SearchResultsPage';
import CartPage from './pages/CartPage';
import ProtectedAdminRoute from './admin/components/ProtectedAdminRoute';

const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const ShippingReturnsPage = lazy(() => import('./pages/ShippingReturnsPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const AccessibilityStatementPage = lazy(() => import('./pages/AccessibilityStatementPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Admin
const AdminLayout = lazy(() => import('./admin/components/AdminLayout'));
const AdminLoginPage = lazy(() => import('./admin/pages/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./admin/pages/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('./admin/pages/AdminProductsPage'));
const AdminProductFormPage = lazy(() => import('./admin/pages/AdminProductFormPage'));
const AdminOrdersPage = lazy(() => import('./admin/pages/AdminOrdersPage'));
const AdminOrderDetailPage = lazy(() => import('./admin/pages/AdminOrderDetailPage'));
const AdminCategoriesPage = lazy(() => import('./admin/pages/AdminCategoriesPage'));
const AdminCouponsPage = lazy(() => import('./admin/pages/AdminCouponsPage'));
const AdminReviewsPage = lazy(() => import('./admin/pages/AdminReviewsPage'));
const AdminCustomersPage = lazy(() => import('./admin/pages/AdminCustomersPage'));
const AdminCustomerOrdersPage = lazy(() => import('./admin/pages/AdminCustomerOrdersPage'));

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SearchProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Admin login — separate from customer /account/login */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Admin panel — protected, separate layout */}
              <Route element={<ProtectedAdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/admin/products" element={<AdminProductsPage />} />
                  <Route path="/admin/products/new" element={<AdminProductFormPage />} />
                  <Route path="/admin/products/:id/edit" element={<AdminProductFormPage />} />
                  <Route path="/admin/orders" element={<AdminOrdersPage />} />
                  <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
                  <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                  <Route path="/admin/coupons" element={<AdminCouponsPage />} />
                  <Route path="/admin/reviews" element={<AdminReviewsPage />} />
                  <Route path="/admin/customers" element={<AdminCustomersPage />} />
                  <Route path="/admin/customers/:id" element={<AdminCustomerOrdersPage />} />
                </Route>
              </Route>

              {/* Customer site */}
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="shop" element={<ShopPage />} />
                <Route path="category/:slug" element={<CategoryPage />} />
                <Route path="product/:slug" element={<ProductPage />} />
                <Route path="search" element={<SearchResultsPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/:id" element={<OrderDetailPage />} />
                <Route path="account" element={<AccountPage />} />

                {/* Content & legal pages */}
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="faq" element={<FaqPage />} />
                <Route path="shipping-returns" element={<ShippingReturnsPage />} />
                <Route path="terms" element={<TermsPage />} />
                <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="accessibility-statement" element={<AccessibilityStatementPage />} />

                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
        </SearchProvider>
      </CartProvider>
    </AuthProvider>
  );
}
