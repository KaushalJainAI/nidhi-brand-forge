import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { userAPI } from "@/lib/api";

interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (userData: any) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access_token");
      const cachedUser = localStorage.getItem("user");

      if (token) {
        try {
          // Try to get fresh user data
          const userData = await userAPI.getProfile();
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } catch (error: any) {
          // Check if error is 401 (token expired/invalid)
          const status = error?.status || error?.response?.status;
          
          if (status === 401) {
            // Token is expired/invalid - clear everything and logout
            console.log("Token expired, logging out...");
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user");
            setUser(null);
          } else if (cachedUser) {
            // For other errors (network issues), use cached user
            setUser(JSON.parse(cachedUser));
          } else {
            // No cached user and can't fetch - clear tokens
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await userAPI.login(email, password);

      if (data.access) {
        // Get user profile
        try {
          const userData = await userAPI.getProfile();
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          toast.success("Login successful!");
          return true;
        } catch (profileError) {
          console.error("Failed to fetch profile:", profileError);
          // Even if profile fetch fails, login was successful
          toast.success("Login successful!");
          return true;
        }
      }
      
      toast.error("Invalid credentials");
      return false;
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error.data?.detail || error.data?.message || "Login failed";
      toast.error(errorMessage);
      return false;
    }
  };

  const signup = async (userData: any): Promise<boolean> => {
    try {
      const response = await userAPI.register(userData);
      toast.success("Registration successful! Please login.");
      return true;
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMessage = error.data?.detail || error.data?.message || "Registration failed";
      toast.error(errorMessage);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully!");
  };

  const refreshUser = async () => {
    try {
      const userData = await userAPI.getProfile();
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  const isLoggedIn = !!user && !!localStorage.getItem("access_token");

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoggedIn, 
        isLoading, 
        login, 
        logout, 
        signup, 
        refreshUser 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
