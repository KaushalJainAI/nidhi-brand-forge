# Frontend Architecture

This document explains the design principles, component structure, and state management patterns.

---

## Design Principles

### 1. **Feature-Based Organization**
Code is organized by feature/page rather than by type:
```
src/
├── pages/          # Route-level components (one file per page)
├── components/     # Reusable UI components
├── lib/api/        # API client functions (grouped by domain)
├── contexts/       # Global state (Auth, Cart)
└── hooks/          # Custom React hooks
```

### 2. **Colocation**
Related code stays together:
- API functions in `lib/api/` mirror backend apps
- Each page is self-contained with its own state

### 3. **Composition over Inheritance**
UI built from small, composable components (Shadcn/UI pattern).

---

## Application Flow

### Page Load → Data Fetch

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Router    │────▶│    Page     │────▶│  API Call   │
│ (App.tsx)   │     │ Component   │     │ (useEffect) │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │   Render    │◀────│  setState   │
                    │     UI      │     │   (data)    │
                    └─────────────┘     └─────────────┘
```

### Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Login   │────▶│  POST    │────▶│  Store   │────▶│ Redirect │
│  Form    │     │ /login/  │     │  Token   │     │  Home    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                                        │
                              localStorage + AuthContext
```

### Cart Flow

```
Add to Cart → CartContext → localStorage → Sync with Backend
                  │
                  └─── Persists across page reloads
```

---

## State Management

### 1. **AuthContext** (Global)
Manages user authentication state:
```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email, password) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}
```

**Token Storage**: `localStorage.getItem('token')`

### 2. **CartContext** (Global)
Manages shopping cart:
```typescript
interface CartContextType {
  items: CartItem[];
  addItem: (product, quantity) => void;
  removeItem: (itemId) => void;
  updateQuantity: (itemId, quantity) => void;
  clearCart: () => void;
  total: number;
}
```

**Persistence**: localStorage + synced to backend for logged-in users

### 3. **Local State** (Per-Component)
Each page manages its own data loading:
```typescript
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchProducts().then(setProducts).finally(() => setLoading(false));
}, []);
```

---

## Key Implementation Details

### 1. API Client Structure

All API calls go through configured Axios instance:
```
lib/api/
├── config.ts       # Axios instance with baseURL, interceptors
├── products.ts     # getProducts(), getProduct(slug)
├── cart.ts         # getCart(), addToCart(), etc.
├── orders.ts       # getOrders(), createOrder()
└── auth.ts         # login(), register(), getProfile()
```

**Why separated?** Matches backend app structure, easy to find related code.

### 2. Authentication Interceptor

Token automatically added to all requests:
```typescript
// config.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3. Protected Routes

Routes requiring auth redirect to login:
```typescript
// If not authenticated, redirect to /login
if (!isAuthenticated) {
  return <Navigate to="/login" state={{ from: location }} />;
}
```

### 4. Product vs Combo Handling

Cart items can be products OR combos:
```typescript
interface CartItem {
  id: number;
  product?: Product;    // Either product
  combo?: Combo;        // OR combo
  quantity: number;
}

// Display logic
const itemName = item.product?.name || item.combo?.name;
const itemPrice = item.product?.price || item.combo?.price;
```

### 5. Optimistic Updates

Cart operations update UI immediately, then sync:
```typescript
const addToCart = (product) => {
  // 1. Update local state immediately
  setItems([...items, newItem]);
  
  // 2. Sync to backend
  api.addToCart(product.id, quantity).catch(() => {
    // Revert on failure
    setItems(items);
  });
};
```

---

## Component Patterns

### 1. Page Component Pattern
```typescript
const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProducts()
      .then(res => setProducts(res.data))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  
  return <ProductGrid products={products} />;
};
```

### 2. Form Pattern
```typescript
const [formData, setFormData] = useState({ name: '', email: '' });

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await api.submit(formData);
    toast({ title: 'Success' });
  } catch {
    toast({ title: 'Error', variant: 'destructive' });
  }
};
```

---

## Routing Structure

```
/                   → Index (Home)
/products           → Products listing
/products/:slug     → Product detail
/combos             → Offer Zone (combos)
/combos/:slug       → Combo detail
/cart               → Shopping cart
/checkout           → Checkout flow
/login              → Login
/register           → Register
/profile            → User profile (auth required)
/my-orders          → Order history (auth required)
/support/:orderId   → Chat support (auth required)
/favorites          → Saved products (auth required)
```

---

## Error Handling

### API Errors
```typescript
try {
  await apiCall();
} catch (error) {
  if (error.response?.status === 401) {
    // Token expired, logout
    logout();
  } else {
    toast({ title: 'Error', description: error.message });
  }
}
```

### 404 Handling
React Router catches unmatched routes → `NotFound` page

---

## Extending the Application

### Adding a New Page

1. Create `src/pages/NewPage.tsx`
2. Add route in `App.tsx`:
   ```tsx
   <Route path="/new-page" element={<NewPage />} />
   ```
3. Add navigation link in Header/Footer

### Adding a New API Endpoint

1. Add function in appropriate `lib/api/*.ts` file
2. Call from component with proper error handling
