const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// ------------ Error Class -------------
class APIError extends Error {
  status: number;
  data: any;
  constructor(status: number, statusText: string, data: any) {
    super(statusText);
    this.status = status;
    this.data = data;
  }
}

// ------------ Helpers -------------
const getAccessToken = () => localStorage.getItem("access_token");
const getRefreshToken = () => localStorage.getItem("refresh_token");

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token available");
      const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      if (!response.ok) throw new Error("Token refresh failed");
      const data = await response.json();
      localStorage.setItem("access_token", data.access);
      return data.access;
    } catch (error) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
};

const authFetch = async (url: string, options: RequestInit = {}): Promise<any> => {
  const makeRequest = async (token: string | null) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      const retryHeaders: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${newToken}`,
        ...options.headers,
      };
      const retryResponse = await fetch(url, { ...options, headers: retryHeaders });
      if (!retryResponse.ok) {
        const errorData = await retryResponse.json().catch(() => ({}));
        throw new APIError(retryResponse.status, retryResponse.statusText, errorData);
      }
      return retryResponse.json();
    }
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(response.status, response.statusText, errorData);
    }
    if (response.status === 204) return null;
    return response.json();
  };
  const token = getAccessToken();
  return makeRequest(token);
};

// ------------ Main APIs -------------

export const productsAPI = {
  getAll: () => authFetch(`${API_BASE_URL}/products/`),
  getById: (id: string) => authFetch(`${API_BASE_URL}/products/${id}/`),
  getByCategory: (categoryId: string) =>
    authFetch(`${API_BASE_URL}/products/?category=${categoryId}`),
};

export const categoriesAPI = {
  getAll: () => authFetch(`${API_BASE_URL}/categories/`),
};

export const cartAPI = {
  get: () => authFetch(`${API_BASE_URL}/cart/`), // GET cart list
  addItem: (data: { id: string; quantity: number }) =>
    authFetch(`${API_BASE_URL}/cart/add_item/`, {
      method: "POST",
      body: JSON.stringify({ product_id: data.id, quantity: data.quantity }),
    }),
  updateItem: (data: { id: string; quantity: number }) =>
    authFetch(`${API_BASE_URL}/cart/update_item/`, {
      method: "POST",
      body: JSON.stringify({ product_id: data.id, quantity: data.quantity }),
    }),
  removeItem: (data: { id: string }) =>
    authFetch(`${API_BASE_URL}/cart/remove_item/`, {
      method: "DELETE",
      body: JSON.stringify({ product_id: data.id }),
    }),
  clear: () =>
    authFetch(`${API_BASE_URL}/cart/clear/`, {
      method: "POST"
    }),
  sync: (items: any[]) =>
    authFetch(`${API_BASE_URL}/cart/sync/`, {
      method: "POST",
      body: JSON.stringify({ items }),
    }),
};


export const ordersAPI = {
  getAll: () => authFetch(`${API_BASE_URL}/orders/`),
  getById: (id: string) => authFetch(`${API_BASE_URL}/orders/${id}/`),
  create: (orderData: any) =>
    authFetch(`${API_BASE_URL}/orders/`, {
      method: "POST",
      body: JSON.stringify(orderData),
    }),
};

export const reviewsAPI = {
  getByProduct: (productId: string) =>
    authFetch(`${API_BASE_URL}/reviews/?product=${productId}`),
  create: (reviewData: any) =>
    authFetch(`${API_BASE_URL}/reviews/`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    }),
};

export const paymentMethodsAPI = {
  getAll: () => authFetch(`${API_BASE_URL}/payment-methods/`),
  getDefault: () => authFetch(`${API_BASE_URL}/payment-methods/default/`),
  getByType: (type: string) =>
    authFetch(`${API_BASE_URL}/payment-methods/by_type/?type=${type}`),
  create: (data: any) =>
    authFetch(`${API_BASE_URL}/payment-methods/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
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

export const userAPI = {
  getProfile: () => authFetch(`${API_BASE_URL}/auth/profile/`),
  updateProfile: (data: any) =>
    authFetch(`${API_BASE_URL}/auth/profile/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  changePassword: async (old_password: string, new_password: string) => {
    const token = getAccessToken();
    const response = await fetch(`${API_BASE_URL}/auth/change-password/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ old_password, new_password }),
    });
    const data = await response.json();
    if (!response.ok) throw data;
    return data;
  },
  register: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(response.status, response.statusText, errorData);
    }
    return response.json();
  },
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(response.status, response.statusText, errorData);
    }
    const data = await response.json();
    if (data.access) {
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
    }
    return data;
  },
};

export const favoritesAPI = {
  get: async () => {
    try {
      return await authFetch(`${API_BASE_URL}/favorites/`);
    } catch (error) {
      const stored = localStorage.getItem("favorites");
      return stored ? JSON.parse(stored) : [];
    }
  },
  add: async (productId: string) => {
    try {
      return await authFetch(`${API_BASE_URL}/favorites/`, {
        method: "POST",
        body: JSON.stringify({ product_id: productId }),
      });
    } catch {
      const stored = localStorage.getItem("favorites");
      const favorites = stored ? JSON.parse(stored) : [];
      if (!favorites.includes(productId)) {
        favorites.push(productId);
        localStorage.setItem("favorites", JSON.stringify(favorites));
      }
      return { success: true };
    }
  },
  remove: async (productId: string) => {
    try {
      return await authFetch(`${API_BASE_URL}/favorites/${productId}/`, {
        method: "DELETE",
      });
    } catch {
      const stored = localStorage.getItem("favorites");
      const favorites = stored ? JSON.parse(stored) : [];
      const updated = favorites.filter((id: string) => id !== productId);
      localStorage.setItem("favorites", JSON.stringify(updated));
      return { success: true };
    }
  },
};
