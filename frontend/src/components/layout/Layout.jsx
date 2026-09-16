import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from '../ui/WhatsAppButton';
import AccessibilityWidget from './AccessibilityWidget';
import CookieConsentBanner from './CookieConsentBanner';
import CartDrawer from '../cart/CartDrawer';
import SearchOverlay from '../ui/SearchOverlay';

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Header />
      <main>
        <Outlet />
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
