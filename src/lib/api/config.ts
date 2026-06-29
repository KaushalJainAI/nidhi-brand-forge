const envApiUrl = import.meta.env.VITE_API_URL;
export const API_BASE_URL = (envApiUrl && envApiUrl.trim() !== "") ? envApiUrl : "/api";

// Debug helper to detect configuration issues in production
if (import.meta.env.PROD && (API_BASE_URL === "/api" || !API_BASE_URL.startsWith('http'))) {
  console.warn("API_BASE_URL is using relative path or default. Ensure VITE_API_URL is set during build.");
}


/** Shape of the JSON body DRF returns on error responses (all fields optional). */
interface ApiErrorBody {
  error?: string;
  detail?: string;
  message?: string;
  non_field_errors?: string[];
  [key: string]: unknown;
}

/**
 * Some endpoints wrap their payload in a `{ data: ... }` envelope while others
 * return it directly. `unwrap` normalizes both into the bare payload `T`.
 */
export interface ApiEnvelope<T> {
  data: T;
}

/** Standard DRF paginated list response. */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const unwrap = <T>(res: ApiEnvelope<T> | T): T =>
  res && typeof res === 'object' && 'data' in res
    ? (res as ApiEnvelope<T>).data
    : (res as T);

export class APIError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, statusText: string, data: unknown) {
    let errorMessage = statusText;

    // Intelligently extract the best error message from the backend response
    if (typeof data === 'string') {
      errorMessage = data;
    } else if (data && typeof data === 'object') {
      const body = data as ApiErrorBody;
      if (body.error) {
        errorMessage = body.error;
      } else if (body.detail) {
        errorMessage = body.detail;
      } else if (Array.isArray(body.non_field_errors) && body.non_field_errors.length > 0) {
        errorMessage = body.non_field_errors[0];
      } else if (body.message) {
        errorMessage = body.message;
      } else {
        // Fallback: extract the first field exception
        const firstKey = Object.keys(body)[0];
        if (firstKey) {
          const value = body[firstKey];
          if (Array.isArray(value) && value.length > 0) {
            // e.g. "email: This field is required."
            errorMessage = `${firstKey.charAt(0).toUpperCase() + firstKey.slice(1).replace(/_/g, ' ')}: ${value[0]}`;
          } else if (typeof value === 'string') {
            errorMessage = value;
          }
        }
      }
    }

    super(errorMessage);
    this.status = status;
    this.data = data;
  }
}

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
// Active storefront language, read from the same localStorage key react-i18next
// uses. Sent as X-Language so backend modeltranslation returns translated
// product/category content (falls back to English when no translation exists).
const getLangHeader = (): Record<string, string> => {
  try {
    const lang = localStorage.getItem("site_lang");
    return lang ? { "X-Language": lang } : {};
  } catch {
    return {};
  }
};

export const authFetch = async <T = unknown>(url: string, options: RequestInit = {}): Promise<T> => {
  const csrfToken = getCookie("csrftoken");
  const headersObj: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getLangHeader(),
  };
  if (csrfToken) {
    headersObj['X-CSRFToken'] = csrfToken;
  }

  const optionHeaders = options.headers as Record<string, string> | undefined;

  let response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...headersObj,
      ...optionHeaders,
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
          ...optionHeaders,
        },
      });
    } catch (error) {
      // If refresh fails, refreshAccessToken handles the logout and redirect
    }
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("user");
    }
    const errorData = await response.json().catch(() => ({}));
    throw new APIError(response.status, response.statusText, errorData);
  }

  if (response.status === 204) return null as T;

  // Return parsed JSON directly
  return response.json() as Promise<T>;
};


export const publicFetch = async <T = unknown>(url: string, options: RequestInit = {}): Promise<T> => {
  const csrfToken = getCookie("csrftoken");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getLangHeader(),
    ...(csrfToken && { 'X-CSRFToken': csrfToken }),
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers, credentials: "include" });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new APIError(response.status, response.statusText, errorData);
  }
  if (response.status === 204) return null as T;
  return response.json() as Promise<T>;
};
