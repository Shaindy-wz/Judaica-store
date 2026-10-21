import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import PageLoader from '../../components/ui/PageLoader';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  return (
    <div className={styles.layout}>
      <AdminSidebar />
      <main className={styles.main}>
        {/* Keeps the sidebar on screen while a lazy admin page loads. */}
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
