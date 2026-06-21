import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import productService from '../services/productService';
import Breadcrumb from '../components/ui/Breadcrumb';
import ProductGallery from '../components/product/ProductGallery';
import ProductDetails from '../components/product/ProductDetails';
import styles from './ProductPage.module.css';

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    productService
      .getBySlug(slug)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="container">טוען מוצר…</div>;
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
    </div>
  );
}
