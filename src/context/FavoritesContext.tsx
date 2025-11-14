import React, { createContext, useContext, useState, useEffect } from "react";
import { favoritesAPI } from "@/lib/api";

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
  syncFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be within FavoritesProvider");
  return context;
};

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // Fetch favorites from backend on mount
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await favoritesAPI.get();
        if (data && Array.isArray(data)) {
          setFavorites(data);
        }
      } catch (error) {
        console.error("Failed to fetch favorites:", error);
      }
    };

    fetchFavorites();
  }, []);

  // Sync favorites to backend on unmount
  useEffect(() => {
    const syncOnUnload = () => {
      const favoriteIds = favorites.map(f => f.id);
      localStorage.setItem("favorites", JSON.stringify(favoriteIds));
    };

    window.addEventListener("beforeunload", syncOnUnload);
    return () => {
      window.removeEventListener("beforeunload", syncOnUnload);
      syncOnUnload();
    };
  }, [favorites]);

  const syncFavorites = async () => {
    const favoriteIds = favorites.map(f => f.id);
    localStorage.setItem("favorites", JSON.stringify(favoriteIds));
  };

  const addToFavorites = async (item: FavoriteItem) => {
    setFavorites(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev;
      return [...prev, item];
    });
    
    try {
      await favoritesAPI.add(item.id);
    } catch (error) {
      console.error("Failed to add to favorites:", error);
    }
  };

  const removeFromFavorites = async (id: string) => {
    setFavorites(prev => prev.filter(i => i.id !== id));
    
    try {
      await favoritesAPI.remove(id);
    } catch (error) {
      console.error("Failed to remove from favorites:", error);
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
