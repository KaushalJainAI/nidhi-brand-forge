import React, { createContext, useContext, useState, useEffect } from "react";
import { cartAPI } from "@/lib/api";
import { useAuth } from "./AuthContext";

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
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  syncWithBackend: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be within CartProvider");
  return context;
};

const CART_STORAGE_KEY = "shopping_cart";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save to localStorage on every change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  // Fetch cart from backend when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      fetchCartFromBackend();
    }
  }, [isLoggedIn]);

  // Sync cart to backend when user leaves
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isLoggedIn && cart.length > 0) {
        const items = cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
        }));
        // Use sendBeacon for reliable unload sync
        navigator.sendBeacon(
          `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/cart/sync/`,
          JSON.stringify({ items })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isLoggedIn, cart]);

  const fetchCartFromBackend = async () => {
    try {
      const response = await cartAPI.get();
      if (response.items && Array.isArray(response.items)) {
        const backendCart: CartItem[] = response.items.map((item: any) => ({
          id: String(item.product_id || item.id),
          name: item.name || item.product_name,
          image: item.image || item.product_image,
          price: item.price,
          originalPrice: item.original_price,
          quantity: item.quantity,
        }));
        
        // Merge with local cart (local takes precedence for quantity)
        const localCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
        const mergedCart = [...backendCart];
        
        localCart.forEach((localItem: CartItem) => {
          const existsInBackend = mergedCart.find(item => item.id === localItem.id);
          if (!existsInBackend) {
            mergedCart.push(localItem);
          }
        });
        
        setCart(mergedCart);
      }
    } catch (error) {
      console.error("Failed to fetch cart from backend:", error);
    }
  };

  const syncWithBackend = async () => {
    if (!isLoggedIn) return;
    
    try {
      const items = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
      }));
      await cartAPI.sync(items);
    } catch (error) {
      console.error("Failed to sync cart:", error);
    }
  };

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });

    // Also add to backend
    if (isLoggedIn) {
      cartAPI.addItem({ product_id: item.id, quantity: 1 }).catch(console.error);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev =>
      prev.map(i => i.id === id ? { ...i, quantity } : i)
    );

    // Update backend
    if (isLoggedIn) {
      cartAPI.updateItem({ product_id: id, quantity }).catch(console.error);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));

    // Remove from backend
    if (isLoggedIn) {
      cartAPI.removeItem(id).catch(console.error);
    }
  };

  const clearCart = () => {
    setCart([]);

    // Clear backend cart
    if (isLoggedIn) {
      cartAPI.clear().catch(console.error);
    }
  };

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, updateQuantity, removeFromCart, clearCart, syncWithBackend }}>
      {children}
    </CartContext.Provider>
  );
};
