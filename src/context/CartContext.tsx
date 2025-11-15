import React, { createContext, useContext, useState, useEffect } from "react";
import { cartAPI } from "@/lib/api";

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be within CartProvider");
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch cart from backend on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await cartAPI.get();
        if (data && Array.isArray(data)) {
          setCart(data);
        }
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      }
    };

    fetchCart();
  }, []);

  // Debounced sync to backend
  useEffect(() => {
    if (isSyncing || cart.length === 0) return;

    const timeoutId = setTimeout(async () => {
      await syncCart();
    }, 1000); // Sync 1 second after last change

    return () => clearTimeout(timeoutId);
  }, [cart]);

  // Sync cart on page unload
  useEffect(() => {
    const syncOnUnload = () => {
      const token = localStorage.getItem('access_token');
      if (token && cart.length > 0) {
        const blob = new Blob([JSON.stringify({ items: cart })], { type: 'application/json' });
        navigator.sendBeacon(`${import.meta.env.VITE_API_URL}/api/cart/sync/`, blob);
      }
    };

    window.addEventListener("beforeunload", syncOnUnload);
    return () => window.removeEventListener("beforeunload", syncOnUnload);
  }, [cart]);

  const syncCart = async () => {
    if (cart.length === 0) return;
    
    setIsSyncing(true);
    try {
      await cartAPI.sync(cart);
    } catch (error) {
      console.error("Failed to sync cart:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const addToCart = async (item: Omit<CartItem, "quantity">) => {
    // Optimistic update
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });

    // Sync with backend
    try {
      await cartAPI.addItem({ id: item.id, quantity: 1 });
    } catch (error) {
      console.error("Failed to add item:", error);
      // Revert on error
      setCart(prev => prev.filter(i => i.id !== item.id));
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    const oldCart = [...cart];
    
    // Optimistic update
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCart(prev =>
      prev.map(i => i.id === id ? { ...i, quantity } : i)
    );

    // Sync with backend
    try {
      await cartAPI.updateItem({ id, quantity });
    } catch (error) {
      console.error("Failed to update quantity:", error);
      // Revert on error
      setCart(oldCart);
    }
  };

  const removeFromCart = async (id: string) => {
    const oldCart = [...cart];
    
    // Optimistic update
    setCart(prev => prev.filter(i => i.id !== id));

    // Sync with backend
    try {
      await cartAPI.removeItem({ id });
    } catch (error) {
      console.error("Failed to remove item:", error);
      // Revert on error
      setCart(oldCart);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, syncCart }}>
      {children}
    </CartContext.Provider>
  );
};
