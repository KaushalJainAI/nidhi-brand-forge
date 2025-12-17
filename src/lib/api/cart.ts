import { API_BASE_URL, authFetch } from "./config";

export interface CartItem {
  id: string;
  product_id: number;
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

export const cartAPI = {
  get: () => authFetch(`${API_BASE_URL}/cart/`),

  addItem: (data: { product_id: number | string; quantity: number }) =>
    authFetch(`${API_BASE_URL}/cart/add_item/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateItem: (data: { product_id: number | string; quantity: number }) =>
    authFetch(`${API_BASE_URL}/cart/update_item/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  removeItem: (productId: number | string) =>
    authFetch(`${API_BASE_URL}/cart/remove_item/`, {
      method: "DELETE",
      body: JSON.stringify({ product_id: productId }),
    }),

  clear: () =>
    authFetch(`${API_BASE_URL}/cart/clear/`, {
      method: "POST",
    }),

  sync: (items: any[]) =>
    authFetch(`${API_BASE_URL}/cart/sync/`, {
      method: "POST",
      body: JSON.stringify({ items }),
    }),

  getPaymentQR: (receivableAccountId: number, couponCode?: string) =>
    authFetch(`${API_BASE_URL}/cart/payment_qr/`, {
      method: "POST",
      body: JSON.stringify({
        receivable_account_id: receivableAccountId,
        coupon_code: couponCode,
      }),
    }),
};
