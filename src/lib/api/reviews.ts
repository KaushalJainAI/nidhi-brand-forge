import { API_BASE_URL, authFetch, publicFetch } from "./config";

export interface Review {
  id: number;
  item_type: 'product' | 'combo';
  product?: number;
  combo?: number;
  user_name: string;
  item_name: string;
  rating: number;
  title?: string;
  comment: string;
  is_verified_purchase?: boolean;
  created_at: string;
}

export interface CreateReviewData {
  item_type: 'product' | 'combo';
  product?: number;
  combo?: number;
  rating: number;
  title?: string;
  comment: string;
}

export const reviewsAPI = {
  getByProduct: (productId: number) =>
    publicFetch(`${API_BASE_URL}/reviews/?product=${productId}`),

  getByCombo: (comboId: number) =>
    publicFetch(`${API_BASE_URL}/reviews/?combo=${comboId}`),

  create: (reviewData: CreateReviewData) =>
    authFetch(`${API_BASE_URL}/reviews/`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    }),

  getUserReviews: () =>
    authFetch(`${API_BASE_URL}/reviews/`),
};


