import { API_BASE_URL, publicFetch } from "./config";

export interface ComboItem {
  product: number;
  product_name: string;
  product_slug: string;
  product_image: string;
  product_price: number;
  quantity: number;
}

export interface Combo {
  id: number;
  name: string;
  slug: string;
  description?: string;
  title?: string;
  subtitle?: string;
  items: ComboItem[];
  price: number;
  discount_price?: number;
  final_price: number;
  discount_percentage: number;
  image?: string;
  is_active: boolean;
  is_featured: boolean;
  badge?: string;
  total_original_price: number;
  total_weight: string;
  display_title: string;
}

export const combosAPI = {
  getAll: () => publicFetch(`${API_BASE_URL}/combos/`),
  getById: (id: number | string) => publicFetch(`${API_BASE_URL}/combos/${id}/`),
  getFeatured: () => publicFetch(`${API_BASE_URL}/combos/?is_featured=true`),
};
