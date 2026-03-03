export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export class APIError extends Error {
  status: number;
  data: any;
  
  constructor(status: number, statusText: string, data: any) {
    let errorMessage = statusText;

    // Intelligently extract the best error message from the backend response
    if (data) {
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data.error) {
        errorMessage = data.error;
      } else if (data.detail) {
        errorMessage = data.detail;
      } else if (data.non_field_errors && Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
        errorMessage = data.non_field_errors[0];
      } else if (data.message) {
        errorMessage = data.message;
      } else if (typeof data === 'object') {
        // Fallback: extract the first field exception
        const keys = Object.keys(data);
        if (keys.length > 0) {
          const firstKey = keys[0];
          if (Array.isArray(data[firstKey]) && data[firstKey].length > 0) {
            // e.g. "email: This field is required."
            errorMessage = `${firstKey.charAt(0).toUpperCase() + firstKey.slice(1).replace(/_/g, ' ')}: ${data[firstKey][0]}`;
          } else if (typeof data[firstKey] === 'string') {
            errorMessage = data[firstKey];
          }
        }
      }
    }

    super(errorMessage);
    this.status = status;
    this.data = data;
  }
}

export const getAccessToken = () => localStorage.getItem("access_token");
export const getRefreshToken = () => localStorage.getItem("refresh_token");

let refreshPromise: Promise<string> | null = null;

export const refreshAccessToken = async (): Promise<string> => {
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

// config.ts - CORRECT implementation with token refresh
export const authFetch = async (url: string, options: RequestInit = {}) => {
  let token = getAccessToken();
  
  let response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  // Handle token expiration
  if (response.status === 401 && getRefreshToken()) {
    try {
      token = await refreshAccessToken();
      
      // Retry with new token
      response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });
    } catch (error) {
      // If refresh fails, refreshAccessToken handles the logout and redirect
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new APIError(response.status, response.statusText, errorData);
  }

  if (response.status === 204) return null;

  // Return parsed JSON directly
  return response.json();
};


export const publicFetch = async (url: string, options: RequestInit = {}): Promise<any> => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new APIError(response.status, response.statusText, errorData);
  }
  if (response.status === 204) return null;
  return response.json();
};
