import { useState, useEffect } from "react";
import { productsAPI } from "@/lib/api";

export interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  weight?: string;
  badge?: string;
  category?: string;
  description?: string;
}

// Dummy products as fallback
const dummyProducts: Product[] = [
  { id: 1, name: "Garadu Masala", image: "/assets/product-1.jpg", price: 120, originalPrice: 150, badge: "Best Seller", weight: "100g" },
  { id: 2, name: "Kitchen King Masala", image: "/assets/product-2.jpg", price: 135, originalPrice: 170, badge: "New", weight: "100g" },
  { id: 3, name: "Pav Bhaji Masala", image: "/assets/product-3.jpg", price: 125, originalPrice: 155, weight: "100g" },
  { id: 4, name: "Sambhar Masala", image: "/assets/product-4.jpg", price: 130, originalPrice: 160, weight: "100g" },
  { id: 5, name: "Tea Masala", image: "/assets/product-5.jpg", price: 95, originalPrice: 120, badge: "Popular", weight: "50g" },
  { id: 6, name: "Chana Masala", image: "/assets/product-1.jpg", price: 115, originalPrice: 145, weight: "100g" },
  { id: 7, name: "Garam Masala", image: "/assets/product-2.jpg", price: 140, originalPrice: 175, weight: "100g" },
  { id: 8, name: "Biryani Masala", image: "/assets/product-3.jpg", price: 150, originalPrice: 185, weight: "100g" },
];

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>(dummyProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productsAPI.getAll();
        if (data && Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products");
        // Keep dummy data on error
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};
