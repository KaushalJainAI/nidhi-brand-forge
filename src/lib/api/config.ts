export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export class APIError extends Error {
  status: number;
  data: any;
  constructor(status: number, statusText: string, data: any) {
    super(statusText);
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

export const authFetch = async (url: string, options: RequestInit = {}): Promise<any> => {
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
