const API_BASE_URL = "http://localhost:8000/api";

// Helper to get auth token
const getAuthToken = () => localStorage.getItem("accessToken");

// Helper for authenticated requests
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
};

// Products API
export const productsAPI = {
  getAll: () => authFetch(`${API_BASE_URL}/products/`),
  getById: (id: string) => authFetch(`${API_BASE_URL}/products/${id}/`),
  getByCategory: (categoryId: string) => 
    authFetch(`${API_BASE_URL}/products/?category=${categoryId}`),
};

// Categories API
export const categoriesAPI = {
  getAll: () => authFetch(`${API_BASE_URL}/categories/`),
};

export const cartAPI = {
  get: async () => {
    const response = await fetch(`${API_BASE_URL}/cart/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.json();
  },

  addItem: async (data: { id: string; quantity: number }) => {
    const response = await fetch(`${API_BASE_URL}/cart/add_item/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product_id: data.id, quantity: data.quantity }),
    });
    return response.json();
  },

  updateItem: async (data: { id: string; quantity: number }) => {
    const response = await fetch(`${API_BASE_URL}/cart/update_item/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product_id: data.id, quantity: data.quantity }),
    });
    return response.json();
  },

  removeItem: async (data: { id: string }) => {
    const response = await fetch(`${API_BASE_URL}/cart/remove_item/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product_id: data.id }),
    });
    return response.json();
  },

  sync: async (items: any[]) => {
    const response = await fetch(`${API_BASE_URL}/cart/sync/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });
    return response.json();
  },
};


// Orders API
export const ordersAPI = {
  getAll: () => authFetch(`${API_BASE_URL}/orders/`),
  getById: (id: string) => authFetch(`${API_BASE_URL}/orders/${id}/`),
  create: (orderData: any) =>
    authFetch(`${API_BASE_URL}/orders/`, {
      method: "POST",
      body: JSON.stringify(orderData),
    }),
};

// Reviews API
export const reviewsAPI = {
  getByProduct: (productId: string) =>
    authFetch(`${API_BASE_URL}/reviews/?product=${productId}`),
  create: (reviewData: any) =>
    authFetch(`${API_BASE_URL}/reviews/`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    }),
};

// Favorites (using a custom endpoint if available, otherwise local storage)
export const favoritesAPI = {
  get: async () => {
    try {
      return await authFetch(`${API_BASE_URL}/favorites/`);
    } catch {
      // Fallback to localStorage if endpoint doesn't exist
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
      // Fallback to localStorage
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
      // Fallback to localStorage
      const stored = localStorage.getItem("favorites");
      const favorites = stored ? JSON.parse(stored) : [];
      const updated = favorites.filter((id: string) => id !== productId);
      localStorage.setItem("favorites", JSON.stringify(updated));
      return { success: true };
    }
  },
};
