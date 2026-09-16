import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';

// Customer layout & pages
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import SearchResultsPage from './pages/SearchResultsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AccountPage from './pages/AccountPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FaqPage from './pages/FaqPage';
import ShippingReturnsPage from './pages/ShippingReturnsPage';
import TermsPage from './pages/TermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import AccessibilityStatementPage from './pages/AccessibilityStatementPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin
import AdminLayout from './admin/components/AdminLayout';
import ProtectedAdminRoute from './admin/components/ProtectedAdminRoute';
import AdminLoginPage from './admin/pages/AdminLoginPage';
import AdminDashboardPage from './admin/pages/AdminDashboardPage';
import AdminProductsPage from './admin/pages/AdminProductsPage';
import AdminProductFormPage from './admin/pages/AdminProductFormPage';
import AdminOrdersPage from './admin/pages/AdminOrdersPage';
import AdminOrderDetailPage from './admin/pages/AdminOrderDetailPage';
import AdminCategoriesPage from './admin/pages/AdminCategoriesPage';
import AdminCouponsPage from './admin/pages/AdminCouponsPage';
import AdminReviewsPage from './admin/pages/AdminReviewsPage';
import AdminCustomersPage from './admin/pages/AdminCustomersPage';
import AdminCustomerOrdersPage from './admin/pages/AdminCustomerOrdersPage';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SearchProvider>
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
        </SearchProvider>
      </CartProvider>
    </AuthProvider>
  );
}
