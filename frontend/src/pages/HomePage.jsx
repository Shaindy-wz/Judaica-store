import HeroBanner from '../components/home/HeroBanner';
import QuickCategoryStrip from '../components/home/QuickCategoryStrip';
import PromoStrip from '../components/home/PromoStrip';
import CategoryGrid from '../components/home/CategoryGrid';
import NewArrivalsStrip from '../components/home/NewArrivalsStrip';
import FeaturedProducts from '../components/home/FeaturedProducts';

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <QuickCategoryStrip />
      <PromoStrip />
      <CategoryGrid />
      <NewArrivalsStrip />
      <FeaturedProducts />
    </>
  );
}
