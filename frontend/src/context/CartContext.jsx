import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

function calculateDiscount(subtotal, coupon) {
  if (!coupon) return 0;
  if (coupon.type === 'percentage') return subtotal * (coupon.value / 100);
  return Math.min(coupon.value, subtotal);
}

function lineKey(id, variantId) {
  return variantId ? `${id}:${variantId}` : id;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const addToCart = (product, qty = 1, variantId = null) => {
    setItems((prev) => {
      const key = lineKey(product.id, variantId);
      const existing = prev.find((item) => lineKey(item.id, item.variantId) === key);
      if (existing) {
        return prev.map((item) =>
          lineKey(item.id, item.variantId) === key
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { ...product, variantId, quantity: qty }];
    });
  };

  const removeFromCart = (id, variantId = null) => {
    const key = lineKey(id, variantId);
    setItems((prev) => prev.filter((item) => lineKey(item.id, item.variantId) !== key));
  };

  const updateQuantity = (id, qty, variantId = null) => {
    const key = lineKey(id, variantId);
    setItems((prev) =>
      qty <= 0
        ? prev.filter((item) => lineKey(item.id, item.variantId) !== key)
        : prev.map((item) =>
            lineKey(item.id, item.variantId) === key ? { ...item, quantity: qty } : item
          )
    );
  };

  const applyCoupon = async (code) => {
    const couponService = await import('../services/couponService');
    const result = await couponService.default.validate(code, subtotal);
    setCoupon(result);
    return result;
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  const removeCoupon = () => setCoupon(null);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = calculateDiscount(subtotal, coupon);
  const total = subtotal - discount;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        applyCoupon,
        coupon,
        removeCoupon,
        clearCart,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        subtotal,
        discount,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
