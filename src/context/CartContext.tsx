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
  updateQuantity: (name: string, quantity: number) => void;
  removeFromCart: (name: string) => void;
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

  // Sync cart to backend on unmount
  useEffect(() => {
    const syncOnUnload = async () => {
      try {
        await cartAPI.sync(cart);
      } catch (error) {
        console.error("Failed to sync cart:", error);
      }
    };

    window.addEventListener("beforeunload", syncOnUnload);
    return () => {
      window.removeEventListener("beforeunload", syncOnUnload);
      syncOnUnload();
    };
  }, [cart]);

  const syncCart = async () => {
    try {
      await cartAPI.sync(cart);
    } catch (error) {
      console.error("Failed to sync cart:", error);
    }
  };

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCart(prev => {
      const existing = prev.find(i => i.name === item.name);
      if (existing) {
        return prev.map(i => i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (name: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(name);
      return;
    }
    setCart(prev =>
      prev.map(i => i.name === name ? { ...i, quantity } : i)
    );
  };

  const removeFromCart = (name: string) => {
    setCart(prev => prev.filter(i => i.name !== name));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, syncCart }}>
      {children}
    </CartContext.Provider>
  );
};
