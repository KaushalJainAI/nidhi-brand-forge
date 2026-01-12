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

export interface PaginatedReviewsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Review[];
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
  getByProduct: (productId: number, page: number = 1): Promise<PaginatedReviewsResponse> =>
    publicFetch(`${API_BASE_URL}/reviews/?product=${productId}&page=${page}`),

  getByCombo: (comboId: number, page: number = 1): Promise<PaginatedReviewsResponse> =>
    publicFetch(`${API_BASE_URL}/reviews/?combo=${comboId}&page=${page}`),

  create: (reviewData: CreateReviewData) =>
    authFetch(`${API_BASE_URL}/reviews/`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    }),

  getUserReviews: () =>
    authFetch(`${API_BASE_URL}/reviews/`),
};

