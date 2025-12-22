import { API_BASE_URL, APIError, authFetch, getAccessToken } from "./config";

// In your API file (e.g., api/index.ts or separate file)
export const receivableAccountsAPI = {
  getAll: async () => {
    try {
      const data = await authFetch(`${API_BASE_URL}/receivable-accounts/`);
      return data;
    } catch (error) {
      console.error('Get receivable accounts error:', error);
      throw error;
    }
  },
};
