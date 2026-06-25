import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedAdminRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div className="admin-loading">טוען...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/account" replace />;

  return <Outlet />;
}
