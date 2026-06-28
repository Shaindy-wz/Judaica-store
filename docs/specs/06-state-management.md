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

> **Security decision (implemented):** JWT is stored in an **HTTP-Only cookie** set by the server — never in `localStorage` or accessible to JavaScript. This prevents XSS token theft. The frontend never reads the token directly; it calls `GET /api/auth/me` on mount to restore the session.

```jsx
// context/AuthContext.jsx
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, firstName, lastName, email, role }
  const [loading, setLoading] = useState(true);

  // On mount: validate the HTTP-Only cookie via GET /api/auth/me
  // Server reads the cookie; if valid → returns user object; if not → 401 → setUser(null)
  useEffect(() => {
    authService.me()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    // POST /api/auth/login → server sets HTTP-Only cookie → response returns { user }
    const data = await authService.login(email, password);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    // POST /api/auth/logout → server clears the cookie
    await authService.logout();
    setUser(null);
  };

  const register = async (formData) => {
    // POST /api/auth/register → server sets HTTP-Only cookie → auto-login
    const data = await authService.register(formData);
    setUser(data.user);
    return data.user;
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
- **Token is HTTP-Only cookie only.** Do not store the JWT in `localStorage`, `sessionStorage`, or any JS-accessible location.
- `user` object is populated from `GET /api/auth/me` (which reads the cookie server-side) — not decoded from the token in JS.
- `user.role` is used by the frontend only to show/hide UI elements (e.g., admin nav links).
- **Never trust `user.role` for security decisions.** The backend `adminOnly` middleware is the authoritative gate for all admin operations.
- The `loading` flag prevents the app from rendering protected routes before the session has been verified.
- All API requests send `credentials: 'include'` (set in `services/api.js`) so cookies are forwarded.
- Admin login uses a different endpoint (`POST /api/auth/admin-login`) and does not share the customer login form.
- `POST /api/auth/logout` clears the cookie server-side — never just `setUser(null)` alone.

### Backend cookie configuration
```js
res.cookie('token', jwt, {
  httpOnly: true,           // not accessible to JS
  sameSite: 'strict',       // CSRF protection
  secure: NODE_ENV === 'production', // HTTPS only in prod
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
});
```

### CORS requirement
The backend must configure CORS with `credentials: true` and an explicit `origin` (not `*`) so that cookies are accepted cross-origin during local development:
```js
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
```

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
