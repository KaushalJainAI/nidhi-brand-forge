// lib/api/orders.ts
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
  getAll: async (): Promise<Order[]> => {
    const res = await authFetch(`${API_BASE_URL}/orders/`);
    return (res as any).data ?? res;
  },

  getById: async (id: string): Promise<Order> => {
    const res = await authFetch(`${API_BASE_URL}/orders/${id}/`);
    return (res as any).data ?? res;
  },

  create: async (orderData: any): Promise<Order> => {
    const res = await authFetch(`${API_BASE_URL}/orders/`, {
      method: "POST",
      body: JSON.stringify(orderData),
    });
    return (res as any).data ?? res;
  },

  cancel: async (id: number): Promise<Order> => {
    const res = await authFetch(`${API_BASE_URL}/orders/${id}/cancel/`, {
      method: "POST",
    });
    return (res as any).data ?? res;
  },

  validateCoupon: async (couponCode: string) => {
    const res = await authFetch(`${API_BASE_URL}/orders/validate_coupon/`, {
      method: "POST",
      body: JSON.stringify({ coupon_code: couponCode }),
    });
    return (res as any).data ?? res;
  },
};
