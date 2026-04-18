import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { userAPI } from "@/lib/api";

interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
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
  googleLogin: (accessToken: string) => Promise<boolean>;
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
      const cachedUser = localStorage.getItem("user");

      try {
        // Try to get fresh user data using HttpOnly cookies
        const userData = await userAPI.getProfile();
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error: any) {
        const status = error?.status || error?.response?.status;
        
        if (status === 401) {
          localStorage.removeItem("user");
          setUser(null);
        } else if (cachedUser) {
          setUser(JSON.parse(cachedUser));
        }
      }
      setIsLoading(false);
    };

    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
      // Optional: Redirect or show toast here using your app's router/toast setup
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
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
      toast.error("Login failed. Please check your credentials.");
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

  const googleLogin = async (accessToken: string): Promise<boolean> => {
    try {
      const data = await userAPI.googleLogin(accessToken);
      if (data.access) {
        const userData = await userAPI.getProfile();
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        toast.success("Login with Google successful!");
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Google login error:", error);
      const errorMessage = error.data?.detail || error.data?.message || "Google login failed";
      toast.error(errorMessage);
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("user");
    try {
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/auth/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (e) {
      console.error(e);
    }
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

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoggedIn, 
        isLoading, 
        login, 
        logout, 
        signup, 
        googleLogin,
        refreshUser 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
