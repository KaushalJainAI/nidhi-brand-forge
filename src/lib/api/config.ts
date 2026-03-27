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
        credentials: "include",
        body: JSON.stringify({ refresh: refreshToken }),
      });
      if (!response.ok) throw new Error("Token refresh failed");
      const data = await response.json();
      localStorage.setItem("access_token", data.access);
      if (data.refresh) {
        localStorage.setItem("refresh_token", data.refresh);
      }
      return data.access;
    } catch (error) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth:unauthorized"));
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
};

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};


// config.ts - CORRECT implementation with token refresh
export const authFetch = async (url: string, options: RequestInit = {}) => {
  let token = getAccessToken();
  const csrfToken = getCookie("csrftoken");
  
  let response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(csrfToken && { 'X-CSRFToken': csrfToken }),
      ...options.headers,
    },
  });

  // Handle token expiration
  if (response.status === 401 && getRefreshToken()) {
    try {
      token = await refreshAccessToken();
      const freshCsrfToken = getCookie("csrftoken");
      
      // Retry with new token
      response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(freshCsrfToken && { 'X-CSRFToken': freshCsrfToken }),
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
  const csrfToken = getCookie("csrftoken");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(csrfToken && { 'X-CSRFToken': csrfToken }),
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers, credentials: "include" });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new APIError(response.status, response.statusText, errorData);
  }
  if (response.status === 204) return null;
  return response.json();
};
