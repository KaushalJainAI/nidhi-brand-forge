import { API_BASE_URL, publicFetch } from "./config";

export interface SearchProduct {
  id: number;
  name: string;
  slug: string;
  type: string;
  category: string;
  spice_form: string;
  price: number;
  original_price: number;
  discount: number;
  weight: string;
  image: string;
  score: number;
  score_type: string;
  in_stock: number;
  is_featured: boolean;
}

export interface SearchResponse {
  query: string;
  total_results: number;
  products: SearchProduct[];
  combos: any[];
  stats: {
    direct_matches: number;
    other_recs: number;
  };
}

export const searchAPI = {
  search: async (query: string, total_results: number = 20): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append("q", query);
    if (total_results) {
      queryParams.append("total_results", total_results.toString());
    }
    const queryString = queryParams.toString();
    return publicFetch(`${API_BASE_URL}/search/?${queryString}`);
  },
};
