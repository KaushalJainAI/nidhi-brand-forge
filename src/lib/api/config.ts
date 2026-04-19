const envApiUrl = import.meta.env.VITE_API_URL;
export const API_BASE_URL = (envApiUrl && envApiUrl.trim() !== "") ? envApiUrl : "/api";

// Debug helper to detect configuration issues in production
if (import.meta.env.PROD && (API_BASE_URL === "/api" || !API_BASE_URL.startsWith('http'))) {
  console.warn("API_BASE_URL is using relative path or default. Ensure VITE_API_URL is set during build.");
}


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

export const getAccessToken = () => null; // Now handled via HttpOnly cookies
export const getRefreshToken = () => null; // Now handled via HttpOnly cookies

let refreshPromise: Promise<boolean> | null = null;

export const refreshAccessToken = async (): Promise<boolean> => {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error("Token refresh failed");
      return true;
    } catch (error) {
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


// config.ts - implementation with HTTPOnly cookies for tokens
export const authFetch = async (url: string, options: RequestInit = {}) => {
  const csrfToken = getCookie("csrftoken");
  const headersObj: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (csrfToken) {
    headersObj['X-CSRFToken'] = csrfToken;
  }
  
  let response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...headersObj,
      ...(options.headers as any),
    },
  });

  // Handle token expiration
  if (response.status === 401) {
    try {
      await refreshAccessToken();
      const freshCsrfToken = getCookie("csrftoken");
      if (freshCsrfToken) {
        headersObj['X-CSRFToken'] = freshCsrfToken;
      }
      
      // Retry with new token cookies automatically included
      response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          ...headersObj,
          ...(options.headers as any),
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
