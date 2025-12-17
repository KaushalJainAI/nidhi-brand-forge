import { API_BASE_URL, authFetch, publicFetch } from "./config";

export interface Review {
  id: number;
  product_id: number;
  user_name: string;
  rating: number;
  title?: string;
  comment: string;
  created_at: string;
}

export const reviewsAPI = {
  getByProduct: (productId: string) =>
    publicFetch(`${API_BASE_URL}/reviews/?product=${productId}`),

  create: (reviewData: { product_id: number; rating: number; title?: string; comment: string }) =>
    authFetch(`${API_BASE_URL}/reviews/`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    }),
};
