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
import CartPage from './pages/CartPage';
import AccountPage from './pages/AccountPage';
import NotFoundPage from './pages/NotFoundPage';
import SearchResultsPage from './pages/SearchResultsPage';

// Admin
import AdminLayout from './admin/components/AdminLayout';
import ProtectedAdminRoute from './admin/components/ProtectedAdminRoute';
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
              <Route path="account" element={<AccountPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </SearchProvider>
      </CartProvider>
    </AuthProvider>
  );
}
