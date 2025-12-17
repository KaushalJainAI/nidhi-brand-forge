import { API_BASE_URL, publicFetch } from "./config";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  is_active: boolean;
}

export const categoriesAPI = {
  getAll: () => publicFetch(`${API_BASE_URL}/categories/`),
  getById: (id: string) => publicFetch(`${API_BASE_URL}/categories/${id}/`),
  getBySlug: (slug: string) => publicFetch(`${API_BASE_URL}/categories/?slug=${slug}`),
};
