import React, { createContext, useContext, useState, useEffect } from "react";

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

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("favorites_full");
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
    localStorage.setItem("favorites_full", JSON.stringify(favorites));
  }, [favorites]);

  const syncFavorites = () => {
    localStorage.setItem("favorites_full", JSON.stringify(favorites));
  };

  const addToFavorites = (item: FavoriteItem) => {
    setFavorites(prev => {
      const exists = prev.some(i => i.id === item.id);
      if (exists) return prev;
      return [...prev, item];
    });
  };

  const removeFromFavorites = (id: string) => {
    setFavorites(prev => prev.filter(i => i.id !== id));
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
