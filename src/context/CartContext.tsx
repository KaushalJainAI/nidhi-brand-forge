import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartAPI } from "@/lib/api";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface CartItem {
  id: string;
  itemType: "product" | "combo";
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
  addToCart: (item: Omit<CartItem, "quantity">) => Promise<void>;
  updateQuantity: (id: string, quantity: number, itemType: "product" | "combo") => Promise<void>;
  removeFromCart: (id: string, itemType: "product" | "combo") => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCartFromBackend: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be within CartProvider");
  return context;
};

const CART_STORAGE_KEY = "shopping_cart";

// Helper function to create unique cart key
const getCartKey = (id: string, itemType: "product" | "combo") => `${itemType}-${id}`;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isLoading, setIsLoading] = useState(false);

  // Save to localStorage on every change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  // Clear cart when user logs out
  useEffect(() => {
    if (!isLoggedIn) {
      setCart([]);
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [isLoggedIn]);

  // Fetch cart from backend when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      fetchCartFromBackend();
    }
  }, [isLoggedIn]);

  // Helper to map backend response to frontend format
  const mapBackendToFrontend = useCallback((items: any[]): CartItem[] => {
    return items.map((item: any) => ({
      id: String(item.id),
      itemType: (item.item_type || "product") as "product" | "combo",
      name: item.name,
      image: item.image,
      price: item.price,
      originalPrice: item.originalPrice,
      quantity: item.quantity,
      badge: item.badge,
    }));
  }, []);

  const fetchCartFromBackend = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      console.log('Fetching cart from backend...');
      
      const response = await cartAPI.get();
      
      console.log('Backend cart response:', response);
      
      if (response.success && response.items && Array.isArray(response.items)) {
        const backendCart = mapBackendToFrontend(response.items);
        
        setCart(backendCart);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(backendCart));
        
        console.log('Cart loaded from backend:', backendCart);
      }
    } catch (error) {
      console.error("Failed to fetch cart from backend:", error);
      toast.error("Failed to load cart");
    }
  }, [isLoggedIn, mapBackendToFrontend]);

  const addToCart = async (item: Omit<CartItem, "quantity">) => {
    if (!isLoggedIn) {
      toast.error("Please log in to add items to cart");
      return;
    }

    setIsLoading(true);
    try {
      console.log('Adding item to cart:', item);
      
      // Call backend first
      const response = await cartAPI.addItem({ 
        product_id: item.id, 
        item_type: item.itemType,
        quantity: 1 
      });

      console.log('Add item response:', response);

      if (response.success && response.items) {
        // Update state from backend response
        const backendCart = mapBackendToFrontend(response.items);
        
        setCart(backendCart);
        toast.success("Item added to cart");
      } else {
        toast.error(response.error || "Failed to add item");
      }
    } catch (error: any) {
      console.error("Failed to add item:", error);
      toast.error(error?.response?.data?.error || "Failed to add item to cart");
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (id: string, quantity: number, itemType: "product" | "combo") => {
    if (!isLoggedIn) {
      toast.error("Please log in to update cart");
      return;
    }

    if (quantity <= 0) {
      await removeFromCart(id, itemType);
      return;
    }

    // Optimistic update
    const cartKey = getCartKey(id, itemType);
    const previousCart = [...cart];
    setCart(prev =>
      prev.map(i => 
        getCartKey(i.id, i.itemType) === cartKey 
          ? { ...i, quantity } 
          : i
      )
    );

    setIsLoading(true);
    try {
      console.log('Updating quantity:', { id, quantity, itemType });
      
      const response = await cartAPI.updateItem({ 
        product_id: id, 
        item_type: itemType,
        quantity 
      });

      console.log('Update quantity response:', response);

      if (response.success && response.items) {
        // Sync with backend response
        const backendCart = mapBackendToFrontend(response.items);
        setCart(backendCart);
      } else {
        // Revert on error
        setCart(previousCart);
        toast.error(response.error || "Failed to update quantity");
      }
    } catch (error: any) {
      console.error("Failed to update quantity:", error);
      // Revert on error
      setCart(previousCart);
      toast.error(error?.response?.data?.error || "Failed to update quantity");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (id: string, itemType: "product" | "combo") => {
    if (!isLoggedIn) {
      toast.error("Please log in to remove items");
      return;
    }

    // Optimistic update
    const cartKey = getCartKey(id, itemType);
    const previousCart = [...cart];
    setCart(prev => prev.filter(i => getCartKey(i.id, i.itemType) !== cartKey));

    setIsLoading(true);
    try {
      console.log('Removing item:', { id, itemType });
      
      // Send composite key to backend
      const response = await cartAPI.removeItem(`${itemType}-${id}`);

      console.log('Remove item response:', response);

      if (response.success && response.items) {
        // Sync with backend response
        const backendCart = mapBackendToFrontend(response.items);
        setCart(backendCart);
      } else if (!response.success) {
        // Revert on error
        setCart(previousCart);
        toast.error(response.error || "Failed to remove item");
      }
    } catch (error: any) {
      console.error("Failed to remove item:", error);
      // Revert on error
      setCart(previousCart);
      toast.error(error?.response?.data?.error || "Failed to remove item");
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isLoggedIn) {
      toast.error("Please log in to clear cart");
      return;
    }

    // Optimistic update
    const previousCart = [...cart];
    setCart([]);

    setIsLoading(true);
    try {
      console.log('Clearing cart...');
      
      const response = await cartAPI.clear();

      console.log('Clear cart response:', response);

      if (response.success) {
        localStorage.removeItem(CART_STORAGE_KEY);
      } else {
        // Revert on error
        setCart(previousCart);
        toast.error(response.error || "Failed to clear cart");
      }
    } catch (error: any) {
      console.error("Failed to clear cart:", error);
      // Revert on error
      setCart(previousCart);
      toast.error(error?.response?.data?.error || "Failed to clear cart");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        setCart, 
        addToCart, 
        updateQuantity, 
        removeFromCart, 
        clearCart, 
        fetchCartFromBackend,
        isLoading 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
