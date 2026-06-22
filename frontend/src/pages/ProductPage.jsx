import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import productService from '../services/productService';
import { useProductReviews } from '../hooks/useReviews';
import Breadcrumb from '../components/ui/Breadcrumb';
import ProductGallery from '../components/product/ProductGallery';
import ProductDetails from '../components/product/ProductDetails';
import ReviewSummary from '../components/reviews/ReviewSummary';
import ReviewList from '../components/reviews/ReviewList';
import ReviewForm from '../components/reviews/ReviewForm';
import styles from './ProductPage.module.css';

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { reviews, refresh: refreshReviews } = useProductReviews(product?._id);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setProduct(null);
    productService
      .getBySlug(slug)
      .then(setProduct)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="container">טוען מוצר…</div>;
  if (error) {
    return (
      <div className={`container ${styles.error}`}>
        אירעה שגיאה בטעינת המוצר. נסו לרענן את העמוד.
      </div>
    );
  }
  if (!product) return <div className="container">המוצר לא נמצא.</div>;

  return (
    <div className="container">
      <Breadcrumb
        items={[
          { label: 'דף הבית', href: '/' },
          { label: 'חנות', href: '/shop' },
          { label: product.name },
        ]}
      />
      <div className={styles.layout}>
        <ProductGallery images={product.images} name={product.name} />
        <ProductDetails product={product} />
      </div>

      <section className={styles.reviewsSection}>
        <h2 className="section-title">ביקורות לקוחות</h2>
        <div className={styles.reviewsLayout}>
          <div className={styles.reviewsAside}>
            <ReviewSummary reviews={reviews} />
            <ReviewForm productId={product._id} onSubmitted={refreshReviews} />
          </div>
          <ReviewList reviews={reviews} />
        </div>
      </section>
    </div>
  );
}
