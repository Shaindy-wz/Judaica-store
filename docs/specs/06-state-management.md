# 06 — State Management (Context API)

> **Language note:** UI copy and labels in the final website will be in **Hebrew** (RTL). Code is in English.

> All global state is managed via React Context API. Do **not** introduce Redux or Zustand unless the Context approach proves genuinely insufficient at scale. Hooks (`useCart`, `useAuth`) are the public interface for components — components never import Context directly.

---

## CartContext

**File:** `context/CartContext.jsx`

```jsx
// context/CartContext.jsx
const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState(null); // NEW

  // variantId is null for simple products, variant.id for products with options
  const addToCart = (product, qty = 1, variantId = null) => { /* ... */ };
  const removeFromCart = (id, variantId = null) => { /* ... */ };
  const updateQuantity = (id, qty, variantId = null) => { /* ... */ };

  // NEW: validates the coupon code against the API, stores result
  const applyCoupon = async (code) => { /* ... */ };

  const clearCart = () => { setItems([]); setCoupon(null); };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = coupon ? calculateDiscount(subtotal, coupon) : 0; // NEW
  const total = subtotal - discount;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      applyCoupon,   // NEW
      coupon,        // NEW
      clearCart,
      subtotal,
      discount,      // NEW
      total,
      itemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
```

### Key Rules
- Cart state is kept in memory only during the session. If persistence is needed in future, use `localStorage` — but do not implement this until requested.
- `variantId` must be included when adding a variant product to cart. Two cart items with the same `product.id` but different `variantId` are treated as separate line items.
- The `coupon` object returned from the API determines discount type (`percentage` or `fixed`) and value. `calculateDiscount` is a pure utility function in `utils/`.
- When `clearCart` is called (after successful order placement), both `items` and `coupon` are reset.

---

## AuthContext

**File:** `context/AuthContext.jsx`

```jsx
// context/AuthContext.jsx
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // user.role: 'customer' | 'admin' — NEW
  const [loading, setLoading] = useState(true);

  // On mount: read token from localStorage, validate with GET /api/auth/me
  // If token is invalid/expired → setUser(null)

  const login = async (email, password) => {
    // POST /api/auth/login → receive JWT → store in localStorage → setUser
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const register = async (data) => {
    // POST /api/auth/register → auto-login on success
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### Key Rules
- `user.role` is included in the JWT payload. The frontend uses this to show/hide admin nav links.
- **Never trust `user.role` for security decisions.** The backend `adminOnly` middleware is the authoritative gate for all admin operations.
- The `loading` flag prevents the app from rendering protected routes before the token has been verified.
- Admin login uses a different endpoint (`POST /api/auth/admin-login`) and navigates to `/admin` — it does not share the customer login form.

---

## SearchContext (NEW)

**File:** `context/SearchContext.jsx`

```jsx
// context/SearchContext.jsx
export function SearchProvider({ children }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const search = useDebouncedCallback(async (q) => {
    if (q.length < 2) { setResults([]); return; }
    // searchService.search normalises the Hebrew query before sending to the API
    const data = await searchService.search(q);
    setResults(data);
  }, 300);  // 300ms debounce — do not fire on every keystroke

  return (
    <SearchContext.Provider value={{ query, setQuery, results, isOpen, setIsOpen, search }}>
      {children}
    </SearchContext.Provider>
  );
}

export const useSearch = () => useContext(SearchContext);
```

### Key Rules
- Search fires only after **at least 2 characters** are entered (guard in the debounce callback).
- The 300ms debounce prevents excessive API calls while the user is still typing.
- `searchService.search(q)` calls `normalizeHebrew(q)` before constructing the API request URL — this ensures Hebrew niqqud/dagesh differences are normalised on the client side.
- `isOpen` controls visibility of the `SearchOverlay` component. It is set to `true` when the search icon in the Header is clicked.
