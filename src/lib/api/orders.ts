import { API_BASE_URL, authFetch } from "./config";

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: number;
  order_number: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  shipping_address: string;
  created_at: string;
  updated_at: string;
}

export const ordersAPI = {
  getAll: () => authFetch(`${API_BASE_URL}/orders/`),

  getById: (id: string) => authFetch(`${API_BASE_URL}/orders/${id}/`),

  create: (orderData: any) =>
    authFetch(`${API_BASE_URL}/orders/`, {
      method: "POST",
      body: JSON.stringify(orderData),
    }),

  cancel: (id: string) =>
    authFetch(`${API_BASE_URL}/orders/${id}/cancel/`, {
      method: "POST",
    }),
};
