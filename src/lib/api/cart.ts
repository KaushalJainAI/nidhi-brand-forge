import { API_BASE_URL, authFetch } from "./config";

export interface CartItem {
  id: number;
  product_id: number;
  item_type: "product" | "combo";
  name: string;
  image: string;
  price: number;
  quantity: number;
  weight?: string;
}

export interface CartSummary {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

export interface PaymentQRResponse {
  qr_code_base64: string;
  upi_uri: string;
  amount: number;
  discount_percent: number;
  summary: {
    original: number;
    discount: number;
    final: number;
  };
}

export const cartAPI = {
  get: async () => {
    try {
      const data = await authFetch(`${API_BASE_URL}/cart/`);
      return data;
    } catch (error) {
      console.error('Get cart error:', error);
      throw error;
    }
  },

  addItem: async (data: { 
    product_id: number; 
    item_type: "product" | "combo";
    quantity: number;
  }) => {
    try {
      const result = await authFetch(`${API_BASE_URL}/cart/add_item/`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return result;
    } catch (error) {
      console.error('Add item error:', error);
      throw error;
    }
  },

  updateItem: async (data: { 
    product_id: number; 
    item_type: "product" | "combo";
    quantity: number;
  }) => {
    try {
      const result = await authFetch(`${API_BASE_URL}/cart/update_item/`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return result;
    } catch (error) {
      console.error('Update item error:', error);
      throw error;
    }
  },

  removeItem: async (data: {
    product_id: number;
    item_type: "product" | "combo";
  }) => {
    try {
      const result = await authFetch(`${API_BASE_URL}/cart/remove_item/`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return result;
    } catch (error) {
      console.error('Remove item error:', error);
      throw error;
    }
  },

  clear: async () => {
    try {
      const result = await authFetch(`${API_BASE_URL}/cart/clear/`, {
        method: "POST",
      });
      return result;
    } catch (error) {
      console.error('Clear cart error:', error);
      throw error;
    }
  },

  sync: async (items: Array<{
    product_id: number;
    item_type: "product" | "combo";
    quantity: number;
  }>) => {
    try {
      console.log('Syncing items to backend:', items);
      
      const data = await authFetch(`${API_BASE_URL}/cart/sync/`, {
        method: "POST",
        body: JSON.stringify({ items }),
      });
      
      console.log('Sync response data:', data);
      return data;
    } catch (error) {
      console.error('Cart sync error:', error);
      throw error;
    }
  },

  getPaymentQR: async (
    receivableAccountId: number, 
    couponCode?: string
  ): Promise<PaymentQRResponse> => {
    try {
      const payload: any = {
        receivable_account_id: receivableAccountId,
      };
      
      // Only include coupon_code if it's provided and not empty
      if (couponCode && couponCode.trim()) {
        payload.coupon_code = couponCode.trim();
      }
      
      const result = await authFetch(`${API_BASE_URL}/cart/payment_qr/`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      
      return result;
    } catch (error) {
      console.error('Get payment QR error:', error);
      throw error;
    }
  },
};
