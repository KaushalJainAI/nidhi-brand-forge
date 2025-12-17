import React, { createContext, useContext, useState, useEffect } from "react";
import { favoritesAPI } from "@/lib/api";
import { useAuth } from "./AuthContext";

interface FavoriteItem {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  weight?: string;
  badge?: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addToFavorites: (item: FavoriteItem) => void;
  removeFromFavorites: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: FavoriteItem) => void;
  syncFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be within FavoritesProvider");
  return context;
};

const FAVORITES_STORAGE_KEY = "favorites_full";

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  // Save to localStorage on every change
  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // Fetch favorites from backend when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      fetchFavoritesFromBackend();
    }
  }, [isLoggedIn]);

  // Sync favorites to backend when user leaves
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isLoggedIn && favorites.length > 0) {
        navigator.sendBeacon(
          `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/favorites/sync/`,
          JSON.stringify({ items: favorites })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isLoggedIn, favorites]);

  const fetchFavoritesFromBackend = async () => {
    try {
      const response = await favoritesAPI.get();
      if (Array.isArray(response)) {
        const backendFavorites: FavoriteItem[] = response.map((item: any) => ({
          id: String(item.product_id || item.id),
          name: item.name || item.product_name,
          image: item.image || item.product_image,
          price: item.price,
          originalPrice: item.original_price,
          weight: item.weight,
          badge: item.badge,
        }));
        
        // Merge with local favorites
        const localFavorites = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || "[]");
        const mergedFavorites = [...backendFavorites];
        
        localFavorites.forEach((localItem: FavoriteItem) => {
          const existsInBackend = mergedFavorites.find(item => item.id === localItem.id);
          if (!existsInBackend) {
            mergedFavorites.push(localItem);
          }
        });
        
        setFavorites(mergedFavorites);
      }
    } catch (error) {
      console.error("Failed to fetch favorites from backend:", error);
    }
  };

  const syncFavorites = () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    if (isLoggedIn) {
      favoritesAPI.sync(favorites).catch(console.error);
    }
  };

  const addToFavorites = (item: FavoriteItem) => {
    setFavorites(prev => {
      const exists = prev.some(i => i.id === item.id);
      if (exists) return prev;
      return [...prev, item];
    });
    
    if (isLoggedIn) {
      favoritesAPI.add(item.id).catch(console.error);
    }
  };

  const removeFromFavorites = (id: string) => {
    setFavorites(prev => prev.filter(i => i.id !== id));
    
    if (isLoggedIn) {
      favoritesAPI.remove(id).catch(console.error);
    }
  };

  const isFavorite = (id: string) => {
    return favorites.some(i => i.id === id);
  };

  const toggleFavorite = (item: FavoriteItem) => {
    if (isFavorite(item.id)) {
      removeFromFavorites(item.id);
    } else {
      addToFavorites(item);
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addToFavorites, removeFromFavorites, isFavorite, toggleFavorite, syncFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};
