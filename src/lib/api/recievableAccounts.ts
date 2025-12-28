import { API_BASE_URL, authFetch } from "./config";

// Payment account API - for authenticated users during checkout
export const receivableAccountsAPI = {
  // Get the default payment account for checkout
  getPaymentAccount: async () => {
    try {
      const data = await authFetch(`${API_BASE_URL}/payment-account/`);
      return data;
    } catch (error) {
      console.error('Get payment account error:', error);
      throw error;
    }
  },
  
  // Alias for backward compatibility
  getAll: async () => {
    try {
      // Use the new authenticated endpoint instead of admin-only endpoint
      const data = await authFetch(`${API_BASE_URL}/payment-account/`);
      // Return as array for backward compatibility
      return [data];
    } catch (error) {
      console.error('Get payment account error:', error);
      throw error;
    }
  },
};
