import { API_BASE_URL, authFetch } from "./config";

export interface PaymentMethod {
  id: number;
  payment_type: "UPI" | "CARD" | "NETBANKING" | "WALLET";
  is_default: boolean;
  is_active: boolean;
  upi_id?: string;
  card_last_four?: string;
  card_brand?: string;
  card_expiry_month?: number;
  card_expiry_year?: number;
  bank_name?: string;
  wallet_provider?: string;
  masked_display: string;
  created_at: string;
}

export const paymentMethodsAPI = {
  getAll: () => authFetch(`${API_BASE_URL}/payment-methods/`),

  getDefault: () => authFetch(`${API_BASE_URL}/payment-methods/default/`),

  getByType: (type: string) =>
    authFetch(`${API_BASE_URL}/payment-methods/by_type/?type=${type}`),

  create: (data: Partial<PaymentMethod>) =>
    authFetch(`${API_BASE_URL}/payment-methods/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<PaymentMethod>) =>
    authFetch(`${API_BASE_URL}/payment-methods/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    authFetch(`${API_BASE_URL}/payment-methods/${id}/`, {
      method: "DELETE",
    }),

  setDefault: (id: number) =>
    authFetch(`${API_BASE_URL}/payment-methods/${id}/set_default/`, {
      method: "POST",
    }),

  getStats: () => authFetch(`${API_BASE_URL}/payment-methods/stats/`),
};
