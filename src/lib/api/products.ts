import { API_BASE_URL, authFetch, publicFetch } from "./config";

export interface Product {
  id: number;
  name: string;
  slug: string;
  category: number;
  category_name?: string;
  description: string;
  spice_form: string;
  price: number;
  discount_price?: number;
  final_price: number;
  discount_percentage: number;
  stock: number;
  weight: string;
  origin_country?: string;
  organic: boolean;
  shelf_life?: string;
  ingredients?: string;
  image: string;
  images?: { id: number; image: string; alt_text?: string }[];
  is_active: boolean;
  is_featured: boolean;
  badge?: string;
  average_rating: number;
  reviews_count: number;
  in_stock: boolean;
}

export interface ProductSection {
  id: number;
  name: string;
  slug: string;
  section_type: string;
  description?: string;
  icon?: string;
  display_order: number;
  max_products: number;
  is_active: boolean;
  products: Product[];
  combos: any[];
}

export const productsAPI = {
  getAll: (params?: { category?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.search) queryParams.append("search", params.search);
    const query = queryParams.toString();
    return publicFetch(`${API_BASE_URL}/products/${query ? `?${query}` : ""}`);
  },

  getById: (id: string) => publicFetch(`${API_BASE_URL}/products/${id}/`),

  getBySlug: (slug: string) => publicFetch(`${API_BASE_URL}/products/?slug=${slug}`),

  getByCategory: (categoryId: string) =>
    publicFetch(`${API_BASE_URL}/products/?category=${categoryId}`),

  getFeatured: () => publicFetch(`${API_BASE_URL}/products/?is_featured=true`),

  getSections: () => publicFetch(`${API_BASE_URL}/products/sections/`),

  getSpiceForms: () => publicFetch(`${API_BASE_URL}/spice-forms/`),
};

