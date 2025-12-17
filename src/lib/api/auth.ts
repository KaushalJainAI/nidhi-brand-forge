import { API_BASE_URL, APIError, authFetch, getAccessToken } from "./config";

export const authAPI = {
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
};
