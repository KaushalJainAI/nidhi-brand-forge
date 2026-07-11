// lib/api/orders.ts
import { API_BASE_URL, authFetch, unwrap, ApiEnvelope } from "./config";

export interface CreateOrderPayload {
  shipping_address: string;
  phone_number?: string;
  payment_method?: string;
  coupon_code?: string;
}

export interface CouponValidationResponse {
  valid?: boolean;
  message?: string;
  error?: string;
  coupon_code?: string;
  discount_amount?: number;
  discount_percent?: number;
  discount_type?: string;
  discount_value?: number;
  shipping_charge?: number;
  subtotal?: number;
  tax?: number;
  total_amount?: number;
  savings?: number;
}

export interface OrderItem {
  id: number;
  item_type: 'product' | 'combo';
  product_id: number | null;
  combo_id: number | null;
  product_name: string;
  image: string | null;
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
  tracking_number?: string;
  payment_method?: string;
  payment_status?: "pending" | "processing" | "paid" | "failed" | "refunded";
  created_at: string;
  updated_at: string;
}

// The order-placement response wraps the created order plus the top-level fields
// the checkout flow needs immediately: order_id + total (a zero-total coupon
// order comes back already paid, so no gateway call is required).
export interface CreateOrderResult {
  message: string;
  order_id: number;
  order_number: string;
  total_amount: number;
  order: Order;
}

export const ordersAPI = {
  getAll: async (): Promise<Order[]> => {
    const res = await authFetch<ApiEnvelope<Order[]> | Order[]>(`${API_BASE_URL}/orders/`);
    return unwrap(res);
  },

  getById: async (id: string): Promise<Order> => {
    const res = await authFetch<ApiEnvelope<Order> | Order>(`${API_BASE_URL}/orders/${id}/`);
    return unwrap(res);
  },

  create: async (orderData: CreateOrderPayload): Promise<CreateOrderResult> => {
    // The placement endpoint returns a wrapper (order_id + total_amount + the
    // created order), not a bare Order — the checkout flow needs order_id and
    // the total to decide whether a Razorpay call is required.
    return authFetch<CreateOrderResult>(`${API_BASE_URL}/orders/`, {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },

  cancel: async (id: number): Promise<Order> => {
    const res = await authFetch<ApiEnvelope<Order> | Order>(`${API_BASE_URL}/orders/${id}/cancel/`, {
      method: "POST",
    });
    return unwrap(res);
  },

  validateCoupon: async (couponCode: string): Promise<CouponValidationResponse> => {
    const res = await authFetch<ApiEnvelope<CouponValidationResponse> | CouponValidationResponse>(
      `${API_BASE_URL}/orders/validate_coupon/`,
      {
        method: "POST",
        body: JSON.stringify({ coupon_code: couponCode }),
      },
    );
    return unwrap(res);
  },

  // Download the PDF invoice/bill for an order and trigger a browser download.
  // The endpoint returns a binary PDF (not JSON), so we fetch the blob directly
  // instead of going through authFetch.
  downloadInvoice: async (id: number, orderNumber?: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/orders/${id}/invoice/`, {
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("Failed to download invoice");
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${orderNumber || `order-${id}`}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};
