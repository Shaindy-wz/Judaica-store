import { Outlet, useLocation } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import PageLoader from '../ui/PageLoader';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from '../ui/WhatsAppButton';
import AccessibilityWidget from './AccessibilityWidget';
import CookieConsentBanner from './CookieConsentBanner';
import CartDrawer from '../cart/CartDrawer';
import { useCart } from '../../context/CartContext';
import SearchOverlay from '../ui/SearchOverlay';

export default function Layout() {
  const { pathname } = useLocation();
  const { closeDrawer } = useCart();

  // A new page should never open underneath the cart drawer.
  useEffect(() => {
    window.scrollTo(0, 0);
    closeDrawer();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps -- closeDrawer is recreated every render

  return (
    <>
      <Header />
      <main>
        {/* Keeps the header and footer on screen while a lazy page loads. */}
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <WhatsAppButton />
      <AccessibilityWidget />
      <CartDrawer />
      <SearchOverlay />
      <CookieConsentBanner />
    </>
  );
}
