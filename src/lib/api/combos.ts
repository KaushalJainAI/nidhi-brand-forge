import { API_BASE_URL, publicFetch } from "./config";

export interface Combo {
  id: number;
  name: string;
  slug: string;
  description?: string;
  title?: string;
  subtitle?: string;
  products: any[];
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
  getById: (id: string) => publicFetch(`${API_BASE_URL}/combos/${id}/`),
  getFeatured: () => publicFetch(`${API_BASE_URL}/combos/?is_featured=true`),
};
